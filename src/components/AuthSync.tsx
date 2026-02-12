'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSync() {
    const [synced, setSynced] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function syncUser() {
            if (synced) return;

            try {
                const res = await fetch('/api/auth/sync', {
                    method: 'POST',
                });

                const data = await res.json();

                if (data.success) {
                    setSynced(true);
                    // Refresh if new account or linked
                    if (data.message.includes('created') || data.message.includes('linked')) {
                        // Force hard navigation to dashboard to re-trigger layout checks
                        window.location.href = '/delivery/dashboard';
                    }
                } else if (data.unauthorized) {
                    // User has a different role — redirect to unauthorized page
                    window.location.href = '/unauthorized';
                } else {
                    console.error('Sync failed:', data.error);
                }
            } catch (error) {
                console.error('Sync error:', error);
            }
        }

        syncUser();
    }, [synced, router]);

    return null; // Invisible component
}
