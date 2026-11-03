import { Button, Container, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { pageForPath } from '../lib/content';
import { PageHero } from '../components/PageHero';
import { SectionRenderer } from '../components/sections/SectionRenderer';
import { Eyebrow } from '../components/Typography';

export function ContentPage() {
  const { pathname } = useLocation();
  const page = pageForPath(pathname);
  if (!page) return <NotFound />;
  return (
    <>
      {page.hero && <PageHero hero={page.hero} />}
      <SectionRenderer sections={page.sections} />
    </>
  );
}

// Links shared before the design review moved to /designs/ (e.g. in the
// voting doc) start with one of these. They forward to the same page there.
const LEGACY = /^\/(themes|logos|palettes|results|assets)\//;

export function NotFound() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (LEGACY.test(pathname)) window.location.replace(`/designs${pathname}${search}${hash}`);
  }, [pathname, search, hash]);
  return (
    <Container py={120}>
      <Eyebrow>Page not found</Eyebrow>
      <Title order={1} mt="md">
        We couldn’t find that page.
      </Title>
      <Text size="lg" mt="md" maw={560}>
        It may have moved. The design review is now at{' '}
        <a href="/designs/">/designs</a>.
      </Text>
      <Button component={Link} to="/" mt="xl" size="md">
        Go to the home page
      </Button>
    </Container>
  );
}
