'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/settings/account');
    }, [router]);

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-white rounded-full animate-spin" />
        </div>
    );
}
