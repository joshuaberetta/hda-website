import { IconUser } from '@tabler/icons-react';
import { ActionIcon, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { members } from '../../lib/content';
import { SocialIcon } from '../../lib/icons';
import type { Member, MembersData } from '../../lib/types';
import { asset } from '../../lib/url';
import { CheckList } from '../CheckList';
import { Markdown } from '../Markdown';
import { ArrowLink, LinkGroup } from '../SmartLink';
import { CardTitle, Kicker, Tbc } from '../Typography';
import { SectionHeading, SectionShell } from './SectionShell';
import classes from './MembersSection.module.css';

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Four pastel tiles (home) or one panel per member (members page). */
export function MembersSection({ section }: { section: MembersData }) {
  const detail = section.variant === 'detail';
  return (
    <SectionShell id={section.id} background={section.background} labelledBy={section.title ? `${section.id ?? 'members'}-h` : undefined}>
      <SectionHeading id={`${section.id ?? 'members'}-h`} eyebrow={section.eyebrow} title={section.title} intro={section.intro} align={section.align} />
      {detail ? (
        <Stack gap="lg">
          {members.map((m, i) => (
            <MemberPanel key={m.slug} member={m} index={i} />
          ))}
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          {members.map((m, i) => (
            <article key={m.slug} className={classes.tile} data-colour={m.colour}>
              <Kicker>
                {String(i + 1).padStart(2, '0')} · {m.focus}
              </Kicker>
              <CardTitle size="lg">{m.name}</CardTitle>
              <Text fz="sm" lh={1.55} className={classes.summary}>
                {m.summary}
              </Text>
              <a className={classes.site} href={m.url} target="_blank" rel="noopener noreferrer">
                {host(m.url)} ↗
              </a>
            </article>
          ))}
        </SimpleGrid>
      )}
      <LinkGroup links={section.links} />
    </SectionShell>
  );
}

function MemberPanel({ member: m, index }: { member: Member; index: number }) {
  const fp = m.focalPoint;
  return (
    <article id={m.slug} className={classes.panel} data-colour={m.colour} aria-labelledby={`${m.slug}-h`}>
      <div className={classes.panelMain}>
        <Kicker>
          {String(index + 1).padStart(2, '0')} · {m.focus}
        </Kicker>
        <Title order={2} id={`${m.slug}-h`} mt={6}>
          {m.name}
        </Title>
        <Text fw={500} c="var(--hda-ink)" mt={4} mb="md">
          {m.fullName}
          {m.placeholder && (
            <>
              {' '}
              <Tbc>Draft</Tbc>
            </>
          )}
        </Text>
        <Markdown>{m.intro}</Markdown>
        <Group gap="lg" mt="lg">
          <ArrowLink href={m.url}>{host(m.url)}</ArrowLink>
          <Group gap={4}>
            {m.socials?.map((s) => (
              <ActionIcon
                key={s.href}
                component="a"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="navy.8"
                aria-label={`${m.name} on ${s.network}`}
              >
                <SocialIcon network={s.network} />
              </ActionIcon>
            ))}
          </Group>
        </Group>
      </div>
      <div className={classes.panelSide}>
        <div className={classes.card}>
          <Kicker mb="sm">What {m.name} brings</Kicker>
          <CheckList items={m.skills} />
        </div>
        {fp && (
          <div className={`${classes.card} ${classes.person}`}>
            {fp.photo ? (
              <img src={asset(fp.photo)} alt="" className={classes.photo} loading="lazy" />
            ) : (
              <span className={classes.photo} data-empty aria-hidden>
                <IconUser size={28} stroke={1.5} />
              </span>
            )}
            <div>
              <Kicker>Focal point</Kicker>
              <Text fw={650} c="var(--hda-ink)" mt={2}>
                {fp.name}
              </Text>
              <Text fz="sm">{fp.role}</Text>
              {fp.placeholder && <Tbc />}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
