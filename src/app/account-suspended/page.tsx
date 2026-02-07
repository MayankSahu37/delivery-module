import Link from 'next/link';

export default function AccountSuspendedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h1>
                <p className="text-gray-600 mb-6">
                    Your delivery agent account has been suspended.
                    Please contact the administrator for more information.
                </p>
                <Link
                    href="/api/auth/logout"
                    className="inline-block px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                >
                    Logout
                </Link>
            </div>
        </div>
    );
}
