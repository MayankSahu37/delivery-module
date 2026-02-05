'use client';

import { Order } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface OrderCardProps {
    order: Order & { total_items: number };
    showCompleteButton?: boolean;
}

export default function OrderCard({ order, showCompleteButton = false }: OrderCardProps) {
    const [loading, setLoading] = useState(false);
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
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
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

                {showCompleteButton ? (
                    <div className="mt-4 pt-3 border-t border-border">
                        <button
                            onClick={handleMarkComplete}
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {loading ? 'Processing...' : 'Mark as Complete'}
                        </button>
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
