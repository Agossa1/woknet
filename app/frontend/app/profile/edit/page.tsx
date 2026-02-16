'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { selectProfileUser, selectProfileLoading } from '@/src/features/profiles/services/profile-selectors';
import { updateProfileThunk, getProfileThunk } from '@/src/features/profiles/services/profile-thunks';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { selectExperiences, selectExperiencesLoading } from '@/src/features/experiences/services/experience-selectors';
import {
    getExperiencesByProfileIdThunk,
    createExperienceThunk,
    updateExperienceThunk,
    deleteExperienceThunk
} from '@/src/features/experiences/services/experience-thunks';
import { Experience, ExperienceTypeJob, ExperienceTypePlace } from '@/src/features/experiences/services/experience-types';
import { selectEducations, selectEducationsLoading } from '@/src/features/educations/services/education-selectors';
import {
    getEducationsByProfileIdThunk,
    createEducationThunk,
    updateEducationThunk,
    deleteEducationThunk
} from '@/src/features/educations/services/education-thunks';
import { Education, DegreeLevel } from '@/src/features/educations/services/education-types';
import { selectProfileSkills, selectSkillsLoading } from '@/src/features/skills/services/skills-selectors';
import { getProfileSkillsThunk, addSkillThunk, removeSkillThunk, searchSkillsThunk } from '@/src/features/skills/services/skills-thunks';
import { SkillLevel } from '@/src/features/skills/services/skills-types';
import { selectProjects, selectProjectsLoading } from '@/src/features/projects/services/projects-selectors';
import { getProjectsThunk } from '@/src/features/projects/services/projects-thunks';
import { ProjectsSection } from './components/projects-section';

// Import modular components
import { BasicInfoSection, SocialLinksSection, ExperiencesSection, EducationsSection, SkillsEditSection } from './components';

// Import modal components
import { ExperienceModal, EducationModal, SkillSearchModal } from './components';

