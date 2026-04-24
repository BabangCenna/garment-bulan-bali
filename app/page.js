import { getSiteConfig } from "@/app/actions/settings";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import StylesSection from "@/components/landing/StylesSection";
import FabricsSection from "@/components/landing/FabricsSection";
import AboutSection from "@/components/landing/AboutSection";
import ContactSection from "@/components/landing/ContactSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default async function LandingPage() {
  const config = await getSiteConfig();

  // merge site + contact so nav/footer get one object like before
  const site = { ...config.site, contact: config.contact };

  return (
    <main className='min-h-screen bg-[#FDF8F5] text-[#3D2B1F]'>
      <LandingNav site={site} />
      <HeroSection hero={config.hero} />
      <StylesSection styles={config.styles} />
      <FabricsSection fabrics={config.fabrics} />
      <AboutSection about={config.about} />
      <ContactSection contact={config.contact} siteName={config.site.name} />
      <LandingFooter site={site} />
    </main>
  );
}
