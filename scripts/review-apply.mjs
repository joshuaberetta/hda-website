#!/usr/bin/env node
// Apply a returned content review workbook (from scripts/review-sheet.py) to content/.
//
//   node scripts/review-apply.mjs returned.xlsx [more.xlsx…]           dry run: what would change
//   node scripts/review-apply.mjs returned.xlsx [more.xlsx…] --write   change the files
//
// Each sheet row is matched on its Ref (file :: field). What can't be applied
// automatically (images, sources, new services, questions, comments) is listed
// at the end for a person to deal with. Run `npm run translate` afterwards.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const write = args.includes('--write');
const files = args.filter((a) => a !== '--write');
if (!files.length) {
  console.error('Usage: node scripts/review-apply.mjs returned.xlsx [--write]');
  process.exit(1);
}

// Read the workbooks with openpyxl (already needed to make them).
const READER = String.raw`
import json, sys
from openpyxl import load_workbook
out = []
for f in sys.argv[1:]:
    wb = load_workbook(f, data_only=True)
    for ws in wb.worksheets:
        rows = [[('' if v is None else str(v).strip()) for v in r] for r in ws.iter_rows(values_only=True)]
        head = next((i for i, r in enumerate(rows) if 'Ref (please don’t edit)' in r), None)
        for r in rows[:head or 0]:
            if len(r) > 5 and r[0].isdigit():
                out.append({'file': f, 'sheet': ws.title, 'kind': 'checklist', 'field': r[1], 'status': r[3], 'value': ' / '.join(x for x in (r[4], r[5]) if x)})
            elif len(r) > 2 and r[1] in ('Reviewed by (name, role)', 'Date', 'Anything else we should know?') and r[2]:
                out.append({'file': f, 'sheet': ws.title, 'kind': 'signoff', 'field': r[1], 'value': r[2]})
        if head is None:
            continue
        h = rows[head]
        ref = h.index('Ref (please don’t edit)')
        for r in rows[head + 1:]:
            if len(r) <= ref or not r[ref]:
                continue
            if ws.title == 'Shared Alliance content':
                for c in range(4, ref):
                    if r[c]:
                        out.append({'file': f, 'sheet': ws.title, 'kind': 'shared', 'ref': r[ref], 'field': r[1], 'member': h[c].replace(' comments', ''), 'value': r[c]})
            else:
                out.append({'file': f, 'sheet': ws.title, 'kind': 'row', 'ref': r[ref], 'field': r[1], 'current': r[3], 'update': r[5], 'status': r[6], 'comment': r[7]})
print(json.dumps(out))
`;
const rows = JSON.parse(execFileSync('python3', ['-I', '-c', READER, ...files], { encoding: 'utf8', maxBuffer: 1 << 26 }));

// ---------------------------------------------------------------- files
const docs = new Map();
function doc(file) {
  if (!docs.has(file)) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const [, front, body] = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    docs.set(file, { src, doc: YAML.parseDocument(front), body, changed: false });
  }
  return docs.get(file);
}
function str(value) {
  const node = new YAML.Scalar(value);
  if (value.includes('\n')) node.type = 'BLOCK_LITERAL';
  return node;
}

const changes = [];
const manual = [];
const NETWORKS = ['linkedin', 'x', 'facebook', 'instagram', 'youtube', 'github'];
const SIMPLE = ['name', 'fullName', 'focus', 'url', 'summary', 'intro'];

function set(file, p, value, why) {
  const d = doc(file);
  const before = d.doc.getIn(p);
  if (before === value) return;
  d.doc.setIn(p, typeof value === 'string' ? str(value) : value);
  d.changed = true;
  changes.push(`${file} ${p.join('.')}: ${JSON.stringify(before)} → ${JSON.stringify(value)}${why ? ` (${why})` : ''}`);
}
function del(file, p, why) {
  const d = doc(file);
  if (!d.doc.hasIn(p)) return;
  changes.push(`${file} ${p.join('.')}: removed${why ? ` (${why})` : ''}`);
  d.doc.deleteIn(p);
  d.changed = true;
}
const note = (r, text) => manual.push(`[${r.sheet}] ${r.field}: ${text}`);
const isPath = (v) => /^\/images\/\S+$/.test(v);

// ---------------------------------------------------------------- rows
const rowsBy = (test) => rows.filter((r) => r.kind === 'row' && test(r));
const touched = (r) => r.update || r.status === 'Remove';
const lists = new Map(); // file::key -> [{i, r}]
const queue = (k, i, r) => lists.set(k, [...(lists.get(k) ?? []), { i, r }]);

