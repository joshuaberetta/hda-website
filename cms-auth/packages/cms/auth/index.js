// GitHub OAuth for Sveltia CMS, as a DigitalOcean Function.
//
// A port of https://github.com/sveltia/sveltia-cms-auth (a Cloudflare
// Worker). The CMS opens a popup at <function-url>/auth; we send the user to
// GitHub, GitHub redirects back to <function-url>/callback, and we hand the
// access token to the CMS window via postMessage.
//
// Environment (set in cms-auth/.env, see README):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET  from the GitHub OAuth app
//   ALLOWED_DOMAINS  comma-separated hostnames that may use this login,
//                    wildcards allowed: "hda.kobolabs.dev, localhost"

const crypto = require('node:crypto');

const PROVIDER = 'github';
const COOKIE = 'cms-auth-state';

function hostMatches(hostname, patterns) {
  return patterns.some((pattern) => {
    const p = pattern.trim().toLowerCase();
    if (!p) return false;
    if (p.startsWith('*.')) return hostname.endsWith(p.slice(1));
    return hostname === p;
  });
}

function allowedDomains() {
  return (process.env.ALLOWED_DOMAINS || '').split(',');
}

function html(body, extraHeaders = {}) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
    body,
  };
}

/**
 * The popup announces itself to the CMS window, waits for the CMS to echo
 * back, then posts the result, but only to an origin on the allowlist.
 */
function resultPage({ token, error, errorCode }) {
  const state = error ? 'error' : 'success';
  const content = error ? { provider: PROVIDER, error, errorCode } : { provider: PROVIDER, token };
  const message = JSON.stringify(`authorization:${PROVIDER}:${state}:${JSON.stringify(content)}`);
  const allowed = JSON.stringify(allowedDomains());
  const script = `
    (() => {
      const allowed = ${allowed};
      const ok = (host) => allowed.some((p) => {
        p = p.trim().toLowerCase();
        return p && (p.startsWith('*.') ? host.endsWith(p.slice(1)) : host === p);
      });
      window.addEventListener('message', ({ data, origin }) => {
        if (data !== 'authorizing:${PROVIDER}') return;
        if (!ok(new URL(origin).hostname)) return;
        window.opener?.postMessage(${message}, origin);
      });
      window.opener?.postMessage('authorizing:${PROVIDER}', '*');
    })();
  `.replace(/</g, '\\u003c');
  return html(
    `<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head>` +
      `<body><p>${error ? 'Sign-in failed. You can close this window.' : 'Signed in. You can close this window.'}</p>` +
      `<script>${script}</script></body></html>`,
    // Clear the one-time state cookie.
    { 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` },
  );
}

function readCookie(headers, name) {
  const cookie = headers?.cookie || '';
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

function selfUrl() {
  // e.g. https://faas-fra1-….doserverless.co/api/v1/web/<namespace>/cms/auth
  // Don't use the request's Host header: behind DO's gateway it is an
  // internal hostname, which GitHub rejects as an unregistered redirect_uri.
  return `${process.env.__OW_API_HOST}/api/v1/web/${process.env.__OW_NAMESPACE}/cms/auth`;
}

function startAuth(args) {
  const { GITHUB_CLIENT_ID } = process.env;
  const siteId = String(args.site_id || '').toLowerCase();

  if (args.provider && args.provider !== PROVIDER) {
    return resultPage({ error: 'Unsupported provider.', errorCode: 'UNSUPPORTED_BACKEND' });
  }
  if (!siteId || !hostMatches(siteId, allowedDomains())) {
    return resultPage({ error: 'This site is not allowed to use this login.', errorCode: 'UNSUPPORTED_DOMAIN' });
  }
  if (!GITHUB_CLIENT_ID) {
    return resultPage({ error: 'OAuth app is not configured.', errorCode: 'MISCONFIGURED_CLIENT' });
  }

  const state = crypto.randomBytes(24).toString('hex');
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${selfUrl()}/callback`,
    scope: args.scope || 'repo,user',
    state,
  });
  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `${COOKIE}=${state}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  };
}

async function finishAuth(args) {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  const expected = readCookie(args.__ow_headers, COOKIE);

  if (!args.code || !args.state) {
    return resultPage({ error: 'Missing code or state.', errorCode: 'AUTH_CODE_REQUEST_FAILED' });
  }
  if (!expected || expected !== args.state) {
    return resultPage({ error: 'Sign-in expired or was tampered with. Please try again.', errorCode: 'CSRF_DETECTED' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: args.code,
        redirect_uri: `${selfUrl()}/callback`,
      }),
    });
    const data = await response.json();
    if (!data.access_token) {
      return resultPage({ error: data.error_description || 'GitHub did not return a token.', errorCode: 'TOKEN_REQUEST_FAILED' });
    }
    return resultPage({ token: data.access_token });
  } catch {
    return resultPage({ error: 'Could not reach GitHub.', errorCode: 'TOKEN_REQUEST_FAILED' });
  }
}

async function main(args) {
  const path = (args.__ow_path || '').replace(/\/+$/, '');
  if (path === '/auth') return startAuth(args);
  if (path === '/callback') return finishAuth(args);
  return html('<!doctype html><p>HDA website editor sign-in service.</p>');
}

exports.main = main;
