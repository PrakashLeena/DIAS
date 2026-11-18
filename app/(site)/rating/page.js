import { getReviews } from '@/lib/content';
import { BRAND, breadcrumbJsonLd } from '@/lib/seo';
import ReviewsSection from '@/components/site/Reviews';
import Footer from '@/components/site/Footer';
import JsonLd from '@/components/site/JsonLd';

const title = "Customer Ratings & Reviews — Vankalai, Mannar";
const description = `Read what customers say about ${BRAND.en} (${BRAND.ta}) in Vankalai, Mannar, and share your own rating. வாடிக்கையாளர் மதிப்புரைகள் — உங்கள் கருத்தைப் பதிவிடுங்கள்.`;

export const metadata = {
  title,
  description,
  alternates: { canonical: '/rating' },
  openGraph: { type: 'website', url: '/rating', title, description, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
};

export default async function RatingPage() {
  const reviews = await getReviews();
  return (
    <>
      <ReviewsSection initial={reviews} standalone />
      <Footer />
      <JsonLd data={breadcrumbJsonLd([[BRAND.en, '/'], ['Ratings & Reviews', '/rating']])} />
    </>
  );
}
