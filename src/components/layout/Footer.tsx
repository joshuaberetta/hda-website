import { ActionIcon, Box, Container, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { Link } from 'react-router';
import { useContent, useT } from '../../lib/i18n';
import { SocialIcon } from '../../lib/icons';
import { Logo } from '../brand/Logo';
import { OffsiteIcon, SmartLink, isOffsite } from '../SmartLink';
import classes from './Footer.module.css';

export function Footer() {
  const { site, members } = useContent();
  const t = useT();
  const { footer } = site;
  return (
    <Box component="footer" className={`${classes.footer} hda-dark`}>
      <Container size={1280}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={40} className={classes.grid}>
          <Stack gap="lg">
            <Link to="/" className={classes.brand} aria-label={t('header.home', { name: site.name })}>
              <Logo size={16} />
            </Link>
            <Text fz="sm" maw={340}>
              {footer.blurb}
            </Text>
          </Stack>
          {footer.columns.map((column) => (
            <div key={column.title}>
              <h2 className={classes.label}>{column.title}</h2>
              <ul className={classes.list}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <SmartLink href={link.href} c="var(--footer-link)" className={classes.link}>
                      {link.label}
                      {isOffsite(link.href) && <OffsiteIcon size={13} />}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* No alliance channels yet: point to each member's own. */}
          <div>
            <h2 className={classes.label}>{t('footer.followMembers')}</h2>
            <Stack gap={10}>
              {members.map((member) => (
                <Group key={member.slug} gap={6} wrap="nowrap">
                  <Text fz="sm" w={72}>
                    {member.name}
                  </Text>
                  {member.socials?.map((social) => (
                    <ActionIcon
                      key={social.href}
                      component="a"
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="subtle"
                      color="gray.3"
                      size="sm"
                      aria-label={t('social.on', { name: member.name, network: social.network })}
                    >
                      <SocialIcon network={social.network} size={17} />
                    </ActionIcon>
                  ))}
                </Group>
              ))}
            </Stack>
          </div>
        </SimpleGrid>
      </Container>
      <div className={classes.base}>
        <Container size={1280}>
          <Group justify="space-between" gap="sm">
            <span>{t('footer.copyright', { year: import.meta.env.VITE_BUILD_YEAR, name: site.name })}</span>
            <span>{footer.base}</span>
          </Group>
        </Container>
      </div>
    </Box>
  );
}
