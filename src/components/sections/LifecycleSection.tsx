import { Text, Title } from '@mantine/core';
import type { LifecycleData } from '../../lib/types';
import { MiniStack } from '../brand/Graphics';
import { LinkGroup } from '../SmartLink';
import { Kicker } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './LifecycleSection.module.css';

/** The crisis lifecycle on a dark contour band; each stage adds a layer. */
export function LifecycleSection({ section }: { section: LifecycleData }) {
  return (
    <SectionShell id={section.id} background={section.background ?? 'dark'} contours={3}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} onDark />
      <ol className={classes.steps}>
        {section.items.map((step, i) => (
          <li key={step.title} className={classes.step} data-last={i === section.items.length - 1 || undefined}>
            <span className={classes.stack}>
              <MiniStack n={Math.min(i + 1, 4)} />
            </span>
            <Kicker component="span" display="block" mt={18} c="blue.3">
              {String(i + 1).padStart(2, '0')} · {step.phase}
            </Kicker>
            <Title order={3} fz={19} mt={6} mb={8}>
              {step.title}
            </Title>
            <Text fz="sm" maw={260}>
              {step.body}
            </Text>
          </li>
        ))}
      </ol>
      <LinkGroup links={section.links} onDark />
    </SectionShell>
  );
}
