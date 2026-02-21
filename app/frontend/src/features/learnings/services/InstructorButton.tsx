import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/features/auth/services/auth-selectors';
import { Button } from '@/src/components/ui/button';
import { BecomeInstructorModal } from './BecomeInstructorModal';

export const InstructorButton = () => {
    // On récupère l'utilisateur connecté depuis le state global
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // On vérifie si l'utilisateur est un formateur
    const isInstructor = user?.is_instructor;

    // Si c'est un formateur, on affiche le lien vers son espace
    if (isInstructor) {
        return (
            <Button onClick={() => navigate('/learnings/instructor/dashboard')}>
                Mon espace formateur
            </Button>
        );
    }

    // Sinon, on affiche le bouton pour le devenir, qui ouvre le modal
    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                Devenir formateur
            </Button>
            <BecomeInstructorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};