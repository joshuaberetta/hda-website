import { SimpleGrid, Text } from '@mantine/core';
import { useContent, useT } from '../../lib/i18n';
import type { ExamplesData } from '../../lib/types';
import { asset } from '../../lib/url';
import { Contours } from '../brand/Graphics';
import { ArrowLink, LinkGroup } from '../SmartLink';
import { CardTitle, Kicker, Tbc } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './ExamplesSection.module.css';

/** One piece of work picked by each member, to show the range of skills. */
export function ExamplesSection({ section }: { section: ExamplesData }) {
  const { getMember } = useContent();
  const t = useT();
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {section.items.map((item, i) => {
          const member = getMember(item.member);
          return (
            <article key={item.title} className={classes.card} data-colour={member?.colour}>
              <div className={classes.media}>
                {item.image ? (
                  <img src={asset(item.image)} alt="" loading="lazy" />
                ) : (
                  <Contours seed={30 + i * 7} levels={10} className={classes.texture} />
                )}
                <span className={classes.badge}>{member?.name ?? item.member}</span>
              </div>
              <div className={classes.body}>
                <Kicker>{item.place}</Kicker>
                <CardTitle>{item.title}</CardTitle>
                <Text fz="sm">{item.body}</Text>
                {item.placeholder && <Tbc>{t('placeholder.placeholder')}</Tbc>}
                {item.href && (
                  <div className={classes.link}>
                    <ArrowLink href={item.href}>{t('readMore')}</ArrowLink>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </SimpleGrid>
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
