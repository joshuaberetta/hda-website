# Editing the website

You don't need to be a developer to change the site. Every change is published automatically a few minutes after it's saved.

## 1. The website editor (recommended)

Go to **https://hda.kobolabs.dev/admin/** and sign in with GitHub. You need write access to the [`joshuaberetta/hda-website`](https://github.com/joshuaberetta/hda-website) repository. From there you can edit:

- **Pages**: each page is a stack of sections. Open a section to change its text, swap its photo, reorder it by dragging, or add a new one from the section menu.
- **Members**: each member's introduction, skills, focal point and social links. Untick *Placeholder* once the member has confirmed their text.
- **News & events**: add an item and it appears on the home page, newest first.
- **Site settings**: the menu, the footer, the contact address and the interface text (buttons, labels and messages in every language).

Text boxes accept simple formatting: **bold**, *italic*, links and bullet lists.

Every save is a commit on GitHub, so nothing is lost: any change can be undone from the repository's history.

> **One-time setup (developer):** GitHub sign-in goes through a small DigitalOcean Function. Setup steps are in [`cms-auth/README.md`](cms-auth/README.md). Until it's deployed, use *Sign in with access token* with a GitHub [fine-grained token](https://github.com/settings/personal-access-tokens) that has *Contents: read and write* on this repository.

## 2. Directly on GitHub

Every page is a file in [`content/pages/`](content/pages/). The file name is the page URL: `members.md` is `/members`, and `home.md` is the home page. On GitHub, open the file, click the ✏️ pencil, edit, and commit.

The top of each file, between the two `---` lines, is the page in YAML. Keep the indentation (spaces, not tabs) exactly as it is. The format is described in [`content/README.md`](content/README.md).

## 3. Locally (developers)

`npm run dev` shows changes instantly. Run `npm run lint:content` before pushing: it catches broken YAML, typos in section types or icon names, links to pages that don't exist, and fields the website editor can't reach.

The editor also works on a local copy of the repository: open `http://localhost:4173/admin/` after `npm run build && npm run preview`, choose *Work with local repository* (Chrome or Edge) and pick this folder. Changes are written to your files, not committed.

## Common tasks

| I want to… | Do this |
|---|---|
| Change a heading or paragraph | Open the page, find the section, change its text |
| Add a photo | Open the section (or member) and upload it. Only photos with consent, ideally JPG, under 400 KB and about 1600px wide |
| Fill in a member's details | Members → the member. Replace the draft text, add the focal point, untick *Placeholder* |
| Replace a placeholder example | Pages → Home → *Examples of our work* → the member's item. Untick *Placeholder* |
| Update the "Combined reach" numbers | Pages → Home → *Numbers*. Untick *Figures still to be confirmed* once all are confirmed |
| Add a news item or event | News & events → New |
| Set the contact address | Site settings → Menu, footer and contact address. Tick *The contact address is confirmed* |
| Change a menu or footer link | Site settings → Menu, footer and contact address |
| Fix a translation | Open the entry, switch language (top right of the editor), edit the text, and set Translation → Status to **reviewed**. See [LOCALISATION.md](LOCALISATION.md) |
| Get a fresh machine translation | Set Translation → Status to **retranslate** and save |
| Change a button or label in any language | Site settings → Interface text |

**Placeholders.** Anything still waiting on the team is marked (*Placeholder*, *To be confirmed*), and the site shows it as such. Never replace a placeholder with an invented name, figure or link: leave it marked until the member confirms it.
