import { SimpleGrid, Text } from '@mantine/core';
import { useContent, useT } from '../../lib/i18n';
import type { NewsData } from '../../lib/types';
import { Contours, WorldMap } from '../brand/Graphics';
import { ArrowLink, LinkGroup } from '../SmartLink';
import { CardTitle, Tbc } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './NewsSection.module.css';

/** Latest alliance news and events, newest first. */
export function NewsSection({ section }: { section: NewsData }) {
  const { news } = useContent();
  const t = useT();
  const items = news.slice(0, section.limit ?? 3);
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {items.map((item, i) => (
          <article key={item.slug} className={classes.card} data-colour={item.tone}>
            <div className={classes.thumb} data-map={i === 0 || undefined}>
              {i === 0 ? <WorldMap step={3.2} arcs={false} /> : <Contours seed={4 + i * 7} />}
            </div>
            <div className={classes.body}>
              <div className={classes.meta}>
                <span className={classes.tag}>{item.tag}</span>
                <span>
                  {item.dateLabel} {item.tbc && <Tbc>{t('placeholder.short')}</Tbc>}
                </span>
              </div>
              <CardTitle fz={18}>{item.title}</CardTitle>
              <Text fz="sm">{item.summary}</Text>
              {item.href && (
                <div className={classes.link}>
                  <ArrowLink href={item.href}>{item.linkLabel ?? t('readMore')}</ArrowLink>
                </div>
              )}
            </div>
          </article>
        ))}
      </SimpleGrid>
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
