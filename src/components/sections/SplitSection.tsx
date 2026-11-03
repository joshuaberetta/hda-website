import { Title } from '@mantine/core';
import { useT } from '../../lib/i18n';
import type { SplitData } from '../../lib/types';
import { asset } from '../../lib/url';
import { Contours, LayerStack, WorldMap } from '../brand/Graphics';
import { Markdown } from '../Markdown';
import { LinkGroup } from '../SmartLink';
import { Eyebrow } from '../Typography';
import { SectionShell, isDark } from './SectionShell';
import classes from './SplitSection.module.css';

/** Text beside a photo (or, until there's a photo, one of the brand graphics). */
export function SplitSection({ section }: { section: SplitData }) {
  const t = useT();
  const onDark = isDark(section.background);
  return (
    <SectionShell id={section.id} background={section.background}>
      <div className={classes.split} data-image-position={section.imagePosition ?? 'right'}>
        <div>
          {section.eyebrow && <Eyebrow onDark={onDark}>{section.eyebrow}</Eyebrow>}
          {section.title && (
            <Title order={2} mt="sm" mb="md">
              {section.title}
            </Title>
          )}
          <Markdown onDark={onDark}>{section.body}</Markdown>
          <LinkGroup links={section.links} onDark={onDark} />
        </div>
        <div className={classes.media} data-graphic={section.image ? undefined : (section.graphic ?? 'contours')}>
          {section.image ? (
            <img src={asset(section.image)} alt={section.imageAlt ?? ''} loading="lazy" />
          ) : section.graphic === 'worldmap' ? (
            <WorldMap step={3} arcs label={t('graphics.worldMap')} />
          ) : section.graphic === 'stack' ? (
            <LayerStack label={t('graphics.stack')} />
          ) : (
            <Contours seed={14} levels={12} className={classes.texture} />
          )}
        </div>
      </div>
    </SectionShell>
  );
}
