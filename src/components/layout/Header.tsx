import { Box, Burger, Button, Container, Drawer, Group, Stack, UnstyledButton } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { site } from '../../lib/content';
import { Logo } from '../brand/Logo';
import { linkProps } from '../SmartLink';
import classes from './Header.module.css';

/** A nav item is current when its page is open (anchors on the home page never are). */
function useIsCurrent() {
  const { pathname } = useLocation();
  return (href: string) => !href.includes('#') && href !== '/' && pathname.replace(/\/$/, '') === href;
}

export function Header() {
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
          <Link to="/" className={classes.brand} aria-label={`${site.name}, home`}>
            <Logo />
          </Link>
          <Group component="nav" aria-label="Main" gap={30} visibleFrom="md" className={classes.nav} wrap="nowrap">
            {site.nav.map((item) => (
              <Link key={item.href} to={item.href} className={classes.link} aria-current={isCurrent(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Button size="sm" {...linkProps(site.cta.href)} className={classes.cta}>
              {site.cta.label}
            </Button>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Open menu" />
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size={300}
        title={<Logo size={14} />}
        hiddenFrom="md"
        overlayProps={{ backgroundOpacity: 0.2, blur: 10, color: '#0e2a47' }}
      >
        <Stack component="nav" aria-label="Main" gap={4}>
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
