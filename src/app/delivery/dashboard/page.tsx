'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderCard from '../components/OrderCard';
import CircularProgress from '../components/CircularProgress';
import { Order, DeliveryAgent } from '@/types';
import { CheckCircle, Truck, XCircle } from 'lucide-react';

export default function DashboardPage() {
    const [orders, setOrders] = useState<(Order & { total_items: number })[]>([]);
    const [incompleteOrders, setIncompleteOrders] = useState<(Order & { total_items: number })[]>([]);
    const [agent, setAgent] = useState<DeliveryAgent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch orders, profile, and accepted orders in parallel
            const [ordersRes, profileRes, acceptedRes] = await Promise.all([
                fetch('/api/delivery/orders'),
                fetch('/api/delivery/profile'),
                fetch('/api/delivery/accepted')
            ]);

            if (ordersRes.status === 401 || profileRes.status === 401) {
                router.push('/delivery/login');
                return;
            }

            if (!ordersRes.ok) throw new Error('Failed to fetch orders');
            if (!profileRes.ok) throw new Error('Failed to fetch profile');

            const ordersData = await ordersRes.json();
            const profileData = await profileRes.json();

            setOrders(ordersData.orders);
            setAgent(profileData.agent);

            // Fetch incomplete orders (accepted but not delivered)
            if (acceptedRes.ok) {
                const acceptedData = await acceptedRes.json();
                setIncompleteOrders(acceptedData.orders.slice(0, 3)); // Show only 2-3
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <>
            {/* Welcome Header */}
            {agent && (
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold mb-2">Welcome, {agent.name}</h1>
                    <p className="text-muted-foreground">Here's your delivery overview</p>
                </div>
            )}

            {/* Circular Statistics Graphs */}
            {agent?.stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in">
                    <div className="card flex items-center justify-center py-8">
                        <CircularProgress
                            value={agent.stats.totalAccepted}
                            max={agent.stats.totalAccepted + 10}
                            label="Orders Accepted"
                            color="#3b82f6"
                            size={140}
                            icon={CheckCircle}
                        />
                    </div>
                    <div className="card flex items-center justify-center py-8">
                        <CircularProgress
                            value={agent.stats.totalDelivered}
                            max={agent.stats.totalAccepted}
                            label="Orders Delivered"
                            color="#22c55e"
                            size={140}
                            icon={Truck}
                        />
                    </div>
                    <div className="card flex items-center justify-center py-8">
                        <CircularProgress
                            value={agent.stats.ignoredCount || 0}
                            max={agent.stats.totalAccepted + (agent.stats.ignoredCount || 0)}
                            label="Orders Ignored"
                            color="#f59e0b"
                            size={140}
                            icon={XCircle}
                        />
                    </div>
                </div>
            )}

            {/* Incomplete Orders Section */}
            {incompleteOrders.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Incomplete Orders</h2>
                        <Link href="/delivery/accepted" className="text-primary hover:underline text-sm font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {incompleteOrders.map((order) => (
                            <OrderCard key={order.id} order={order} showCompleteButton />
                        ))}
                    </div>
                </div>
            )}

            {/* Available Orders Section - Show only 2-3 */}
            {orders.length > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Available Orders</h2>
                        <Link href="/delivery/orders" className="text-primary hover:underline text-sm font-medium">
                            View All ({orders.length})
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {orders.slice(0, 3).map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
