'use client';

import { Order } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

interface OrderCardProps {
    order: Order & { total_items: number };
    showCompleteButton?: boolean;
    showIgnoreButton?: boolean;
    onIgnored?: (orderId: string) => void;
}

export default function OrderCard({ order, showCompleteButton = false, showIgnoreButton = false, onIgnored }: OrderCardProps) {
    const [loading, setLoading] = useState(false);
    const [ignoring, setIgnoring] = useState(false);
    const router = useRouter();

    const handleMarkComplete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Mark this order as delivered?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/delivery/orders/${order.id}/complete`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to mark as complete');
            }

            alert('Order marked as delivered!');
            router.refresh();
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleIgnore = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Ignore this assigned order? It will be moved to your ignored list.')) return;

        setIgnoring(true);
        try {
            const res = await fetch(`/api/delivery/orders/${order.id}/ignore`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to ignore order');
            }

            if (onIgnored) {
                onIgnored(order.id);
            } else {
                router.refresh();
                window.location.reload();
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIgnoring(false);
        }
    };

    return (
        <Link href={`/delivery/orders/${order.id}`} className="block">
            <div className="card h-full hover:border-primary-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-mono text-muted-foreground uppercase">#{order.id.slice(0, 8)}</span>
                    <span className="badge badge-pending">{order.status.replace(/_/g, ' ')}</span>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1">{order.total_items} Items</h3>
                    <p className="text-xl font-bold text-primary">${(order.total_price || 0).toFixed(2)}</p>
                </div>

                <div className="space-y-2 text-sm text-foreground">
                    <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-60">Pickup:</span>
                        <span className="font-medium">AuraSutra Medical Ltd</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-60">Deliver:</span>
                        <span className="font-medium truncate line-clamp-2">{order.delivery_address}</span>
                    </div>
                </div>

                {(showCompleteButton || showIgnoreButton) ? (
                    <div className="mt-4 pt-3 border-t border-border flex gap-2">
                        {showCompleteButton && (
                            <button
                                onClick={handleMarkComplete}
                                disabled={loading}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {loading ? 'Processing...' : 'Complete'}
                            </button>
                        )}
                        {showIgnoreButton && (
                            <button
                                onClick={handleIgnore}
                                disabled={ignoring}
                                className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                                style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                            >
                                <XCircle className="w-4 h-4" />
                                {ignoring ? 'Ignoring...' : 'Ignore'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between items-center">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="text-primary font-medium">View Details &rarr;</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
