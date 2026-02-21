import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/features/auth/services/auth-selectors';

export const ProtectedInstructorRoute = () => {
    const user = useAppSelector(selectUser);

    // Si l'utilisateur n'est pas connecté ou n'a pas le flag is_instructor
    if (!user || !user.is_instructor) {
        // Redirection immédiate vers l'accueil des formations
        return <Navigate to="/learnings" replace />;
    }

    // Si tout est bon, on affiche la page demandée (Outlet)
    return <Outlet />;
};