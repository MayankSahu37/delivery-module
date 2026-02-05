'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import OrderCard from '../components/OrderCard';
import { Package } from 'lucide-react';

interface AcceptedOrder extends Order {
    total_items: number;
    assigned_at: string;
}

export default function AcceptedOrdersPage() {
    const [orders, setOrders] = useState<AcceptedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchAcceptedOrders();
    }, []);

    const fetchAcceptedOrders = async () => {
        try {
            const res = await fetch('/api/delivery/accepted');
            if (res.status === 401) {
                router.push('/delivery/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch accepted orders');

            const data = await res.json();
            setOrders(data.orders);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading accepted orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Accepted Orders</h1>
                    <p className="text-muted-foreground">
                        Orders you've accepted and need to deliver
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Accepted Orders</h2>
                        <p className="text-muted-foreground mb-6">
                            You don't have any pending deliveries at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} showCompleteButton />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
