import { Button, Container, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { pageSlugFromPath } from '../lib/content';
import { useContent, useT } from '../lib/i18n';
import { PageHero } from '../components/PageHero';
import { SectionRenderer } from '../components/sections/SectionRenderer';
import { TranslationNotice } from '../components/TranslationNotice';
import { Eyebrow } from '../components/Typography';

export function ContentPage() {
  const { pathname } = useLocation();
  const { getPage } = useContent();
  const page = getPage(pageSlugFromPath(pathname));
  if (!page) return <NotFound />;
  // The translation note sits just under the page's opening band.
  const [first, ...rest] = page.sections;
  const opensWithHero = !page.hero && first?.type === 'hero';
  return (
    <>
      {page.hero && <PageHero hero={page.hero} />}
      {opensWithHero && <SectionRenderer sections={[first]} />}
      <TranslationNotice status={page.translation} />
      <SectionRenderer sections={opensWithHero ? rest : page.sections} />
    </>
  );
}

// Links shared before the design review moved to /designs/ (e.g. in the
// voting doc) start with one of these. They forward to the same page there.
const LEGACY = /^\/(themes|logos|palettes|results|assets)\//;

export function NotFound() {
  const t = useT();
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (LEGACY.test(pathname)) window.location.replace(`/designs${pathname}${search}${hash}`);
  }, []);
  return (
    <Container py={120}>
      <Eyebrow>{t('notFound.pageTitle')}</Eyebrow>
      <Title order={1} mt="md">
        {t('notFound.title')}
      </Title>
      <Text size="lg" mt="md" maw={560}>
        {t('notFound.body')} <a href="/designs/">/designs</a>.
      </Text>
      <Button component={Link} to="/" mt="xl" size="md">
        {t('notFound.home')}
      </Button>
    </Container>
  );
}
