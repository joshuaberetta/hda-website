import { Text, Title, type TextProps, type TitleProps } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './Typography.module.css';

/** Mono uppercase line with a red dot, above a section or hero title. */
export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  return (
    <Text component="p" className={classes.eyebrow} data-on-dark={onDark || undefined}>
      {children}
    </Text>
  );
}

/** Small mono label inside a card: a layer number, a place, a stat's member. */
export function Kicker({
  children,
  component = 'p',
  ...rest
}: { children: ReactNode; component?: 'p' | 'span' | 'div' } & TextProps) {
  return (
    <Text component={component} className={classes.kicker} {...rest}>
      {children}
    </Text>
  );
}

/** Card heading: Plus Jakarta 19px (or 22px for `lg`). */
export function CardTitle({
  children,
  size = 'md',
  ...rest
}: { children: ReactNode; size?: 'md' | 'lg' } & Omit<TitleProps, 'size'>) {
  return (
    <Title order={3} fz={size === 'lg' ? 22 : 19} lh={1.25} {...rest}>
      {children}
    </Title>
  );
}

/** Marks copy that's waiting on the team: visible to reviewers, easy to find later. */
export function Tbc({ children = 'To be confirmed' }: { children?: ReactNode }) {
  return <span className={classes.tbc}>{children}</span>;
}
