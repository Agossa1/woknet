import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { becomeInstructorThunk } from '@/src/features/learnings/services/learnings-thunks';
import { selectLearningsLoading } from '@/src/features/learnings/services/learnings-selectors';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";

interface BecomeInstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BecomeInstructorModal = ({ isOpen, onClose }: BecomeInstructorModalProps) => {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(selectLearningsLoading);
    const [headline, setHeadline] = useState('');
    const [bio, setBio] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(becomeInstructorThunk({ headline, bio }));

        if (becomeInstructorThunk.fulfilled.match(result)) {
            toast.success(result.payload.message || 'Félicitations ! Vous êtes maintenant formateur.');
            onClose();
        } else {
            toast.error(result.payload as string || 'Une erreur est survenue.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Devenir Formateur</DialogTitle>
                    <DialogDescription>
                        Partagez votre expertise avec la communauté. Remplissez ces informations pour commencer.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="headline" className="text-right">Titre</label>
                            <Input
                                id="headline"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Ex: Développeur Full-Stack"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="bio" className="text-right">Bio</label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Présentez-vous en quelques mots..."
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmer et créer mon espace
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};