export default function EditProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const profile = useAppSelector(selectProfileUser);
    const experiences = useAppSelector(selectExperiences);
    const educations = useAppSelector(selectEducations);
    const skills = useAppSelector(selectProfileSkills);
    const projects = useAppSelector(selectProjects);
    const isLoading = useAppSelector(selectProfileLoading);
    const isExpLoading = useAppSelector(selectExperiencesLoading);
    const isEduLoading = useAppSelector(selectEducationsLoading);
    const isSkillLoading = useAppSelector(selectSkillsLoading);
    const isProjectsLoading = useAppSelector(selectProjectsLoading);

    const [formData, setFormData] = useState({
        username: '',
        display_name: '',
        bio: '',
        location_name: '',
        website_url: '',
        social_github: '',
        social_twitter: '',
        social_linkedin: '',
        social_instagram: '',
        social_facebook: '',
        social_tiktok: '',
        social_youtube: '',
        social_whatsapp: '',
        social_telegram: '',
        social_snapchat: '',
        social_discord: '',
        social_twitch: '',
        social_reddit: '',
        social_other: '',
    });

    const [visibleSocials, setVisibleSocials] = useState<string[]>([]);

    // Experience Modal State
    const [isExpModalOpen, setIsExpModalOpen] = useState(false);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);

    // Education Modal State
    const [isEduModalOpen, setIsEduModalOpen] = useState(false);
    const [editingEdu, setEditingEdu] = useState<Education | null>(null);

    // Skills Modal State
    const [isSkillSearchOpen, setIsSkillSearchOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!profile) {
            dispatch(getProfileThunk(user.id));
            dispatch(getExperiencesByProfileIdThunk(user.id));
            dispatch(getEducationsByProfileIdThunk(user.id));
            dispatch(getProfileSkillsThunk(user.id));
            dispatch(getProjectsThunk(user.id));
        } else {
            // Fetch projects if profile exists but projects not loaded? 
            // Better to dispatch always or check if projects empty?
            // Assuming getProfileThunk handles main profile data.
            // We should ensure projects are fetched.
            dispatch(getProjectsThunk(user.id));

            setFormData({
                username: profile.username || '',
                display_name: profile.display_name || user.full_name || '',
                bio: profile.bio || '',
                location_name: profile.location_name || '',
                website_url: profile.website_url || '',
                social_github: profile.social_github || '',
                social_twitter: profile.social_twitter || '',
                social_linkedin: profile.social_linkedin || '',
                social_instagram: profile.social_instagram || '',
                social_facebook: profile.social_facebook || '',
                social_tiktok: profile.social_tiktok || '',
                social_youtube: profile.social_youtube || '',
                social_whatsapp: profile.social_whatsapp || '',
                social_telegram: profile.social_telegram || '',
                social_snapchat: profile.social_snapchat || '',
                social_discord: profile.social_discord || '',
                social_twitch: profile.social_twitch || '',
                social_reddit: profile.social_reddit || '',
                social_other: profile.social_other || '',
            });

            // Initialize visible socials
            const socialFields = [
                'social_linkedin',
                'social_github',
                'social_twitter',
                'social_instagram',
                'social_facebook',
                'social_tiktok',
                'social_youtube',
                'social_whatsapp',
                'social_telegram',
                'social_snapchat',
                'social_discord',
                'social_twitch',
                'social_reddit',
                'social_other'
            ];

            const existingSocials = socialFields.filter(
                field => profile[field as keyof typeof profile]
            );

            if (existingSocials.length === 0) {
                setVisibleSocials(['social_linkedin', 'social_twitter', 'social_github']);
            } else {
                setVisibleSocials(existingSocials);
            }
        }
    }, [user, profile, dispatch, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const result = await dispatch(updateProfileThunk({
            user_id: user.id,
            ...formData
        }));

        if (updateProfileThunk.fulfilled.match(result)) {
            router.push('/profile');
        }
    };

    const handleAddSocial = (id: string) => {
        if (!visibleSocials.includes(id)) {
            setVisibleSocials(prev => [...prev, id]);
        }
    };

    const handleRemoveSocial = (id: string) => {
        setVisibleSocials(prev => prev.filter(s => s !== id));
        setFormData(prev => ({ ...prev, [id]: '' }));
    };

    const handleOpenExpModal = (exp?: Experience) => {
        setEditingExp(exp || null);
        setIsExpModalOpen(true);
    };

    const handleExpDelete = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
            await dispatch(deleteExperienceThunk(id));
        }
    };

    const handleOpenEduModal = (edu?: Education) => {
        setEditingEdu(edu || null);
        setIsEduModalOpen(true);
    };

    const handleEduDelete = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
            await dispatch(deleteEducationThunk(id));
        }
    };

    const handleRemoveSkill = async (skillId: string) => {
        if (!user) return;
        if (window.confirm("Êtes-vous sûr de vouloir retirer cette compétence ?")) {
            await dispatch(removeSkillThunk({ profileId: user.id, skillId }));
        }
    };

    if (!user || (!profile && isLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Minimal Header */}
            <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} /> Retour
                    </button>
                    <h1 className="text-sm font-bold">Modifier le profil</h1>
                    <button
                        form="edit-profile-form"
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        {isLoading ? "Sauvegarde..." : "Enregistrer"}
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <BasicInfoSection formData={formData} onChange={handleChange} />

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    {/* Social Links */}
                    <SocialLinksSection
                        formData={formData}
                        visibleSocials={visibleSocials}
                        onAddSocial={handleAddSocial}
                        onRemoveSocial={handleRemoveSocial}
                        onChange={handleChange}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    {/* Projects */}
                    <ProjectsSection
                        projects={projects}
                        isLoading={isProjectsLoading}
                        profileId={user.id}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    {/* Experiences */}
                    <ExperiencesSection
                        experiences={experiences}
                        isLoading={isExpLoading}
                        onAdd={() => handleOpenExpModal()}
                        onEdit={handleOpenExpModal}
                        onDelete={handleExpDelete}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    {/* Educations */}
                    <EducationsSection
                        educations={educations}
                        isLoading={isEduLoading}
                        onAdd={() => handleOpenEduModal()}
                        onEdit={handleOpenEduModal}
                        onDelete={handleEduDelete}
                    />

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800" />

                    {/* Skills */}
                    <SkillsEditSection
                        skills={skills}
                        isLoading={isSkillLoading}
                        onAdd={() => setIsSkillSearchOpen(true)}
                        onRemove={handleRemoveSkill}
                    />
                </form>
            </main>

            {/* Modals */}
            {isExpModalOpen && (
                <ExperienceModal
                    experience={editingExp}
                    onClose={() => setIsExpModalOpen(false)}
                />
            )}

            {isEduModalOpen && (
                <EducationModal
                    education={editingEdu}
                    onClose={() => setIsEduModalOpen(false)}
                />
            )}

            {isSkillSearchOpen && user && (
                <SkillSearchModal
                    profileId={user.id}
                    onClose={() => setIsSkillSearchOpen(false)}
                />
            )}
        </div>
    );
}
