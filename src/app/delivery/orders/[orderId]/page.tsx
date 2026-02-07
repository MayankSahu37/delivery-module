
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderItem } from '@/types';
import Link from 'next/link';
import { ArrowLeft, MapPin, Package, CheckCircle, XCircle } from 'lucide-react';

interface OrderDetail extends Order {
    total_items: number;
    order_items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}`);
            if (res.status === 401) {
                router.push('/delivery/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to load order');

            const data = await res.json();
            setOrder(data.order);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'accept' | 'ignore') => {
        if (!confirm(`Are you sure you want to ${action} this order?`)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}/${action}`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${action} order`);
            }

            if (action === 'accept') {
                alert('Order Accepted! You can now proceed securely.');
                // In a real app, maybe redirect to "My Deliveries" page.
                // For now, redirect to dashboard or stay here showing 'Accepted'. 
                // Based on req "Disable buttons after action", staying might be better, OR redirect to dashboard.
                // "Order disappears only for that delivery boy" -> imply dashboard won't show it.
                router.push('/delivery/dashboard');
            } else {
                router.push('/delivery/dashboard');
            }

        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="container min-h-screen py-8 flex items-center justify-center">Loading details...</div>;
    }

    if (error || !order) {
        return (
            <div className="container py-8 text-center text-red-500">
                <p>{error || 'Order not found'}</p>
                <Link href="/delivery/dashboard" className="mt-4 btn btn-outline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="container py-4 flex items-center gap-4">
                    <Link href="/delivery/dashboard" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Order Details</h1>
                </div>
            </header>

            <main className="container py-6 max-w-2xl mx-auto space-y-6 animate-fade-in">

                {/* Status Card */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">Order ID: {orderId.slice(0, 8)}...</span>
                        <span className="badge badge-pending">{order.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Income</p>
                            <h2 className="text-2xl font-bold">${order.total_price.toFixed(2)}</h2>
                        </div>
                    </div>
                </div>

                {/* Locations */}
                <div className="card space-y-6">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <div className="w-0.5 h-full bg-border min-h-10" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Pickup Location</h3>
                            <p className="font-medium">AuraSutra Medical Ltd</p>
                            <p className="text-sm text-muted-foreground">Central Warehouse, NY</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <MapPin className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Delivery Address</h3>
                            <p className="font-medium">{order.delivery_address}</p>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="card">
                    <h3 className="font-semibold mb-4 border-b border-border pb-2">Order Items ({order.total_items})</h3>
                    <ul className="space-y-4">
                        {order.order_items?.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Medicine ID: {item.medicine_id.slice(0, 8)}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <div className="font-medium">
                                    ${item.price.toFixed(2)}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold">
                        <span>Total</span>
                        <span>${order.total_price.toFixed(2)}</span>
                    </div>
                </div>

            </main>

            {/* Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
                <div className="container max-w-2xl mx-auto grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAction('ignore')}
                        disabled={actionLoading}
                        className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 flex gap-2 items-center justify-center font-semibold"
                    >
                        <XCircle className="w-5 h-5" />
                        Ignore
                    </button>
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={actionLoading}
                        className="btn btn-primary flex gap-2 items-center justify-center font-semibold shadow-lg shadow-primary/20"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Accept Order
                    </button>
                </div>
            </div>
        </div>
    );
}
