import { loadGoogleReviews } from '@/lib/google-reviews';
import { BRAND, breadcrumbJsonLd } from '@/lib/seo';
import ReviewsSection from '@/components/site/Reviews';
import Footer from '@/components/site/Footer';
import JsonLd from '@/components/site/JsonLd';

const title = "Google Reviews — Mannar District";
const description = `Read Google reviews of ${BRAND.en} (${BRAND.ta}), panthal & decoration service in Mannar District, and write your own review on Google. வாடிக்கையாளர் மதிப்புரைகள்.`;

export const metadata = {
  title,
  description,
  alternates: { canonical: '/rating' },
  openGraph: { type: 'website', url: '/rating', title, description, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
};

export default async function RatingPage() {
  const { data: google } = await loadGoogleReviews();
  return (
    <>
      <ReviewsSection google={google} standalone />
      <Footer />
      <JsonLd data={breadcrumbJsonLd([[BRAND.en, '/'], ['Google Reviews', '/rating']])} />
    </>
  );
}
