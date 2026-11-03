import type { Section } from '../../lib/types';
import { CommitmentsSection } from './CommitmentsSection';
import { ContactSection } from './ContactSection';
import { ExamplesSection } from './ExamplesSection';
import { HeroSection } from './HeroSection';
import { LayersSection } from './LayersSection';
import { LifecycleSection } from './LifecycleSection';
import { MembersSection } from './MembersSection';
import { NewsSection } from './NewsSection';
import { QuoteSection } from './QuoteSection';
import { ServicesSection } from './ServicesSection';
import { SplitSection } from './SplitSection';
import { StatsSection } from './StatsSection';
import { CtaSection, TextSection } from './TextSections';

function SectionView({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} />;
    case 'members':
      return <MembersSection section={section} />;
    case 'examples':
      return <ExamplesSection section={section} />;
    case 'layers':
      return <LayersSection section={section} />;
    case 'lifecycle':
      return <LifecycleSection section={section} />;
    case 'commitments':
      return <CommitmentsSection section={section} />;
    case 'quote':
      return <QuoteSection section={section} />;
    case 'stats':
      return <StatsSection section={section} />;
    case 'split':
      return <SplitSection section={section} />;
    case 'news':
      return <NewsSection section={section} />;
    case 'services':
      return <ServicesSection section={section} />;
    case 'text':
      return <TextSection section={section} />;
    case 'cta':
      return <CtaSection section={section} />;
    case 'contact':
      return <ContactSection section={section} />;
    default:
      return null;
  }
}

export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <SectionView key={`${section.type}-${i}`} section={section} />
      ))}
    </>
  );
}
