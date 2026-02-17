'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { AppSidebar, Navbar } from './index';
import { useEffect } from 'react';
import { useNotificationsRealtime } from '@/src/features/notifications/hooks/useNotificationsRealtime';
import { useChatRealtime } from '@/src/features/chat/hooks/useChatRealtime';


export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    // Initialize realtime notifications
    useNotificationsRealtime();
    useChatRealtime();

    // List of public paths - No sidebar/navbar shown here
    // We also hide them on the root path if the user is not authenticated (Landing Page)
    const isRoot = pathname === '/';
    const isAuthPath = pathname.startsWith('/auth');
    const isOnboardingPath = pathname?.startsWith('/onboarding');

    // Redirect to onboarding if user is authenticated but hasn't completed onboarding
    useEffect(() => {
        if (isAuthenticated && user && !user.has_onboarded && !isOnboardingPath && !isAuthPath) {
            router.push('/onboarding');
        }
    }, [isAuthenticated, user, isOnboardingPath, isAuthPath, router]);

    // Hide shell on auth paths, onboarding, landing page, OR companies pages (standalone mode)
    const isCompaniesPath = pathname?.startsWith('/companies');
    const showShell = isAuthenticated && !isAuthPath && !isOnboardingPath && !isCompaniesPath && (!isRoot || isAuthenticated);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!showShell) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar (Fixed Left) */}
            <AppSidebar />

            {/* Main Content Area (Right) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Navbar />
                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>

            {/* Global Chat Drawer - Hidden on the messages page to avoid redundancy */}

        </div>
    );
}
