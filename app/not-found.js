import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to shop
      </Link>
    </div>
  );
}
