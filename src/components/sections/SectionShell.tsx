import { Box, Container, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import type { Background } from '../../lib/types';
import { Contours } from '../brand/Graphics';
import { Markdown } from '../Markdown';
import { Eyebrow } from '../Typography';
import classes from './SectionShell.module.css';

export const isDark = (background?: Background) => background === 'dark';

interface SectionShellProps {
  id?: string;
  background?: Background;
  /** Seed for a contour texture behind the band (Unified's hero, lifecycle and quote bands). */
  contours?: number;
  children: ReactNode;
  size?: number;
  className?: string;
  labelledBy?: string;
}

/** Full-width band with the section's background and a centred container. */
export function SectionShell({ id, background = 'paper', contours, children, size, className, labelledBy }: SectionShellProps) {
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={labelledBy}
      className={`${classes.section} ${isDark(background) ? 'hda-dark' : ''} ${className ?? ''}`}
      data-bg={background}
    >
      {contours !== undefined && <Contours seed={contours} className={classes.contours} />}
      <Container size={size} className={classes.inner}>
        {children}
      </Container>
    </Box>
  );
}

/** Eyebrow + title + intro. Left-aligned by default, as in Unified. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  onDark,
  align = 'left',
  mb = 44,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  onDark?: boolean;
  align?: 'center' | 'left';
  mb?: number;
}) {
  if (!eyebrow && !title && !intro) return null;
  return (
    <Stack gap="sm" mb={mb} maw={720} mx={align === 'center' ? 'auto' : undefined} ta={align} align={align === 'center' ? 'center' : 'flex-start'}>
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      {title && (
        <Title order={2} id={id}>
          {title}
        </Title>
      )}
      {intro && (
        <div className={classes.intro}>
          <Markdown onDark={onDark}>{intro}</Markdown>
        </div>
      )}
    </Stack>
  );
}