for (const r of rowsBy(() => true)) {
  if (r.status === 'Question' || r.comment) note(r, `${r.status === 'Question' ? 'QUESTION' : 'comment'}: ${r.comment || '(no comment)'}${r.update ? ` [update: ${r.update}]` : ''}`);
  const [file, field] = r.ref.split(' :: ');
  let m;
  if (file.startsWith('content/members/')) {
    if (SIMPLE.includes(field)) {
      if (r.status === 'Remove') note(r, 'asked to remove a required field; left as is');
      else if (r.update) {
        set(file, [field], field === 'intro' ? r.update.replace(/\r\n/g, '\n').trim() + '\n' : r.update);
        if (field === 'intro') del(file, ['placeholder'], 'intro written by the member');
      }
    } else if ((m = field.match(/^(skills|socials)\[(\d+)\]$/))) {
      queue(`${file}::${m[1]}`, Number(m[2]), r);
    } else if ((m = field.match(/^focalPoint\.(name|role|photo)$/))) {
      if (m[1] === 'photo') {
        if (r.update && isPath(r.update)) set(file, ['focalPoint', 'photo'], r.update);
        else if (r.update || r.status === 'Remove') note(r, `photo: ${r.update || 'remove'} (save it to public/images/people/ and set focalPoint.photo)`);
      } else if (r.update) {
        set(file, ['focalPoint', m[1]], r.update);
        if (m[1] === 'name') del(file, ['focalPoint', 'placeholder'], 'focal point named');
      }
      else if (r.status === 'Remove') note(r, 'asked to remove; left as is');
    } else note(r, `unknown ref ${r.ref}`);
  } else if ((m = field.match(/^examples\[member=(\w+)\]\.(\w+)$/))) {
    queue(`${file}::examples::${m[1]}`, m[2], r);
  } else if ((m = field.match(/^stats\[member=(\w+)\]\[(\d+)\]\.(\w+)$/))) {
    queue(`${file}::stats::${m[1]}`, `${m[2]}.${m[3]}`, r);
  } else if ((m = field.match(/^services\[(.+)\]\[(.+)\]\.members\[(\w+)\]$/))) {
    if (!r.update) continue;
    const slug = m[3];
    const want = /^y/i.test(r.update) ? true : /^n/i.test(r.update) ? false : null;
    if (want === null) { note(r, `unclear provider answer: ${r.update}`); continue; }
    const secs = doc(file).doc.get('sections');
    const s = secs.items.findIndex((x) => x.get('type') === 'services');
    const g = secs.getIn([s, 'groups']).items.findIndex((x) => x.get('title') === m[1]);
    const v = secs.getIn([s, 'groups', g, 'services']).items.findIndex((x) => x.get('name') === m[2]);
    if (g < 0 || v < 0) { note(r, `service not found: ${m[1]} › ${m[2]}`); continue; }
    const p = ['sections', s, 'groups', g, 'services', v, 'members'];
    const list = doc(file).doc.getIn(p).toJSON();
    const next = want ? [...new Set([...list, slug])] : list.filter((x) => x !== slug);
    if (next.length !== list.length) {
      if (!next.length) { note(r, 'would leave the service with no provider; left as is'); continue; }
      const seq = doc(file).doc.createNode(next);
      seq.flow = true;
      set(file, p, seq, want ? `${slug} provides it` : `${slug} doesn't`);
    }
  } else if (field.startsWith('services[new]')) {
    if (r.update) note(r, `NEW SERVICE suggested: ${r.update}`);
  } else note(r, `unknown ref ${r.ref}`);
}

