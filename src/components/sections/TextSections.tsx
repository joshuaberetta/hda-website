import { SimpleGrid, Text, Title } from '@mantine/core';
import type { CtaData, TextData } from '../../lib/types';
import { Markdown } from '../Markdown';
import { LinkGroup } from '../SmartLink';
import { SectionHeading, SectionShell, isDark } from './SectionShell';
import classes from './TextSections.module.css';

/** Long text (Markdown) at a readable width. */
export function TextSection({ section }: { section: TextData }) {
  const onDark = isDark(section.background);
  return (
    <SectionShell id={section.id} background={section.background} size={860}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} onDark={onDark} />
      <Markdown onDark={onDark}>{section.body}</Markdown>
      <LinkGroup links={section.links} onDark={onDark} />
    </SectionShell>
  );
}

/** Two next steps side by side, closing a page (kobo.ngo's call-to-action row). */
export function CtaSection({ section }: { section: CtaData }) {
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <SimpleGrid cols={{ base: 1, sm: section.items.length > 1 ? 2 : 1 }} spacing="xl">
        {section.items.map((item) => (
          <div key={item.title} className={classes.cta}>
            <Title order={2} fz={{ base: 26, sm: 32 }}>
              {item.title}
            </Title>
            <Text mt="sm">{item.body}</Text>
            <div className={classes.links}>
              <LinkGroup links={item.links} mt="lg" />
            </div>
          </div>
        ))}
      </SimpleGrid>
    </SectionShell>
  );
}
