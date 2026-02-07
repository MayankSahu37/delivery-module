'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';

type ConnectionStatus = 'online' | 'limited' | 'offline';

export default function NetworkStatus() {
    const [status, setStatus] = useState<ConnectionStatus>('online');
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Only verify on client
        if (typeof window === 'undefined') return;

        const checkConnection = async () => {
            // Browser says offline -> definitely offline
            if (!navigator.onLine) {
                setStatus('offline');
                return;
            }

            // Browser says online -> verify internet access
            setIsChecking(true);
            try {
                // Use a relative path to our own API route to avoid CORS issues
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const res = await fetch('/api/ping', {
                    method: 'GET',
                    cache: 'no-store',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (res.ok) {
                    setStatus('online');
                } else {
                    // Connected to network but API unreachable (server down or no internet)
                    setStatus('limited');
                }
            } catch (error) {
                console.error("Connectivity check failed:", error);
                setStatus('limited');
            } finally {
                setIsChecking(false);
            }
        };

        // Initial check
        checkConnection();

        // Event listeners for immediate feedback
        const handleOnline = () => {
            // Optimistically set online, then verify
            setStatus('online');
            checkConnection();
        };
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodic check every 30 seconds to catch "silent" failovers
        const interval = setInterval(checkConnection, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Determine appearance based on status
    const getStatusConfig = () => {
        switch (status) {
            case 'offline':
                return {
                    icon: WifiOff,
                    label: 'Offline',
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-200'
                };
            case 'limited':
                return {
                    icon: AlertTriangle,
                    label: 'No Internet',
                    color: 'text-yellow-600', // Assuming standard Tailwind color palette or similar
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200'
                };
            case 'online':
            default:
                return {
                    icon: Wifi,
                    label: 'Online',
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md transition-all duration-300 ${config.bg} ${config.border} ${config.color}`}
            role="status"
            aria-live="polite"
        >
            <div className="relative">
                <Icon size={16} strokeWidth={2.5} />
                {isChecking && status !== 'offline' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                )}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{config.label}</span>
        </div>
    );
}
