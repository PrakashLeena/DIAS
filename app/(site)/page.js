import { getContent, getReviews } from '@/lib/content';
import HomeHero from '@/components/site/HomeHero';
import CategoryGrid from '@/components/site/CategoryGrid';
import AboutSection from '@/components/site/AboutSection';
import ReviewsSection from '@/components/site/Reviews';
import Footer from '@/components/site/Footer';

export default async function HomePage() {
  const reviews = await getReviews();
  return (
    <>
      <HomeHero />
      <CategoryGrid />
      <AboutSection />
      <ReviewsSection initial={reviews} />
      <Footer />
    </>
  );
}
