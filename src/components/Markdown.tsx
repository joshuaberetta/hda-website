import { Typography } from '@mantine/core';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { asset } from '../lib/url';
import { SmartLink } from './SmartLink';
import classes from './Markdown.module.css';

const components: Components = {
  a: ({ href = '', children }) => <SmartLink href={href} c="var(--md-link)">
      {children}
    </SmartLink>,
  img: ({ src, alt }) => <img src={asset(typeof src === 'string' ? src : undefined)} alt={alt ?? ''} loading="lazy" />,
};

/** Renders editor-written Markdown with site link handling and typography. */
export function Markdown({ children, onDark }: { children?: string; onDark?: boolean }) {
  if (!children) return null;
  return (
    <Typography className={classes.root} data-on-dark={onDark || undefined}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </Typography>
  );
}
