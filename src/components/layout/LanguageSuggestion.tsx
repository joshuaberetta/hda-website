import { Button, Container, Group, Text } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { DEFAULT_LOCALE, LOCALES, metaForPath, registerTranslations, type Locale } from '../../lib/content';
import { localeInfo, localePrefix, translator, useLocale } from '../../lib/i18n';
import { translationChunks } from '../../lib/translations';
import { asset, trimSlash } from '../../lib/url';
import classes from './LanguageSuggestion.module.css';

/** The language a visitor picked in the language menu, or dismissed a suggestion with. */
const STORAGE_KEY = 'hda-language';

export function rememberLanguage(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Private browsing or storage disabled: nothing to remember.
  }
}

function preferredLocale(): Locale | undefined {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return undefined;
  } catch {
    return undefined;
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.toLowerCase().split('-')[0];
    if (code === DEFAULT_LOCALE) return undefined;
    const match = LOCALES.find((l) => l.code === code);
    if (match) return match.code;
  }
  return undefined;
}

/**
 * On English pages, offers the page in the visitor's browser language (in
 * that language) if it's translated. Never redirects; choosing either option
 * is remembered. That language's text is only downloaded when it's offered.
 */
export function LanguageSuggestion() {
  const locale = useLocale();
  const { pathname } = useLocation();
  const [offer, setOffer] = useState<Locale>();

  useEffect(() => {
    if (locale !== DEFAULT_LOCALE) return;
    const target = preferredLocale();
    const chunk = target && translationChunks[target as keyof typeof translationChunks];
    if (!target || !chunk) return;
    let cancelled = false;
    chunk().then(({ default: files }) => {
      registerTranslations(target, files);
      if (!cancelled && metaForPath(pathname, target).translation !== 'missing') setOffer(target);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, pathname]);

  if (!offer) return null;
  const t = translator(offer);
  const { code, dir } = localeInfo(offer);
  const dismiss = () => {
    rememberLanguage(DEFAULT_LOCALE);
    setOffer(undefined);
  };

  return (
    <div className={classes.bar} lang={code} dir={dir} role="region" aria-label={t('header.language')}>
      <Container size={1280}>
        <Group justify="space-between" gap="sm">
          <Group gap={8} wrap="nowrap">
            <IconLanguage size={18} stroke={1.75} aria-hidden />
            <Text fz="sm">{t('languageSuggestion.available')}</Text>
          </Group>
          <Group gap="xs">
            <Button
              component="a"
              size="xs"
              color="white"
              c="navy.8"
              href={asset(`${localePrefix(offer)}${pathname === '/' ? '' : trimSlash(pathname)}`) || '/'}
              onClick={() => rememberLanguage(offer)}
            >
              {t('languageSuggestion.switch')}
            </Button>
            <Button size="xs" variant="subtle" color="white" onClick={dismiss}>
              {t('languageSuggestion.dismiss')}
            </Button>
          </Group>
        </Group>
      </Container>
    </div>
  );
}
