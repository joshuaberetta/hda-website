import { Container, Group, Text } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useLocation } from 'react-router';
import { useT } from '../lib/i18n';
import type { TranslationStatus } from '../lib/types';
import { asset, trimSlash } from '../lib/url';
import classes from './TranslationNotice.module.css';

/**
 * A slim note under the hero on pages whose text a person hasn't checked yet:
 * machine translations, and pages with no translation (shown in English).
 */
export function TranslationNotice({ status }: { status?: TranslationStatus }) {
  const t = useT();
  const { pathname } = useLocation();
  if (status !== 'machine' && status !== 'outdated' && status !== 'retranslate' && status !== 'missing') return null;
  return (
    <div className={classes.bar} role="note">
      <Container size={1280}>
        <Group gap={8} wrap="nowrap" align="flex-start">
          <IconLanguage size={18} stroke={1.75} className={classes.icon} aria-hidden />
          <Text fz="sm">
            {status === 'missing' ? t('translationNotice.missing') : t('translationNotice.machine')}{' '}
            {status !== 'missing' && (
              // A plain link: English has no language prefix, so it's a different router basename.
              <a href={asset(trimSlash(pathname))} lang="en" hrefLang="en" className={classes.link}>
                {t('translationNotice.readEnglish')}
              </a>
            )}
          </Text>
        </Group>
      </Container>
    </div>
  );
}
