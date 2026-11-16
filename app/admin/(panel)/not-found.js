import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-semibold text-gold-500">404</p>
      <Link href="/admin" className="btn btn-primary mt-6">
        Dashboard
      </Link>
    </div>
  );
}
