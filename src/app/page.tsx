
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">AuraSutra Delivery</h1>
        <p className="text-muted-foreground text-lg">
          Welcome to the delivery partner portal. Please login to manage your deliveries.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/delivery/login" className="btn btn-primary px-8 py-3 text-lg shadow-xl shadow-primary/20">
            Partner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
