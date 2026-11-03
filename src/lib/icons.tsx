import {
  IconAlertTriangle,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconBulb,
  IconChartBar,
  IconClipboardList,
  IconLink,
  IconMap2,
  IconMapPin,
  IconPlant2,
  IconPuzzle,
  IconSchool,
  IconShieldCheck,
  IconUsersGroup,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';

// Content refers to icons by name. Register new ones here rather than
// importing the whole Tabler set.
const ICONS: Record<string, Icon> = {
  'alert-triangle': IconAlertTriangle,
  bulb: IconBulb,
  chart: IconChartBar,
  form: IconClipboardList,
  link: IconLink,
  map: IconMap2,
  pin: IconMapPin,
  people: IconUsersGroup,
  puzzle: IconPuzzle,
  school: IconSchool,
  shield: IconShieldCheck,
  sprout: IconPlant2,
  world: IconWorld,
};

const SOCIAL: Record<string, Icon> = {
  facebook: IconBrandFacebook,
  github: IconBrandGithub,
  instagram: IconBrandInstagram,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  youtube: IconBrandYoutube,
};

export const ICON_NAMES = Object.keys(ICONS);
export const SOCIAL_NAMES = Object.keys(SOCIAL);

export function ContentIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Component = ICONS[name] ?? IconWorld;
  return <Component size={size} stroke={1.75} aria-hidden />;
}

export function SocialIcon({ network, size = 18 }: { network: string; size?: number }) {
  const Component = SOCIAL[network] ?? IconWorld;
  return <Component size={size} stroke={1.75} aria-hidden />;
}
