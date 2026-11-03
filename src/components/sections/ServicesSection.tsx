import { Text, Title } from '@mantine/core';
import { getMember } from '../../lib/content';
import { ContentIcon } from '../../lib/icons';
import type { ServicesData } from '../../lib/types';
import { LinkGroup } from '../SmartLink';
import { Kicker, Tbc } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './ServicesSection.module.css';

/** The service catalogue: one panel per service area, listing who provides each service. */
export function ServicesSection({ section }: { section: ServicesData }) {
  return (
    <SectionShell id={section.id} background={section.background}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      {section.placeholder && (
        <Text fz="sm" mb="lg">
          <Tbc>Illustrative</Tbc> These services and providers are placeholders, to be replaced with the agreed service catalogue.
        </Text>
      )}
      <div className={classes.groups}>
        {section.groups.map((group, g) => (
          <section key={group.title} className={classes.group} data-slot={g % 4} aria-labelledby={`area-${g}`}>
            <header className={classes.head}>
              <span className={classes.icon}>
                <ContentIcon name={group.icon} size={23} />
              </span>
              <div>
                <Title order={3} id={`area-${g}`}>
                  {group.title}
                </Title>
                <Text fz="sm" mt={6}>
                  {group.body}
                </Text>
              </div>
            </header>
            <ul className={classes.services}>
              {group.services.map((service) => (
                <li key={service.name} className={classes.service}>
                  <div>
                    <Text fw={650} c="var(--hda-ink)">
                      {service.name}
                    </Text>
                    <Text fz="sm" mt={2}>
                      {service.body}
                    </Text>
                    {service.phases?.length ? <Kicker mt={8}>{service.phases.join(' · ')}</Kicker> : null}
                  </div>
                  <ul className={classes.providers} aria-label="Provided by">
                    {service.members.map((slug) => {
                      const member = getMember(slug);
                      return (
                        <li key={slug} data-colour={member?.colour}>
                          {member?.name ?? slug}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}
