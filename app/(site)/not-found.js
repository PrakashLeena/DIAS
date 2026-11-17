import Link from 'next/link';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>🔍</p>
      <h1 className="mt-3 text-2xl">பக்கம் கிடைக்கவில்லை</h1>
      <p className="text-ink-500">Page not found</p>
      <Link href="/" className="btn btn-primary mt-6">
        முகப்பு / Home
      </Link>
    </div>
  );
}
