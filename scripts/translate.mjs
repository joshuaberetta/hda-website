// Keeps content/**/*.{fr,es,ar}.{md,yml} in step with the English files.
// See LOCALISATION.md for the workflow. Ported from kobo.ngo.
//
//   npm run translate              translate anything missing, requested or out of date
//   npm run translate -- status    list every translation and whether it's current
//   npm run translate -- stamp <files…>   mark translations as matching today's English
//   npm run translate -- scaffold  create missing translation files with the English text
//   npm run translate -- check     find layout drift and text left in English
//   npm run translate -- ci <changed files…>   what the GitHub Action runs after a push
//
// Options: --locale es   only one language
//          --only pages/about.md   only these English files (repeatable)
//          --force        retranslate machine translations even if current
//
// Translation needs ANTHROPIC_API_KEY. TRANSLATE_MODEL overrides the model.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  TRANSLATIONS,
  applyStrings,
  config,
  content,
  localeOf,
  mismatches,
  readEntry,
  sourceFiles,
  sourceHash,
  sourceOf,
  strings,
  translatableShape,
  translationOf,
  writeEntry,
} from './i18n.mjs';

const MODEL = process.env.TRANSLATE_MODEL ?? 'claude-opus-5-5';
const today = () => new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const flag = (name) => {
  const values = [];
  for (let i = 0; i < args.length; i++) if (args[i] === `--${name}`) values.push(args[i + 1]);
  return values;
};
const WITH_VALUE = ['--locale', '--only'];
const positional = args.filter((a, i) => !a.startsWith('--') && !WITH_VALUE.includes(args[i - 1]));
const command = ['status', 'stamp', 'scaffold', 'check', 'ci'].includes(positional[0]) ? positional.shift() : 'run';
// Paths work relative to the repo (content/pages/about.md) or to content/ (pages/about.md).
const rel = (f) => f.replace(/^\.?\/?content\//, '');
const locales = flag('locale').length ? flag('locale') : TRANSLATIONS;
const only = new Set(flag('only').map(rel));
const force = args.includes('--force');

const exists = (file) => fs.existsSync(path.join(content, file));
const sources = () => sourceFiles().filter((f) => !only.size || only.has(f));

/** Where a translation stands relative to its English file. */
function state(file, locale) {
  const target = translationOf(file, locale);
  if (!exists(target)) return { target, status: 'missing' };
  const en = readEntry(file);
  const meta = readEntry(target).data.translation ?? {};
  const current = meta.source === sourceHash(file, en.data, en.body);
  return { target, status: meta.status ?? 'machine', current, meta };
}

function setMeta(target, changes) {
  const { data, body } = readEntry(target);
  const { translation, ...rest } = data;
  writeEntry(target, { translation: { ...translation, ...changes }, ...rest }, body);
}

function stamp(target) {
  const file = sourceOf(target);
  const en = readEntry(file);
  setMeta(target, { source: sourceHash(file, en.data, en.body) });
}

function scaffold(file, locale) {
  const en = readEntry(file);
  const target = translationOf(file, locale);
  const shape = translatableShape(file, en.data);
  writeEntry(target, { translation: { status: 'machine', source: '', updated: today() }, ...shape }, en.body);
  return target;
}

// ---------------------------------------------------------------------------
// Machine translation
// ---------------------------------------------------------------------------

let client;
async function anthropic() {
  if (!client) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    client = new Anthropic();
  }
  return client;
}

function systemPrompt(locale) {
  const guide = YAML.parse(fs.readFileSync(path.join(content, 'settings/translation.yml'), 'utf8'));
  const language = config.locales.find((l) => l.code === locale).name;
  return [
    `You translate the website of the Humanitarian Data Alliance (an alliance of iMMAP, CartONG, HOT and Kobo) from English into ${language} (${locale}).`,
    guide.general,
    `Conventions for ${language}:\n${guide.locales?.[locale] ?? ''}`,
    `Glossary:\n${(guide.glossary ?? []).map((g) => `- ${g.term}: ${g.note}`).join('\n')}`,
    'You receive a JSON list of {id, text} items from one page. Return every id exactly once with its ' +
      'translation. Some items are short labels (buttons, menu items, badges): keep them short. ' +
      'Text in {braces} is a placeholder: copy it unchanged. If an item is a proper name, an acronym ' +
      'or a number that should not change, return it as it is.',
  ].join('\n\n');
}

