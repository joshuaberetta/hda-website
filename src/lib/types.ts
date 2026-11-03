/** Where a page stands in a language: English source, machine draft, checked by a person… See LOCALISATION.md. */
export type TranslationStatus = 'source' | 'machine' | 'reviewed' | 'outdated' | 'retranslate' | 'missing';

// The shape of everything in content/. Documented in content/README.md and
// checked by scripts/validate-content.mjs: change all three together.

export interface LinkItem {
  label: string;
  href: string;
  /** `filled` (default, red), `outline` (navy outline) or `arrow` (text link). */
  variant?: 'filled' | 'outline' | 'arrow';
}

/** Band colour: paper (default), stone (warm), mist (cool blue) or dark (navy). */
export type Background = 'paper' | 'stone' | 'mist' | 'dark';

/** The four member colours. Each has a pastel tint (shade 1) and a strong shade. */
export type MemberColour = 'red' | 'teal' | 'ochre' | 'blue';

/** Fields every section can have. */
interface SectionBase {
  id?: string;
  eyebrow?: string;
  title?: string;
  /** Markdown, shown under the title. */
  intro?: string;
  background?: Background;
  align?: 'left' | 'center';
  links?: LinkItem[];
}

export interface HeroData extends SectionBase {
  type: 'hero';
  title: string;
  /** The end of the title to highlight in red, e.g. "humanitarian action." */
  highlight?: string;
  subtitle: string;
  /** Floating map labels over the world map. */
  pins?: { title: string; body: string; label: string }[];
}

export interface MembersData extends SectionBase {
  type: 'members';
  /** `grid`: four short tiles (home). `detail`: one band per member (members page). */
  variant?: 'grid' | 'detail';
}

export interface ExamplesData extends SectionBase {
  type: 'examples';
  items: {
    member: string;
    title: string;
    place: string;
    body: string;
    image?: string;
    href?: string;
    /** Marks a stand-in until the member sends their pick. */
    placeholder?: boolean;
  }[];
}

export interface LayersData extends SectionBase {
  type: 'layers';
  /** Top layer first. Each layer is a service area. */
  items: { title: string; body: string; icon: string; label: string }[];
  hint?: string;
}

export interface LifecycleData extends SectionBase {
  type: 'lifecycle';
  items: { phase: string; title: string; body: string }[];
}

export interface CommitmentsData extends SectionBase {
  type: 'commitments';
  /** `grid`: short tiles (home). `detail`: longer text per commitment. */
  variant?: 'grid' | 'detail';
  items: { title: string; body: string; icon: string; detail?: string }[];
}

export interface QuoteData extends SectionBase {
  type: 'quote';
  quote: string;
  body?: string;
}

export interface StatsData extends SectionBase {
  type: 'stats';
  /** Several figures per member are fine; they're grouped by member. */
  items: { member: string; value: string; label: string }[];
  note?: string;
  tbc?: boolean;
}

export interface SplitData extends SectionBase {
  type: 'split';
  /** Markdown. */
  body: string;
  image?: string;
  imageAlt?: string;
  /** Used when there's no photo yet. */
  graphic?: 'contours' | 'worldmap' | 'stack';
  imagePosition?: 'left' | 'right';
}

export interface NewsData extends SectionBase {
  type: 'news';
  limit?: number;
}

export interface ServicesData extends SectionBase {
  type: 'services';
  groups: {
    title: string;
    icon: string;
    body: string;
    services: { name: string; body: string; members: string[]; phases?: string[] }[];
  }[];
  placeholder?: boolean;
}

export interface TextData extends SectionBase {
  type: 'text';
  /** Markdown. */
  body: string;
}

export interface CtaData extends SectionBase {
  type: 'cta';
  items: { title: string; body: string; links: LinkItem[] }[];
}

export interface ContactData extends SectionBase {
  type: 'contact';
  /** Markdown, beside the form. */
  body?: string;
}

export type Section =
  | HeroData
  | MembersData
  | ExamplesData
  | LayersData
  | LifecycleData
  | CommitmentsData
  | QuoteData
  | StatsData
  | SplitData
  | NewsData
  | ServicesData
  | TextData
  | CtaData
  | ContactData;

export interface Page {
  slug: string;
  title: string;
  description: string;
  /** Detail pages open with a page hero. The home page uses a `hero` section instead. */
  hero?: { eyebrow?: string; title: string; subtitle?: string };
  sections: Section[];
  translation?: TranslationStatus;
}

export interface Member {
  slug: string;
  name: string;
  fullName: string;
  order: number;
  colour: MemberColour;
  /** Short focus label, e.g. "Information management". */
  focus: string;
  url: string;
  /** One sentence for the home page tile. */
  summary: string;
  /** Markdown, for the members page. */
  intro: string;
  skills: string[];
  focalPoint?: { name: string; role: string; photo?: string; placeholder?: boolean };
  socials?: { network: string; href: string }[];
  placeholder?: boolean;
  translation?: TranslationStatus;
}

export interface NewsItem {
  slug: string;
  title: string;
  /** ISO date, for sorting. */
  date: string;
  /** How the date shows, e.g. "November 2026". */
  dateLabel: string;
  tag: string;
  tone?: MemberColour;
  summary: string;
  href?: string;
  linkLabel?: string;
  tbc?: boolean;
  translation?: TranslationStatus;
}

export interface SiteSettings {
  name: string;
  description: string;
  email: string;
  /** False until the shared address is agreed; the contact section flags it. */
  emailConfirmed?: boolean;
  nav: { label: string; href: string }[];
  cta: LinkItem;
  footer: {
    blurb: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    base: string;
  };
}
