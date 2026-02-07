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

    // Verify user exists in database
    const { data: dbUser } = await supabase
        .from('delivery_agents')
        .select('id, is_active')
        .eq('auth_id', user?.id)
        .maybeSingle();

    // Check if user exists
    if (!dbUser) {
        redirect('/unauthorized');
    }

    // Check if account is active
    if (!dbUser.is_active) {
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
