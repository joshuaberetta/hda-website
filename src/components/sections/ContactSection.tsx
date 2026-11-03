import { Button, SimpleGrid, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useContent, useT } from '../../lib/i18n';
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
export function ContactSection({ section }: { section: ContactData }) {
  const { site } = useContent();
  const t = useT();
  const inputs = { input: classes.input, label: classes.label };

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? '').trim();
    const subject = t('contact.subject', { from: field('organisation') || field('name') });
    const body = `${field('message')}\n\n${field('name')}\n${field('organisation')}\n${field('email')}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

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
            {t('contact.orEmail')}{' '}
            <SmartLink href={`mailto:${site.email}`} c="blue.3">
              {site.email}
            </SmartLink>
            {site.emailConfirmed === false && (
              <>
                {' '}
                <Tbc>{t('contact.addressTbc')}</Tbc>
              </>
            )}
          </Text>
        </div>
        <form onSubmit={send} className={classes.form}>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput name="name" label={t('contact.name')} required autoComplete="name" classNames={inputs} />
            <TextInput name="organisation" label={t('contact.organisation')} autoComplete="organization" classNames={inputs} />
          </SimpleGrid>
          <TextInput name="email" type="email" label={t('contact.email')} required autoComplete="email" classNames={inputs} />
          <Textarea name="message" label={t('contact.message')} required minRows={4} autosize classNames={inputs} />
          <div>
            <Button type="submit" size="md" rightSection={<IconArrowRight size={17} stroke={2.2} className="rtl-flip" aria-hidden />}>
              {t('contact.send')}
            </Button>
            <Text fz="xs" mt="xs">
              {t('contact.sendNote')}
            </Text>
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
