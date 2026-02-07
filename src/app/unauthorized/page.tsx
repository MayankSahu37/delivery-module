'use client';

import Link from 'next/link';
import AuthSync from '@/components/AuthSync';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <AuthSync />
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    You do not have permission to access the Delivery Portal.
                    This area is restricted to authorized delivery agents only.
                </p>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact support or try refreshing the page if you just signed up.
                    </p>
                    <Link
                        href="/api/auth/logout"
                        className="inline-block px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </div>
        </div>
    );
}
