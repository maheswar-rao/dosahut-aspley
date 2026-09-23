import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { FoodShowcase } from "@/components/FoodShowcase";
import { OurStory } from "@/components/OurStory";
import { WhyUs } from "@/components/WhyUs";
import { FlavorFinder } from "@/components/FlavorFinder";
import { Catering } from "@/components/Catering";
import { Location } from "@/components/Location";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <TrustStrip />
      <FoodShowcase />
      <OurStory />
      <WhyUs />
      <FlavorFinder />
      <Catering />
      <Location />
      <Footer />
    </main>
  );
}
