import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  TrustedBySection,
  ServicesPreview,
  CtaSection,
  PublicFooter,
} from '@/features/landing/components'

export default function Landing() {
  return (
    <div className="pb-20 md:pb-0">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TrustedBySection />
      <ServicesPreview />
      <CtaSection />
      <PublicFooter />
    </div>
  )
}