// Skills and socials: rebuild the list in row order.
for (const [key, items] of lists) {
  const [file, kind, slug] = key.split('::');
  if (kind === 'skills' || kind === 'socials') {
    if (!items.some(({ r }) => touched(r))) continue;
    const out = [];
    for (const { r } of items.sort((a, b) => a.i - b.i)) {
      if (r.status === 'Remove') continue;
      const v = r.update || r.current;
      if (!v) continue;
      if (kind === 'skills') out.push(v);
      else {
        const mm = v.match(/^\s*([a-z]+)\s*:\s*(https?:\/\/\S+)\s*$/i);
        if (mm && NETWORKS.includes(mm[1].toLowerCase())) out.push({ network: mm[1].toLowerCase(), href: mm[2] });
        else note(r, `social link not in “network: URL” form, or unknown network: ${v}`);
      }
    }
    const node = doc(file).doc.createNode(out);
    if (kind === 'socials') node.items.forEach((i) => (i.flow = true));
    set(file, [kind], node);
  } else if (kind === 'examples') {
    const secs = doc(file).doc.get('sections');
    const s = secs.items.findIndex((x) => x.get('type') === 'examples');
    const e = secs.getIn([s, 'items']).items.findIndex((x) => x.get('member') === slug);
    const by = Object.fromEntries(items.map(({ i, r }) => [i, r]));
    for (const [k, r] of Object.entries(by)) {
      if (k === 'image' && (r.update || r.status === 'Remove')) {
        if (isPath(r.update)) set(file, ['sections', s, 'items', e, 'image'], r.update);
        else note(r, `example image: ${r.update || 'remove'} (save it to public/images/ and set image)`);
      } else if (r.status === 'Remove' && (k === 'href' || k === 'image')) del(file, ['sections', s, 'items', e, k]);
      else if (r.update) set(file, ['sections', s, 'items', e, k], r.update);
    }
    // The example stops being a placeholder once its title, place and body are all theirs.
    if (['title', 'place', 'body'].every((k) => by[k]?.update || by[k]?.status === 'Keep as is'))
      del(file, ['sections', s, 'items', e, 'placeholder'], `${slug} supplied the example`);
  } else if (kind === 'stats') {
    const secs = doc(file).doc.get('sections');
    const s = secs.items.findIndex((x) => x.get('type') === 'stats');
    const statItems = () => secs.getIn([s, 'items']).items;
    const own = () => statItems().map((x, i) => [x, i]).filter(([x]) => x.get('member') === slug).map(([, i]) => i);
    const figs = {};
    for (const { i, r } of items) {
      const [n, f] = i.split('.');
      (figs[n] ??= {})[f] = r;
    }
    const existing = own();
    const removals = [];
    for (const n of Object.keys(figs).sort()) {
      const { value: v, label: l, source: src } = figs[n];
      const idx = existing[Number(n) - 1];
      if (src?.update) note(src, `source: ${src.update}`);
      if (idx !== undefined) {
        if (v?.status === 'Remove' || l?.status === 'Remove') { removals.push(idx); continue; }
        if (v?.update) set(file, ['sections', s, 'items', idx, 'value'], v.update);
        if (l?.update) set(file, ['sections', s, 'items', idx, 'label'], l.update);
      } else if (v?.update || l?.update) {
        if (!(v?.update && l?.update)) { note(v ?? l, 'new figure needs both a number and a label'); continue; }
        const at = Math.max(...own(), -1) + 1;
        const node = doc(file).doc.createNode({ member: slug, value: v.update, label: l.update });
        node.flow = true;
        secs.getIn([s, 'items']).items.splice(at, 0, node);
        doc(file).changed = true;
        changes.push(`${file} stats: added ${slug} figure “${v.update} ${l.update}”`);
      }
    }
    for (const idx of removals.sort((a, b) => b - a)) del(file, ['sections', s, 'items', idx], `${slug} removed a figure`);
  }
}

for (const r of rows.filter((r) => r.kind === 'shared')) manual.push(`[Shared · ${r.member}] ${r.field}: ${r.value}`);
for (const sheet of new Set(rows.filter((r) => r.kind === 'checklist').map((r) => r.sheet))) {
  const items = rows.filter((r) => r.kind === 'checklist' && r.sheet === sheet);
  if (items.every((r) => r.status === 'To do' && !r.value)) manual.push(`[${sheet} checklist] not started`);
  else for (const r of items.filter((r) => r.value || !['Done', 'Not needed'].includes(r.status))) manual.push(`[${sheet} checklist] ${r.field} — ${r.status}${r.value ? `: ${r.value}` : ''}`);
}
for (const r of rows.filter((r) => r.kind === 'signoff')) manual.push(`[${r.sheet} sign-off] ${r.field}: ${r.value}`);

// ---------------------------------------------------------------- output
console.log(`${write ? 'Changed' : 'Would change'} (${changes.length}):`);
for (const c of changes) console.log(`  ${c}`);
console.log(`\nFor a person to handle (${manual.length}):`);
for (const m of manual) console.log(`  ${m}`);
if (write) {
  for (const [file, d] of docs) {
    if (!d.changed) continue;
    fs.writeFileSync(path.join(ROOT, file), `---\n${d.doc.toString({ lineWidth: 0, flowCollectionPadding: true })}---\n${d.body}`);
  }
  console.log('\nNext: npm run lint:content, then npm run translate.');
} else console.log('\nDry run. Add --write to change the files.');
