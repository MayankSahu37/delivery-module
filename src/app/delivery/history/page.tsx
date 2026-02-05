
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle2, Truck } from 'lucide-react';

interface HistoryOrder extends Order {
    total_items: number;
    assigned_at: string;
}

export default function HistoryPage() {
    const [orders, setOrders] = useState<HistoryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/delivery/history');
            if (res.status === 401) {
                router.push('/delivery/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch history');

            const data = await res.json();
            setOrders(data.orders);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED_FOR_DELIVERY':
                return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            case 'OUT_FOR_DELIVERY':
                return <Truck className="w-5 h-5 text-orange-500" />;
            case 'DELIVERED':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'ACCEPTED_FOR_DELIVERY':
                return 'badge-accepted';
            case 'OUT_FOR_DELIVERY':
                return 'badge-in-transit';
            case 'DELIVERED':
                return 'badge-delivered';
            default:
                return 'badge-pending';
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading order history...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            {/* Header */}
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="container py-4 flex items-center gap-4">
                    <Link href="/delivery/dashboard" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Order History</h1>
                    <div className="ml-auto text-sm text-muted-foreground">
                        {orders.length} total orders
                    </div>
                </div>
            </header>

            <main className="container py-8 max-w-4xl mx-auto">
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
                        <h2 className="text-2xl font-semibold mb-2">No Order History</h2>
                        <p className="text-muted-foreground mb-6">
                            You haven't accepted any orders yet.
                        </p>
                        <Link href="/delivery/dashboard" className="btn btn-primary">
                            Browse Available Orders
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {orders.map((order) => (
                            <div key={order.id} className="card hover:border-primary/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Status Icon */}
                                    <div className="p-3 bg-muted rounded-full">
                                        {getStatusIcon(order.status)}
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                                <h3 className="font-semibold text-lg">
                                                    {order.total_items} Items
                                                </h3>
                                            </div>
                                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                                            <div>
                                                <span className="text-muted-foreground">Total Amount:</span>
                                                <span className="ml-2 font-semibold text-primary">
                                                    ${order.total_price.toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Delivery Address:</span>
                                                <span className="ml-2 font-medium truncate">
                                                    {order.delivery_address}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Accepted: {new Date(order.assigned_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="w-3 h-3" />
                                                <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
