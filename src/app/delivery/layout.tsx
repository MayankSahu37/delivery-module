'use client';

import Sidebar from './components/Sidebar';
import { usePathname } from 'next/navigation';

export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/delivery/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="delivery-layout">
            <Sidebar />
            <main className="delivery-main">
                {children}
            </main>
        </div>
    );
}
