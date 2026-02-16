'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { initializeAuthThunk } from '../features/auth/services/authThunks';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeAuthThunk());
    }, [dispatch]);

    return <>{children}</>;
}
