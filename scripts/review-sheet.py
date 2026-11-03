#!/usr/bin/env python3
"""Export each member's website copy into a review workbook.

One tab per member (checklist + their content), a tab for shared Alliance copy,
and an overview. Every row carries a `Ref` (file :: field) so the returned sheet
can be mapped back onto content/ exactly.

    python3 scripts/review-sheet.py [out.xlsx]

Needs openpyxl and PyYAML. English only: translations are regenerated with
`npm run translate` once the English is final.
"""
import datetime
import pathlib
import sys

import yaml
from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://hda.kobolabs.dev'
TODAY = datetime.date.today().isoformat()
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'review' / f'hda-content-review-{TODAY}.xlsx'

NAVY, RED, STONE, MIST, GREY = '1B2A41', 'C8102E', 'F3F0EA', 'E8EEF3', '6B7280'
TINT = {'red': 'F9E3E6', 'teal': 'DDF0EE', 'ochre': 'F7ECD6', 'blue': 'DFE9F6'}
ROW_STATUS = ['Keep as is', 'Updated', 'Remove', 'Question']
CHECK_STATUS = ['To do', 'In progress', 'Done', 'Not needed']
NETWORKS = ['linkedin', 'x', 'facebook', 'instagram', 'youtube', 'github']
PHASES = ['Preparedness', 'Rapid response', 'Sustained operations', 'Early recovery']


def front(path):
    text = (ROOT / path).read_text()
    return yaml.safe_load(text.split('---')[1])


def strip_draft_note(md):
    """Drop the italic 'Draft text…' line: it's ours, not theirs to review."""
    lines = [l for l in md.strip().splitlines() if not (l.startswith('*Draft text') and l.endswith('*'))]
    return '\n'.join(lines).strip()


home = front('content/pages/home.md')
wwd = front('content/pages/what-we-do.md')
members_page = front('content/pages/members.md')
commitments = front('content/pages/commitments.md')
site = yaml.safe_load((ROOT / 'content/settings/site.yml').read_text())
members = sorted(
    ({'slug': p.stem, **front(p.relative_to(ROOT))} for p in (ROOT / 'content/members').glob('*.md') if p.stem.count('.') == 0),
    key=lambda m: m['order'],
)


def section(page, type_, id_=None):
    return next(s for s in page['sections'] if s['type'] == type_ and (id_ is None or s.get('id') == id_))


# ---------------------------------------------------------------- styles
thin = Side(style='thin', color='D9D4CA')
BORDER = Border(top=thin, bottom=thin, left=thin, right=thin)
WRAP = Alignment(wrap_text=True, vertical='top')
H_FONT = Font(bold=True, color='FFFFFF')
H_FILL = PatternFill('solid', fgColor=NAVY)
LOCKED_FILL = PatternFill('solid', fgColor=STONE)
EDIT_FILL = PatternFill('solid', fgColor='FFFFFF')
REF_FONT = Font(color=GREY, size=8)


def header(ws, row, labels):
    for c, label in enumerate(labels, 1):
        cell = ws.cell(row=row, column=c, value=label)
        cell.font, cell.fill, cell.alignment, cell.border = H_FONT, H_FILL, WRAP, BORDER


def title(ws, text, sub=None):
    ws['A1'] = text
    ws['A1'].font = Font(bold=True, size=16, color=NAVY)
    if sub:
        ws['A2'] = sub
        ws['A2'].font = Font(italic=True, color=GREY)
        ws['A2'].alignment = Alignment(wrap_text=True, vertical='top')


def band(ws, row, text, ncols, fill=NAVY):
    ws.cell(row=row, column=1, value=text).font = Font(bold=True, size=13, color=fill)
    ws.cell(row=row, column=1).alignment = Alignment(vertical='bottom')
    ws.row_dimensions[row].height = 26


def link(cell, href):
    cell.value = href.replace(SITE, '') or '/'
    cell.hyperlink = href
    cell.font = Font(color='1F5FAD', underline='single')


