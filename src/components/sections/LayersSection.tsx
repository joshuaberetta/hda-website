import { Text, VisuallyHidden } from '@mantine/core';
import { useState } from 'react';
import { useT } from '../../lib/i18n';
import { ContentIcon } from '../../lib/icons';
import type { LayersData } from '../../lib/types';
import { LayerStack } from '../brand/Graphics';
import { LinkGroup } from '../SmartLink';
import { Kicker } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './LayersSection.module.css';

/**
 * Services as map layers (Unified): each service is one layer of the stack,
 * and switching it off lifts that layer away. Items are listed top layer first.
 */
export function LayersSection({ section }: { section: LayersData }) {
  const t = useT();
  const [off, setOff] = useState<number[]>([]);
  const top = section.items.length - 1;
  const toggle = (layer: number, on: boolean) =>
    setOff((current) => (on ? current.filter((l) => l !== layer) : [...current, layer]));

  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      <div className={classes.wrap}>
        <div className={classes.visual}>
          <LayerStack off={off} label={t('graphics.stackWith', { layers: section.items.map((i) => i.title).join(', ') })} />
        </div>
        <fieldset className={classes.list}>
          <VisuallyHidden component="legend">{t('layers.legend')}</VisuallyHidden>
          {section.items.map((item, i) => {
            const layer = top - i;
            return (
              <label key={item.title} className={classes.item} data-slot={i} data-off={off.includes(layer) || undefined}>
                <span className={classes.icon}>
                  <ContentIcon name={item.icon} size={23} />
                </span>
                <span>
                  <Kicker component="span" display="block" mb={4}>
                    {item.label}
                  </Kicker>
                  <span className={classes.title}>{item.title}</span>
                  <Text component="span" display="block" fz="sm">
                    {item.body}
                  </Text>
                </span>
                <input type="checkbox" checked={!off.includes(layer)} onChange={(e) => toggle(layer, e.currentTarget.checked)} />
              </label>
            );
          })}
          {section.hint && <p className={classes.hint}>{section.hint}</p>}
        </fieldset>
      </div>
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
