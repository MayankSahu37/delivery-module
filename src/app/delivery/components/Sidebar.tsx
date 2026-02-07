'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    CheckCircle,
    Truck,
    XCircle,
    User,
    LogOut
} from 'lucide-react';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';

export default function Sidebar() {
    const pathname = usePathname();

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
                <LogoutLink className="sidebar-link logout-btn">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </LogoutLink>
            </div>
        </aside>
    );
}