const SCHEMA = {
  type: 'object',
  properties: {
    translations: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, text: { type: 'string' } },
        required: ['id', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['translations'],
  additionalProperties: false,
};

async function translate(file, locale) {
  const en = readEntry(file);
  const items = strings(file, en.data, en.body).map(([id, text]) => ({ id, text }));
  const target = translationOf(file, locale);
  // An earlier translation helps keep wording stable where the English hasn't changed.
  const previous = exists(target)
    ? Object.fromEntries(strings(file, readEntry(target).data, readEntry(target).body))
    : {};
  const reference = items.filter((i) => previous[i.id]).map((i) => ({ id: i.id, text: previous[i.id] }));

  const api = await anthropic();
  const stream = api.beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
    // The style guide is the same for every file in a run, so cache it.
    system: [{ type: 'text', text: systemPrompt(locale), cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content:
          `Page: content/${file}\n\nTranslate:\n${JSON.stringify(items, null, 1)}` +
          (reference.length
            ? `\n\nThe previous translation of this page, for consistency (reuse its wording where the English still says the same thing):\n${JSON.stringify(reference, null, 1)}`
            : ''),
      },
    ],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === 'refusal') throw new Error(`declined: ${message.stop_details?.explanation ?? ''}`);
  if (message.stop_reason === 'max_tokens') throw new Error('response was cut off (max_tokens)');
  const text = message.content.find((b) => b.type === 'text')?.text ?? '';
  const result = Object.fromEntries(JSON.parse(text).translations.map((t) => [t.id, t.text]));
  const missing = items.filter((i) => !result[i.id]).map((i) => i.id);
  if (missing.length) throw new Error(`no translation for ${missing.join(', ')}`);

  const shape = translatableShape(file, en.data);
  const out = applyStrings(shape, en.body, result);
  writeEntry(
    target,
    {
      translation: { status: 'machine', source: sourceHash(file, en.data, en.body), model: MODEL, updated: today() },
      ...out.data,
    },
    out.body,
  );
}

/**
 * What to do with one translation:
 * - missing, `retranslate`, or an out-of-date machine translation -> translate it
 * - an out-of-date `reviewed` translation -> mark it `outdated` for a person to fix,
 *   because a reviewer's wording should never be overwritten silently
 */
function plan(file, locale) {
  const s = state(file, locale);
  if (s.status === 'missing' || s.status === 'retranslate') return 'translate';
  if (s.status === 'machine' && (!s.current || force)) return 'translate';
  if (s.status === 'reviewed' && !s.current) return 'outdate';
  return null;
}

async function run(files) {
  let failed = 0;
  for (const file of files) {
    // Drafts change too often to be worth translating. Unticking Draft is an
    // edit to the English file, so it's translated as soon as it's published.
    if (readEntry(file).data.draft) {
      console.log(`skipped   ${file} (draft)`);
      continue;
    }
    for (const locale of locales) {
      const action = plan(file, locale);
      if (action === 'outdate') {
        setMeta(translationOf(file, locale), { status: 'outdated' });
        console.log(`outdated  ${translationOf(file, locale)} (reviewed, English has changed)`);
      } else if (action === 'translate') {
        try {
          await translate(file, locale);
          console.log(`translated ${translationOf(file, locale)}`);
        } catch (error) {
          failed++;
          console.error(`FAILED    ${translationOf(file, locale)}: ${error.message}`);
        }
      }
    }
  }
  if (failed) process.exitCode = 1;
}

// ---------------------------------------------------------------------------

if (command === 'status') {
  for (const file of sources()) {
    const row = locales.map((locale) => {
      const s = state(file, locale);
      return `${locale}:${s.status}${s.status !== 'missing' && !s.current ? '*' : ''}`;
    });
    console.log(`${file.padEnd(58)} ${row.join('  ')}`);
  }
  console.log('\n* = the English has changed since this translation was made');
} else if (command === 'stamp') {
  for (const target of positional.map(rel)) {
    if (!localeOf(target)) continue;
    stamp(target);
    console.log(`stamped ${target}`);
  }
} else if (command === 'check') {
  // For whoever is translating by hand: layout drift and text still in English.
  for (const file of sources()) {
    const en = readEntry(file);
    const english = Object.fromEntries(strings(file, en.data, en.body));
    for (const locale of locales) {
      const target = translationOf(file, locale);
      if (!exists(target)) continue;
      let loc;
      try {
        loc = readEntry(target);
      } catch (error) {
        console.log(`${target}: YAML error: ${error.message.split('\n')[0]}`);
        continue;
      }
      for (const at of mismatches(file, translatableShape(file, en.data), loc.data))
        console.log(`${target}: layout differs from English at ${at}`);
      const same = strings(file, loc.data, loc.body).filter(
        ([id, text]) => text === english[id] && /[a-z]{3,}\s+[a-z]{3,}/i.test(text),
      );
      for (const [id] of same) console.log(`${target}: still in English: ${id}`);
    }
  }
} else if (command === 'scaffold') {
  for (const file of sources())
    for (const locale of locales) if (!exists(translationOf(file, locale))) console.log(`created ${scaffold(file, locale)}`);
} else if (command === 'ci') {
  // Paths arrive relative to the repo root.
  const changed = positional.filter((f) => f.startsWith('content/')).map(rel);
  const changedSources = new Set(changed.filter((f) => !localeOf(f)));
  // A person edited a translation but not its English file. Their wording now
  // matches today's English, and it's protected from being overwritten.
  // ("retranslate" is a request for the bot, handled by run() below.)
  for (const target of changed.filter((f) => localeOf(f) && exists(f))) {
    const status = readEntry(target).data.translation?.status;
    if (changedSources.has(sourceOf(target)) || status === 'retranslate') continue;
    stamp(target);
    setMeta(target, { status: 'reviewed', updated: today() });
    console.log(`reviewed  ${target} (edited by a person)`);
  }
  const files = sourceFiles().filter(
    (f) => changedSources.has(f) || locales.some((l) => changed.includes(translationOf(f, l))),
  );
  await run(files);
} else {
  await run(sources());
}
