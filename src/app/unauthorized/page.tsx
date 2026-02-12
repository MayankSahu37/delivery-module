'use client';

import Link from 'next/link';
import { ShieldX, LogOut, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)' }}>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldX className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>

                <p className="text-gray-600 mb-6" style={{ lineHeight: '1.7' }}>
                    You do not have permission to access the <strong>Delivery Portal</strong>.
                    This area is restricted to users registered as <strong>delivery agents</strong> only.
                </p>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 text-left">
                    <p className="text-sm text-amber-800 font-medium mb-1">Why am I seeing this?</p>
                    <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                        <li>Your account may be registered with a different role (patient, doctor, admin, etc.)</li>
                        <li>Your delivery agent account may not have been created yet</li>
                        <li>If you just signed up, try refreshing the page</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/api/auth/logout"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold transition-all hover:bg-red-700"
                        id="logout-btn"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout & Try Different Account
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">
                        Contact your administrator if you believe this is an error.
                    </p>
                </div>
            </div>
        </div>
    );
}
