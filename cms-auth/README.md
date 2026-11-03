# cms-auth: GitHub sign-in for the website editor

A small DigitalOcean Function that lets editors sign in to `/admin/` (Sveltia CMS) with their GitHub account. It's a port of [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), a Cloudflare Worker, to DigitalOcean Functions, copied from `../kobo.ngo/cms-auth`.

| | |
|---|---|
| DO account | Kobo Team |
| Functions namespace | `hda-website-cms` (fra1), `fn-81cc2b29-d395-4728-9494-2c16f53bf4c0` |
| Function URL (`base_url` in `public/admin/config.yml`) | `https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-81cc2b29-d395-4728-9494-2c16f53bf4c0/cms/auth` |
| OAuth callback URL | the function URL + `/callback` |

## How it works

1. The CMS opens a popup at `<function>/auth?provider=github&site_id=<host>`.
2. The function checks `site_id` against `ALLOWED_DOMAINS`, sets a one-time state cookie and redirects to GitHub.
3. GitHub redirects back to `<function>/callback`. The function checks that the state matches the cookie (CSRF protection) and exchanges the code for a token.
4. The callback page hands the token to the CMS window with `postMessage`, but only if that window's origin is in `ALLOWED_DOMAINS`.

The token stays in the editor's browser. Nothing is stored server-side.

## Setup

1. **Create a GitHub OAuth app:** Settings → Developer settings → OAuth Apps → New OAuth App. While the site's repository is `joshuaberetta/hda-website`, a personal OAuth app works. Move it to an organisation when the repository moves.
   - Application name: `HDA website editor` (editors see this when they first sign in)
   - Homepage URL: `https://hda.kobolabs.dev`
   - Authorization callback URL:
     `https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-81cc2b29-d395-4728-9494-2c16f53bf4c0/cms/auth/callback`
   - Generate a client secret.
2. **Put the credentials in `cms-auth/.env`**. This file is gitignored; never commit it.
   ```sh
   GITHUB_CLIENT_ID=Ov23li…
   GITHUB_CLIENT_SECRET=…
   ALLOWED_DOMAINS=hda.kobolabs.dev,localhost
   ```
3. **Deploy:**
   ```sh
   doctl serverless connect hda-website-cms
   doctl serverless deploy cms-auth
   ```
   `doctl` talks to one namespace at a time. To deploy kobo.ngo's function afterwards, `doctl serverless connect kobo-ngo-cms` first.
4. Editors need **write access** to the GitHub repository.

## Testing without a browser

```sh
doctl serverless functions invoke cms/auth -p __ow_path:/auth -p site_id:hda.kobolabs.dev   # 302 to GitHub
doctl serverless functions invoke cms/auth -p __ow_path:/auth -p site_id:evil.example       # UNSUPPORTED_DOMAIN
doctl serverless activations logs --function cms/auth --limit 5                              # recent logs
```
