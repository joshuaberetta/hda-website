import { Button, SimpleGrid, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { site } from '../../lib/content';
import type { ContactData } from '../../lib/types';
import { Markdown } from '../Markdown';
import { SmartLink } from '../SmartLink';
import { Eyebrow, Tbc } from '../Typography';
import { SectionShell } from './SectionShell';
import classes from './ContactSection.module.css';

/**
 * "Work with us". Until the alliance picks a form service, sending opens the
 * visitor's email app with the message filled in, addressed to site.email.
 */
function send(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const field = (name: string) => String(data.get(name) ?? '').trim();
  const subject = `Work with us: ${field('organisation') || field('name')}`;
  const body = `${field('message')}\n\n${field('name')}\n${field('organisation')}\n${field('email')}`;
  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactSection({ section }: { section: ContactData }) {
  const inputs = { input: classes.input, label: classes.label };
  return (
    <SectionShell id={section.id} background="dark" labelledBy="contact-h">
      <div className={classes.layout}>
        <div>
          {section.eyebrow && <Eyebrow onDark>{section.eyebrow}</Eyebrow>}
          <Title order={2} id="contact-h" mt="sm">
            {section.title}
          </Title>
          <div className={classes.intro}>
            <Markdown onDark>{section.body}</Markdown>
          </div>
          <Text fz="sm" mt="lg">
            Or email <SmartLink href={`mailto:${site.email}`} c="blue.3">{site.email}</SmartLink>
            {site.emailConfirmed === false && (
              <>
                {' '}
                <Tbc>Address TBC</Tbc>
              </>
            )}
          </Text>
        </div>
        <form onSubmit={send} className={classes.form}>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput name="name" label="Name" required autoComplete="name" classNames={inputs} />
            <TextInput name="organisation" label="Organisation" autoComplete="organization" classNames={inputs} />
          </SimpleGrid>
          <TextInput name="email" type="email" label="Email" required autoComplete="email" classNames={inputs} />
          <Textarea name="message" label="How can we help?" required minRows={4} autosize classNames={inputs} />
          <div>
            <Button type="submit" size="md" rightSection={<IconArrowRight size={17} stroke={2.2} aria-hidden />}>
              Send message
            </Button>
            <Text fz="xs" mt="xs">
              This opens your email app with your message ready to send.
            </Text>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
