import HeroSection from '@/components/home/HeroSection';
import LogoMarquee from '@/components/ui/LogoMarquee';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import MinimalArchitectureSection from '@/components/home/MinimalArchitectureSection';
import EditorialJournal from '@/components/home/EditorialJournal';
import MinimalFAQ from '@/components/home/MinimalFAQ';
import { supplements } from '@/data/supplements';
import { articles } from '@/data/articles';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. 21st.dev Hero Minimalism + 3-Piece Editorial Lookbook */}
      <HeroSection />

      {/* 2. Whisper-Quiet Editorial Brand & Science Marquee */}
      <LogoMarquee />

      {/* 3. Curated Minimalist Collection Grid (Underline AnimatedTabs) */}
      <FeaturedProducts />

      {/* 4. 1px-Hairline Architectural Split: Live Protein Studio + Clinical Evidence Dossier */}
      <MinimalArchitectureSection supplements={supplements} />

      {/* 5. Minimal Editorial Research Journal */}
      <EditorialJournal articles={articles} />

      {/* 6. Minimal Motion Accordion FAQ & Safety */}
      <MinimalFAQ />
    </div>
  );
}
