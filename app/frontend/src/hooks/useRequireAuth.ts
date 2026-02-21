import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/store/hooks';
import { selectIsAuthenticated, selectAuthLoading, selectAuthUser } from '@/src/features/auth/services/authSelectors';

/**
 * Protects a route that requires authentication.
 * Redirects to `redirectTo` if the user is not authenticated.
 */
export function useRequireAuth(redirectTo = '/signin') {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectAuthLoading);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, router, redirectTo]);

    return { isAuthenticated, isLoading };
}

/**
 * Protects a route that requires the user to be a registered instructor.
 * Redirects to `redirectTo` if authenticated but NOT an instructor.
 * Redirects to /signin if not even authenticated.
 */
export function useRequireInstructor(redirectTo = '/learnings/instructor/apply') {
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectAuthLoading);
    const user = useAppSelector(selectAuthUser);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace('/signin');
            return;
        }

        // Authenticated but not an instructor → redirect to the apply page
        if (!user?.is_instructor) {
            router.replace(redirectTo);
        }
    }, [isLoading, isAuthenticated, user, router, redirectTo]);

    return {
        isAuthenticated,
        isLoading,
        isInstructor: user?.is_instructor ?? false,
        user,
    };
}
