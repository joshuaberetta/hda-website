import { Anchor, Button, Group, type AnchorProps, type ButtonProps } from '@mantine/core';
import { IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useT } from '../lib/i18n';
import type { LinkItem } from '../lib/types';
import { asset, isExternal, isRouterLink } from '../lib/url';
import classes from './SmartLink.module.css';

/**
 * Props that make any Mantine component behave as the right kind of link.
 * `component` is typed loosely because Mantine's polymorphic props can't
 * accept a union of "router Link" and "plain <a>".
 */
interface LinkLikeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
}

/** Links that leave the site (not mail links); these get a ↗ icon. */
export function isOffsite(href: string): boolean {
  return /^(https?:)?\/\//.test(href);
}

export function linkProps(href: string): LinkLikeProps {
  if (isRouterLink(href)) return { component: Link, to: href };
  const external = isExternal(href) && !href.startsWith('mailto:') && !href.startsWith('tel:');
  return {
    component: 'a',
    href: asset(href),
    ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  };
}

/** The ↗ marker for off-site links in lists. */
export function OffsiteIcon({ size = 14 }: { size?: number }) {
  const t = useT();
  return <IconArrowUpRight size={size} stroke={2} aria-label={t('opensAnotherSite')} />;
}

export function SmartLink({ href, children, ...rest }: { href: string; children: ReactNode } & AnchorProps) {
  return (
    <Anchor {...rest} {...linkProps(href)}>
      {children}
    </Anchor>
  );
}

/** Text link with an arrow that slides on hover (↗ for off-site links). */
export function ArrowLink({ href, children, light }: { href: string; children: ReactNode; light?: boolean }) {
  const t = useT();
  const offsite = isOffsite(href);
  const Arrow = offsite ? IconArrowUpRight : IconArrowRight;
  return (
    <Anchor {...linkProps(href)} c="var(--arrow-color)" className={classes.arrow} data-light={light || undefined}>
      {children}
      <Arrow
        size={17}
        stroke={2.2}
        className={classes.chevron}
        data-offsite={offsite || undefined}
        aria-label={offsite ? t('opensAnotherSite') : undefined}
        aria-hidden={offsite ? undefined : true}
      />
    </Anchor>
  );
}

export function LinkButton({ link, onDark, ...rest }: { link: LinkItem; onDark?: boolean } & ButtonProps) {
  if (link.variant === 'arrow') {
    return (
      <ArrowLink href={link.href} light={onDark}>
        {link.label}
      </ArrowLink>
    );
  }
  // The secondary button is a navy outline (white on dark bands).
  if (link.variant === 'outline') {
    return (
      <Button size="md" variant="outline" color={onDark ? 'white' : 'navy.8'} className={classes.outline} {...rest} {...linkProps(link.href)}>
        {link.label}
      </Button>
    );
  }
  return (
    <Button size="md" rightSection={<IconArrowRight size={17} stroke={2.2} className="rtl-flip" aria-hidden />} {...rest} {...linkProps(link.href)}>
      {link.label}
    </Button>
  );
}

export function LinkGroup({ links, onDark, justify, mt = 'xl' }: { links?: LinkItem[]; onDark?: boolean; justify?: string; mt?: string }) {
  if (!links?.length) return null;
  return (
    <Group gap="md" mt={mt} justify={justify}>
      {links.map((link) => (
        <LinkButton key={link.href + link.label} link={link} onDark={onDark} />
      ))}
    </Group>
  );
}
