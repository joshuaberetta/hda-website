import { Box, Burger, Button, Container, Drawer, Group, Menu, Stack, UnstyledButton } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { IconChevronDown, IconLanguage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { LOCALES, type Locale } from '../../lib/content';
import { localeInfo, localePrefix, useContent, useLocale, useT } from '../../lib/i18n';
import { Logo } from '../brand/Logo';
import { trimSlash } from '../../lib/url';
import { linkProps } from '../SmartLink';
import { rememberLanguage } from './LanguageSuggestion';
import classes from './Header.module.css';

/** A nav item is current when its page is open (anchors on the home page never are). */
function useIsCurrent() {
  const { pathname } = useLocation();
  return (href: string) => !href.includes('#') && href !== '/' && pathname.replace(/\/$/, '') === href;
}

/**
 * Switches language on the same page. A full page load, not a client-side
 * route: each language is its own router basename (/fr, /ar) and its own
 * prerendered HTML.
 */
function LanguageMenu() {
  const t = useT();
  const locale = useLocale();
  const { pathname: rawPath, search, hash } = useLocation();
  const pathname = trimSlash(rawPath);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const current = LOCALES.find((l) => l.code === locale)!;
  const href = (code: Locale) =>
    `${base}${localePrefix(code)}${pathname === '/' && localePrefix(code) ? '' : pathname}${search}${hash}` || '/';

  return (
    <Menu position="bottom-end" radius="md" shadow="md">
      <Menu.Target>
        <UnstyledButton className={classes.language} aria-label={`${t('header.language')}: ${current.name}`}>
          <IconLanguage size={18} stroke={1.75} aria-hidden />
          <span lang={current.code}>{current.code.toUpperCase()}</span>
          <IconChevronDown size={14} stroke={2.5} aria-hidden />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown miw={160}>
        {LOCALES.map((l) => (
          <Menu.Item
            key={l.code}
            component="a"
            href={href(l.code)}
            onClick={() => rememberLanguage(l.code)}
            lang={l.code}
            hrefLang={l.code}
            dir={l.dir}
            aria-current={l.code === locale ? 'true' : undefined}
            fw={l.code === locale ? 700 : undefined}
          >
            {l.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

export function Header() {
  const t = useT();
  const { site } = useContent();
  const dir = localeInfo(useLocale()).dir;
  const [opened, { toggle, close }] = useDisclosure(false);
  const isCurrent = useIsCurrent();
  const { pathname, hash } = useLocation();
  // The shadow only shows once the page scrolls. Window state is read after
  // hydration so the prerendered HTML matches.
  const [scroll] = useWindowScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setScrolled(scroll.y > 4), [scroll.y]);
  useEffect(close, [pathname, hash, close]);

  return (
    <Box component="header" className={classes.header} data-scrolled={scrolled || undefined}>
      <Container size={1280} h="100%">
        <Group h="100%" justify="space-between" wrap="nowrap" gap="xl">
          <Link to="/" className={classes.brand} aria-label={t('header.home', { name: site.name })}>
            <Logo />
          </Link>
          <Group component="nav" aria-label={t('header.mainMenu')} gap={30} visibleFrom="md" className={classes.nav} wrap="nowrap">
            {site.nav.map((item) => (
              <Link key={item.href} to={item.href} className={classes.link} aria-current={isCurrent(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </Group>
          <Group gap="sm" wrap="nowrap">
            <LanguageMenu />
            <Button size="sm" {...linkProps(site.cta.href)} className={classes.cta}>
              {site.cta.label}
            </Button>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label={t('header.openMenu')} />
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position={dir === 'rtl' ? 'left' : 'right'}
        size={300}
        title={<Logo size={14} />}
        hiddenFrom="md"
        overlayProps={{ backgroundOpacity: 0.2, blur: 10, color: '#0e2a47' }}
      >
        <Stack component="nav" aria-label={t('header.mainMenu')} gap={4}>
          {site.nav.map((item) => (
            <UnstyledButton key={item.href} component={Link} to={item.href} className={classes.drawerLink} aria-current={isCurrent(item.href) ? 'page' : undefined}>
              {item.label}
            </UnstyledButton>
          ))}
          <Button mt="lg" {...linkProps(site.cta.href)}>
            {site.cta.label}
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}

