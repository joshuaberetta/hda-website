import type { QuoteData } from '../../lib/types';
import { LogoMark } from '../brand/Logo';
import { SectionShell } from './SectionShell';
import classes from './QuoteSection.module.css';

/** The alliance's principle, on contour paper with the mark at its summit. */
export function QuoteSection({ section }: { section: QuoteData }) {
  return (
    <SectionShell id={section.id} background={section.background ?? 'stone'} contours={9}>
      <figure className={classes.quote}>
        <LogoMark className={classes.mark} />
        <blockquote className={classes.text}>
          <p className={classes.lead}>{section.quote}</p>
          {section.body && <p>{section.body}</p>}
        </blockquote>
      </figure>
    </SectionShell>
  );
}
