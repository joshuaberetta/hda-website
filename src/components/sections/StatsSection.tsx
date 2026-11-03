import { SimpleGrid, Text } from '@mantine/core';
import { useContent } from '../../lib/i18n';
import type { StatsData } from '../../lib/types';
import { LinkGroup } from '../SmartLink';
import { Kicker, Tbc } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './StatsSection.module.css';

/**
 * Combined reach. Each figure is labelled with its member: members measure
 * different things, so the figures are shown side by side, never added up.
 */
export function StatsSection({ section }: { section: StatsData }) {
  const { getMember } = useContent();
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <SimpleGrid cols={{ base: 1, xs: 2, md: Math.min(section.items.length, 4) }} spacing="md">
        {section.items.map((item) => {
          const member = getMember(item.member);
          return (
            <div key={`${item.member}-${item.label}`} className={classes.stat} data-colour={member?.colour}>
              <Kicker>{member?.name ?? item.member}</Kicker>
              <b className={classes.value}>{item.value}</b>
              <Text fz="sm">{item.label}</Text>
            </div>
          );
        })}
      </SimpleGrid>
      {(section.note || section.tbc) && (
        <Text fz="xs" mt="md">
          {section.note} {section.tbc && <Tbc />}
        </Text>
      )}
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
