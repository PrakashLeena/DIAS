import { loadGoogleReviews } from '@/lib/google-reviews';
import HomeHero from '@/components/site/HomeHero';
import CategoryGrid from '@/components/site/CategoryGrid';
import AboutSection from '@/components/site/AboutSection';
import ReviewsSection from '@/components/site/Reviews';
import Footer from '@/components/site/Footer';

export default async function HomePage() {
  const { data: google } = await loadGoogleReviews();
  return (
    <>
      <HomeHero />
      <CategoryGrid />
      <AboutSection />
      <ReviewsSection google={google} />
      <Footer />
    </>
  );
}
