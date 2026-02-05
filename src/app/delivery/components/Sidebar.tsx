'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Package, 
    CheckCircle, 
    Truck, 
    XCircle, 
    User, 
    LogOut 
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to logout?')) return;

        try {
            await fetch('/api/delivery/logout', { method: 'POST' });
            router.push('/delivery/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const navItems = [
        { href: '/delivery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/delivery/orders', label: 'Orders', icon: Package },
        { href: '/delivery/accepted', label: 'Accepted', icon: CheckCircle },
        { href: '/delivery/delivered', label: 'Delivered', icon: Truck },
        { href: '/delivery/ignored', label: 'Ignored', icon: XCircle },
        { href: '/delivery/profile', label: 'Profile', icon: User },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="text-xl font-bold text-primary">Delivery Portal</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="sidebar-link logout-btn">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
