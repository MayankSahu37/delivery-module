import { redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabase } from '@/lib/supabase';
import AuthSync from '@/components/AuthSync';
import Sidebar from './components/Sidebar';

export default async function DeliveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check authentication
    const { isAuthenticated, getUser } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        redirect('/api/auth/login');
    }

    const user = await getUser();

    // First check the users table for role verification
    const { data: dbUser } = await supabase
        .from('users')
        .select('uid, role, is_active')
        .eq('auth_id', user?.id)
        .maybeSingle();

    // If user exists in users table but role is not delivery_boy → unauthorized
    if (dbUser && dbUser.role !== 'delivery_boy') {
        redirect('/unauthorized');
    }

    // Verify user exists in delivery_agents table
    const { data: deliveryAgent } = await supabase
        .from('delivery_agents')
        .select('id, is_active')
        .eq('auth_id', user?.id)
        .maybeSingle();

    // Check if delivery agent record exists
    if (!deliveryAgent) {
        redirect('/unauthorized');
    }

    // Check if account is active
    if (!deliveryAgent.is_active) {
        redirect('/account-suspended');
    }

    return (
        <>
            <AuthSync />
            <div className="min-h-screen p-8">
                <div className="dashboard-container-wrapper">
                    <Sidebar />
                    <main className="delivery-main-integrated">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