def height_for(*texts, width=60):
    lines = sum(max(1, -(-len(line) // width)) for t in texts if t for line in str(t).splitlines()) if any(texts) else 1
    return min(max(18, 15 * max(lines, 1) + 4), 300)


# ---------------------------------------------------------------- member rows
def member_rows(m):
    """(group, ref, field, link, current, guidance, kind) for one member."""
    s, f = m['slug'], f"content/members/{m['slug']}.md"
    profile = f'{SITE}/members#{s}'
    rows = []
    add = lambda *r: rows.append(r)

    g = 'Profile (members page)'
    add(g, f'{f} :: name', 'Short name', profile, m['name'], 'Used everywhere on the site.', 'text')
    add(g, f'{f} :: fullName', 'Full name', profile, m['fullName'], 'Shown as the heading of your profile.', 'text')
    add(g, f'{f} :: focus', 'Focus label', f'{SITE}/#members', m['focus'], '2–3 words, shown on your home page tile.', 'text')
    add(g, f'{f} :: url', 'Website', profile, m['url'], 'Full URL.', 'text')
    add(g, f'{f} :: summary', 'One-line summary', f'{SITE}/#members', m['summary'], 'One sentence (~20 words) for the home page tile.', 'text')
    add(g, f'{f} :: intro', 'Introduction', profile, strip_draft_note(m['intro']),
        'Our draft. Please replace it with your own: 2–4 sentences, plain language.', 'text')
    for i, skill in enumerate(m['skills'] + ['', ''], 1):
        add(g, f'{f} :: skills[{i}]', f'Skill {i}' + ('' if i <= len(m['skills']) else ' (optional, new)'),
            profile, skill, 'A short phrase. Five works best.' if i == 1 else '', 'text')

    g = 'Focal point (members page)'
    fp = m['focalPoint']
    add(g, f'{f} :: focalPoint.name', 'Name', profile, '' if fp.get('placeholder') else fp['name'],
        'The person partners should contact. Leave blank if you’d rather not name anyone yet.', 'text')
    add(g, f'{f} :: focalPoint.role', 'Role / job title', profile, '' if fp.get('placeholder') else fp['role'], '', 'text')
    add(g, f'{f} :: focalPoint.photo', 'Photo', profile, fp.get('photo', ''),
        'Square photo, at least 400×400 px. Email it, or paste a download link here.', 'file')

    g = 'Social links (members page)'
    socials = m.get('socials', [])
    for i, soc in enumerate(socials + [{}] * max(0, 3 - len(socials)), 1):
        add(g, f'{f} :: socials[{i}]', f"Social {i}" + (f" ({soc['network']})" if soc else ' (optional, new)'), profile,
            f"{soc['network']}: {soc['href']}" if soc else '',
            f"As network: URL. Networks: {', '.join(NETWORKS)}." if i == 1 else '', 'text')

    g = 'Example of your work (home page)'
    ex = next(i for i in section(home, 'examples', 'examples')['items'] if i['member'] == s)
    ref = f'content/pages/home.md :: examples[member={s}]'
    tip = '' if not ex.get('placeholder') else ' (placeholder)'
    add(g, f'{ref}.title', 'Title' + tip, f'{SITE}/#examples', ex['title'], 'One recent piece of work. A short, specific title.', 'text')
    add(g, f'{ref}.place', 'Place · year' + tip, f'{SITE}/#examples', ex['place'], 'e.g. “Mozambique · 2025”.', 'text')
    add(g, f'{ref}.body', 'Description' + tip, f'{SITE}/#examples', ex['body'], '1–2 sentences: the work, partners, what it made possible.', 'text')
    add(g, f'{ref}.href', 'Link (optional)', f'{SITE}/#examples', ex.get('href', ''), 'A page about the work, if there is one.', 'text')
    add(g, f'{ref}.image', 'Image (optional)', f'{SITE}/#examples', ex.get('image', ''),
        'Landscape, at least 1200 px wide, with permission to use it. Email it or paste a link. Without one, a pattern in your colour shows.', 'file')

    g = 'Reach figures (home page)'
    stats = [i for i in section(home, 'stats', 'reach')['items'] if i['member'] == s]
    for i, st in enumerate(stats + [{}, {}], 1):
        ref = f'content/pages/home.md :: stats[member={s}][{i}]'
        new = '' if st else ' (optional, new)'
        add(g, f'{ref}.value', f'Figure {i}: number{new}', f'{SITE}/#reach', st.get('value', ''),
            'Short: “35,000+”, “20 yrs”. Figures are never added up across members.' if i == 1 else '', 'text')
        add(g, f'{ref}.label', f'Figure {i}: label{new}', f'{SITE}/#reach', st.get('label', ''),
            'What it counts, completing the number.' if i == 1 else '', 'text')
        add(g, f'{ref}.source', f'Figure {i}: source & date{new}', f'{SITE}/#reach', 'Member website, September 2026' if st else '',
            'Not shown on the site. Where the figure comes from, so we can keep it up to date.' if i == 1 else '', 'text')

    g = 'Services you provide (what we do page)'
    for gi, grp in enumerate(section(wwd, 'services')['groups']):
        for svc in grp['services']:
            ref = f"content/pages/what-we-do.md :: services[{grp['title']}][{svc['name']}]"
            yes = 'Yes' if s in svc['members'] else 'No'
            add(g, f'{ref}.members[{s}]', f"{grp['title']} › {svc['name']}", f'{SITE}/what-we-do#area-{gi}',
                f"Listed as provider: {yes}\n{svc['body']}\nWhen: {', '.join(svc.get('phases', []))}",
                'Put Yes or No under “Your update” if we have it wrong. Comment on the wording or phases if you like.', 'service')
    for i in (1, 2):
        add(g, f'content/pages/what-we-do.md :: services[new][{s}-{i}]', f'Suggest a missing service {i} (optional)',
            f'{SITE}/what-we-do', '', 'Name, one line on it, which area it fits, and when in a crisis it helps (' + ', '.join(PHASES) + ').', 'text')
    return rows


# ---------------------------------------------------------------- shared rows
def shared_rows():
    rows = []
    add = lambda *r: rows.append(r)
    hp = 'content/pages/home.md'
    hero = section(home, 'hero')
    add('Home · hero', f'{hp} :: hero.title', 'Headline', f'{SITE}/', hero['title'])
    add('Home · hero', f'{hp} :: hero.subtitle', 'Subtitle', f'{SITE}/', hero['subtitle'])
    for i, p in enumerate(hero['pins'], 1):
        add('Home · hero', f'{hp} :: hero.pins[{i}]', f'Map pin {i} (illustrative)', f'{SITE}/', f"{p['title']}: {p['body']} ({p['label']})")
    for key, label in [('examples', 'Our work'), ('members', None)]:
        sec = section(home, key, key)
        add('Home · ' + (label or 'members'), f'{hp} :: {key}.title', 'Heading', f'{SITE}/#{key}', sec['title'])
        if sec.get('intro'):
            add('Home · ' + (label or 'members'), f'{hp} :: {key}.intro', 'Intro', f'{SITE}/#{key}', sec['intro'])
    lay = section(home, 'layers', 'services')
    add('Home · services stack', f'{hp} :: layers.title', 'Heading', f'{SITE}/#services', lay['title'])
    add('Home · services stack', f'{hp} :: layers.intro', 'Intro', f'{SITE}/#services', lay['intro'])
    for it in lay['items']:
        add('Home · services stack', f"{hp} :: layers[{it['title']}]", it['title'], f'{SITE}/#services', it['body'])
    life = section(home, 'lifecycle')
    add('Crisis lifecycle (home and what we do)', f'{hp} :: lifecycle.title', 'Heading', f'{SITE}/what-we-do', life['title'])
    for it in life['items']:
        add('Crisis lifecycle (home and what we do)', f"{hp} :: lifecycle[{it['title']}]", f"{it['phase']} · {it['title']}", f'{SITE}/what-we-do', it['body'])
    q = section(home, 'quote')
    add('Quote', f'{hp} :: quote', 'Quote', f'{SITE}/', f"{q['quote']}\n{q['body']}")
    stats = section(home, 'stats', 'reach')
    add('Home · reach', f'{hp} :: stats.title', 'Heading', f'{SITE}/#reach', stats['title'])
    hila = section(home, 'split', 'hila')
    add('Home · HILA', f'{hp} :: hila.body', 'HILA text', f'{SITE}/#hila', hila['body'].strip())
    con = section(home, 'contact', 'contact')
    add('Home · contact', f'{hp} :: contact', 'Work with us', f'{SITE}/#contact', f"{con['title']}\n{con['body']}")
    add('Home · contact', 'content/settings/site.yml :: email', 'Contact email', f'{SITE}/#contact',
        site.get('email', '') + ('' if site.get('emailConfirmed', True) else '  (not yet confirmed)'))
    for page, path, slug in [(wwd, 'what-we-do', '/what-we-do'), (members_page, 'members', '/members'), (commitments, 'commitments', '/commitments')]:
        add(f"{page['title']} page", f'content/pages/{path}.md :: hero', 'Page header', SITE + slug, f"{page['hero']['title']}\n{page['hero']['subtitle']}")
    svc = section(wwd, 'services')
    for gi, grp in enumerate(svc['groups']):
        add('What we do · service areas', f"content/pages/what-we-do.md :: services[{grp['title']}].body", grp['title'],
            f'{SITE}/what-we-do#area-{gi}', grp['body'])
    for n in sorted((ROOT / 'content/news').glob('*.md')):
        if n.stem.count('.'):
            continue
        it = front(n.relative_to(ROOT))
        add('News & events', f'content/news/{n.name} :: summary', f"{it['title']} ({it['dateLabel']}{', date TBC' if it.get('tbc') else ''})",
            f'{SITE}/#news', it['summary'])
    return rows


# ---------------------------------------------------------------- workbook
wb = Workbook()
ov = wb.active
ov.title = 'Start here'

ROW_DV = lambda: DataValidation(type='list', formula1='"' + ','.join(ROW_STATUS) + '"', allow_blank=True)
CHECK_DV = lambda: DataValidation(type='list', formula1='"' + ','.join(CHECK_STATUS) + '"', allow_blank=True)

summary = []  # (member, sheet name, checklist range, rows range)

for m in members:
    ws = wb.create_sheet(m['name'])
    ws.sheet_properties.tabColor = {'red': RED, 'teal': '1F8A80', 'ochre': 'C08A1E', 'blue': '1F5FAD'}[m['colour']]
    tint = PatternFill('solid', fgColor=TINT[m['colour']])
    title(ws, f"{m['fullName']}: website content review",
          f"Your profile: {SITE}/members#{m['slug']}   ·   Work through the checklist, then the content below. "
          "Only fill in the white columns. Grey columns are what's on the site now.")
    ws.merge_cells('A2:H2')
    ws.row_dimensions[2].height = 32

    # Checklist
    checklist = [
        ('Look at your profile and home page tile on the live site', f'{SITE}/members#{m["slug"]}'),
        ('Replace our draft introduction with your own', f'{SITE}/members#{m["slug"]}'),
        ('Check your names, focus label, website and one-line summary', f'{SITE}/#members'),
        ('Review your list of skills (about five)', f'{SITE}/members#{m["slug"]}'),
        ('Name a focal point (name and role) and send a photo', f'{SITE}/members#{m["slug"]}'),
        ('Check your social links, and add any that are missing', f'{SITE}/members#{m["slug"]}'),
        ('Pick one example of your work (title, place, description, link, image)', f'{SITE}/#examples'),
        ('Choose your reach figure(s) and give the source', f'{SITE}/#reach'),
        ('Check which services list you as a provider, and suggest missing ones', f'{SITE}/what-we-do'),
        ('Look over the shared Alliance content tab and comment if needed', None),
        ('Email any files (photo, example image) with your organisation name in the file name', None),
        ('Tell us if you want to check the French, Spanish or Arabic versions yourselves', None),
        ('Sign off: fill in the reviewer and date below', None),
    ]
    band(ws, 4, 'Checklist', 8)
    header(ws, 5, ['#', 'Task', 'Link', 'Status', 'Who', 'Notes'])
    dv = CHECK_DV()
    ws.add_data_validation(dv)
    r0 = 6
    for i, (task, href) in enumerate(checklist):
        r = r0 + i
        ws.cell(row=r, column=1, value=i + 1)
        ws.cell(row=r, column=2, value=task)
        if href:
            link(ws.cell(row=r, column=3), href)
        ws.cell(row=r, column=4, value='To do')
        dv.add(ws.cell(row=r, column=4))
        for c in range(1, 7):
            cell = ws.cell(row=r, column=c)
            cell.border, cell.alignment = BORDER, WRAP
            if c in (1, 2, 3):
                cell.fill = LOCKED_FILL
    check_range = f'D{r0}:D{r0 + len(checklist) - 1}'
    r = r0 + len(checklist) + 1
    for label in ('Reviewed by (name, role)', 'Date', 'Anything else we should know?'):
        ws.cell(row=r, column=2, value=label).font = Font(bold=True)
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=6)
        for c in range(3, 7):
            ws.cell(row=r, column=c).border = BORDER
        ws.cell(row=r, column=3).alignment = WRAP
        r += 1
    ws.row_dimensions[r - 1].height = 48

    # Content
    r += 1
    band(ws, r, 'Your content', 8)
    r += 1
    header(ws, r, ['Section', 'Item', 'Link', 'On the site now', 'Guidance', 'Your update\n(leave blank to keep)', 'Status', 'Comments / questions', 'Ref (please don’t edit)'])
    head_row = r
    rdv = ROW_DV()
    ws.add_data_validation(rdv)
    first = r + 1
    last_group = None
    for group, ref, field, href, current, guidance, kind in member_rows(m):
        r += 1
        if group != last_group:
            ws.cell(row=r, column=1, value=group).font = Font(bold=True, color=NAVY)
            for c in range(1, 10):
                ws.cell(row=r, column=c).fill = tint
            last_group = group
            r += 1
        vals = [group, field, None, current, guidance, None, None, None, ref]
        for c, v in enumerate(vals, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.alignment, cell.border = WRAP, BORDER
            cell.fill = EDIT_FILL if c in (6, 7, 8) else LOCKED_FILL
        link(ws.cell(row=r, column=3), href)
        ws.cell(row=r, column=1).font = Font(color=GREY, size=9)
        ws.cell(row=r, column=5).font = Font(italic=True, color=GREY, size=9)
        ws.cell(row=r, column=9).font = REF_FONT
        rdv.add(ws.cell(row=r, column=7))
        ws.row_dimensions[r].height = height_for(current, width=55)
    rows_range = (first, r)
    # Highlight edited rows
    ws.conditional_formatting.add(f'F{first}:H{r}', FormulaRule(formula=[f'LEN($F{first})>0'], fill=PatternFill('solid', fgColor='FFF6D5')))
    ws.auto_filter.ref = f'A{head_row}:I{r}'

    for col, w in zip('ABCDEFGHI', (22, 34, 22, 55, 34, 55, 13, 34, 30)):
        ws.column_dimensions[col].width = w
    summary.append((m, ws.title, check_range, len(checklist), rows_range))

# Shared tab
sh = wb.create_sheet('Shared Alliance content')
sh.sheet_properties.tabColor = NAVY
title(sh, 'Shared Alliance content: optional comments from every member',
      'Copy about the Alliance as a whole. Add comments or suggested wording in your organisation’s column. '
      'The values and principles on the Commitments page come word for word from the MoU, so they aren’t in this sheet.')
sh.merge_cells('A2:I2')
sh.row_dimensions[2].height = 32
header(sh, 4, ['Section', 'Item', 'Link', 'On the site now'] + [f"{m['name']} comments" for m in members] + ['Ref (please don’t edit)'])
r = 4
for group, ref, field, href, current in shared_rows():
    r += 1
    vals = [group, field, None, current] + [None] * len(members) + [ref]
    for c, v in enumerate(vals, 1):
        cell = sh.cell(row=r, column=c, value=v)
        cell.alignment, cell.border = WRAP, BORDER
        cell.fill = EDIT_FILL if 5 <= c < 5 + len(members) else LOCKED_FILL
    link(sh.cell(row=r, column=3), href)
    sh.cell(row=r, column=1).font = Font(color=GREY, size=9)
    sh.cell(row=r, column=5 + len(members)).font = REF_FONT
    sh.row_dimensions[r].height = height_for(current, width=55)
sh.freeze_panes = 'E5'
sh.auto_filter.ref = f'A4:{chr(64 + 5 + len(members))}{r}'
for col, w in zip('ABCDEFGHI', (24, 28, 18, 60, 30, 30, 30, 30, 30)):
    sh.column_dimensions[col].width = w

# Start here
title(ov, 'Humanitarian Data Alliance website: content review')
lines = [
    f'The draft site is live at {SITE}. Each member has its own tab with a checklist and every piece of copy that is about them.',
    '',
    'How to fill it in',
    '1. Open your organisation’s tab and work through the checklist at the top.',
    '2. In the content below it, the grey columns show what is on the site now, with a link to where it appears.',
    '3. To change something, write the new version in “Your update” and set Status to “Updated”. Leave it blank to keep the current text.',
    '4. Use “Remove” to take something off, and “Question” (with a comment) if you’re not sure.',
    '5. Please don’t edit the Ref column or add or delete rows: we use it to put your changes into the site. Empty “new” rows are there if you need more.',
    '6. Photos and images: email them, or paste a link in “Your update”. Only use images you have permission to publish.',
    '7. The “Shared Alliance content” tab is optional: comment there on the copy about the Alliance as a whole.',
    '',
    'Please review the English only. The French, Spanish and Arabic versions are machine-translated from it and will be redone once the English is final.',
    'Anything marked as a placeholder on the site (grey “to be confirmed” labels) is waiting on this review.',
    '',
    'Progress',
]
for i, line in enumerate(lines, 3):
    c = ov.cell(row=i, column=1, value=line)
    c.alignment = Alignment(wrap_text=True, vertical='top')
    if line in ('How to fill it in', 'Progress'):
        c.font = Font(bold=True, size=13, color=NAVY)
    ov.merge_cells(start_row=i, start_column=1, end_row=i, end_column=5)
r = 3 + len(lines)
header(ov, r, ['Member', 'Tab', 'Checklist done', 'Rows changed', 'Open questions'])
for m, name, check_range, n, (a, b) in summary:
    r += 1
    q = f"'{name}'"
    ov.cell(row=r, column=1, value=m['fullName'])
    tab = ov.cell(row=r, column=2, value=name)
    tab.hyperlink = f"#{q}!A1"
    tab.font = Font(color='1F5FAD', underline='single')
    ov.cell(row=r, column=3, value=f'=COUNTIF({q}!{check_range},"Done")+COUNTIF({q}!{check_range},"Not needed")&" / {n}"')
    ov.cell(row=r, column=4, value=f'=COUNTA({q}!F{a}:F{b})+COUNTIF({q}!G{a}:G{b},"Remove")')
    ov.cell(row=r, column=5, value=f'=COUNTIF({q}!G{a}:G{b},"Question")')
    for c in range(1, 6):
        ov.cell(row=r, column=c).border = BORDER
ov.cell(row=r + 2, column=1, value=f'Exported from the site content on {TODAY}.').font = Font(italic=True, color=GREY)
ov.column_dimensions['A'].width = 40
for col in 'BCDE':
    ov.column_dimensions[col].width = 22

for ws in wb.worksheets:
    ws.page_setup.orientation = 'landscape'
    ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print(f'Wrote {OUT.relative_to(ROOT) if OUT.is_relative_to(ROOT) else OUT}')
