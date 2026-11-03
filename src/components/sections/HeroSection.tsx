import { Box, Container, Text, Title } from '@mantine/core';
import { useContent, useT } from '../../lib/i18n';
import type { HeroData } from '../../lib/types';
import { Contours, WorldMap } from '../brand/Graphics';
import { LinkGroup } from '../SmartLink';
import classes from './HeroSection.module.css';

/** Splits off the highlighted end of the title so it can be set in red. */
function splitTitle(title: string, highlight?: string) {
  if (!highlight || !title.endsWith(highlight)) return [title, ''];
  return [title.slice(0, title.length - highlight.length), highlight];
}

/** Home page hero: Unified's contour paper with the world map and map-label pins. */
export function HeroSection({ section }: { section: HeroData }) {
  const { members } = useContent();
  const t = useT();
  const [lead, highlight] = splitTitle(section.title, section.highlight);
  return (
    <Box component="section" id={section.id} className={classes.hero} aria-labelledby="hero-title">
      <Contours seed={21} levels={16} className={classes.contours} />
      <Container className={classes.inner}>
        <div>
          <ul className={classes.members} aria-label={t('hero.members')}>
            {members.map((m) => (
              <li key={m.slug} data-colour={m.colour}>
                {m.name}
              </li>
            ))}
          </ul>
          <Title order={1} id="hero-title" className={classes.title}>
            {lead}
            {highlight && <em>{highlight}</em>}
          </Title>
          <Text className={classes.lead}>{section.subtitle}</Text>
          <LinkGroup links={section.links} mt="xl" />
        </div>
        <div className={classes.visual}>
          <WorldMap step={2.4} className={classes.map} label={t('graphics.worldMap')} />
          {section.pins?.map((pin, i) => (
            <div key={pin.title} className={classes.pin} data-pin={i} aria-hidden>
              <b>{pin.title}</b>
              {pin.body}
              <small>{pin.label}</small>
            </div>
          ))}
        </div>
      </Container>
    </Box>
  );
}
