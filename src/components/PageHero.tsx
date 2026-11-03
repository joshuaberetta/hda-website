import { Box, Container, Text, Title } from '@mantine/core';
import type { Page } from '../lib/types';
import { Contours } from './brand/Graphics';
import { Eyebrow } from './Typography';
import classes from './PageHero.module.css';

/** Detail-page opener: stone band with a contour texture, eyebrow, title and intro. */
export function PageHero({ hero }: { hero: NonNullable<Page['hero']> }) {
  return (
    <Box component="section" className={classes.hero}>
      <Contours seed={17} levels={14} className={classes.contours} />
      <Container className={classes.inner}>
        {hero.eyebrow && <Eyebrow>{hero.eyebrow}</Eyebrow>}
        <Title order={1} mt="md">
          {hero.title}
        </Title>
        {hero.subtitle && <Text className={classes.subtitle}>{hero.subtitle}</Text>}
      </Container>
    </Box>
  );
}
