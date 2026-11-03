import { Text } from '@mantine/core';
import { ContentIcon } from '../../lib/icons';
import type { CommitmentsData } from '../../lib/types';
import { Markdown } from '../Markdown';
import { LinkGroup } from '../SmartLink';
import { CardTitle } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './CommitmentsSection.module.css';

/** The alliance's commitments: a ruled grid (home) or with the full text (commitments page). */
export function CommitmentsSection({ section }: { section: CommitmentsData }) {
  const detail = section.variant === 'detail';
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <div className={classes.grid} data-detail={detail || undefined}>
        {section.items.map((item, i) => (
          <div key={item.title} className={classes.item} id={detail ? `commitment-${i + 1}` : undefined}>
            <span className={classes.icon}>
              <ContentIcon name={item.icon} size={23} />
            </span>
            <div>
              <CardTitle fz={detail ? 21 : 17.5} mb={6}>
                {item.title}
              </CardTitle>
              <Text fz="sm" fw={detail ? 500 : undefined} c={detail ? 'var(--hda-ink)' : undefined}>
                {item.body}
              </Text>
              {detail && item.detail && (
                <div className={classes.detail}>
                  <Markdown>{item.detail}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
