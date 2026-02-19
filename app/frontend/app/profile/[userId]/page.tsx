'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import {
    Mail,
    Shield,
    MoreHorizontal
} from "lucide-react";
import { selectViewedProfile, selectIsViewedProfileLoading } from "@/src/features/profiles/services/profile-selectors";
import { getPublicProfileThunk } from "@/src/features/profiles/services/profile-thunks";
import { Spinner } from "@/src/components/ui/spinner";
import { startConversationThunk } from "@/src/features/chat/services/chat-thunks";
import { getExperiencesByProfileIdThunk } from "@/src/features/experiences/services/experience-thunks";
import { getEducationsByProfileIdThunk } from "@/src/features/educations/services/education-thunks";
import { getProjectsThunk } from "@/src/features/projects/services/projects-thunks";
import { getProfileSkillsThunk } from "@/src/features/skills/services/skills-thunks";
import { getFollowCountsThunk, checkFollowStatusThunk } from "@/src/features/follows/services/follows-thunks";

// Components partagés
import {
    ProfileHeader,
    ProfileAbout,
    ProfileExperience,
    ProfileEducation,
    ProfileProjects,
    ProfileStats,
    ProfileInfoCard
} from "../components";
import { SkillsSection } from "@/src/features/skills/components/skills-section";

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectAuthUser);
    const profile = useAppSelector(selectViewedProfile);
    const isLoading = useAppSelector(selectIsViewedProfileLoading);

    // Get data from Redux stores
    const { experiences } = useAppSelector((state) => state.experiences);
    const { educations } = useAppSelector((state) => state.educations);
    const { projects } = useAppSelector((state) => state.projects);

    const userId = params.userId as string;

    const handleMessageClick = async () => {
        if (!userId) return;
        await dispatch(startConversationThunk(userId));
        router.push('/messages');
    };

    useEffect(() => {
        if (userId) {
            dispatch(getPublicProfileThunk(userId));
            dispatch(getExperiencesByProfileIdThunk(userId));
            dispatch(getEducationsByProfileIdThunk(userId));
            dispatch(getProjectsThunk(userId));
            dispatch(getProfileSkillsThunk(userId));
            dispatch(getFollowCountsThunk(userId));
            if (authUser) {
                dispatch(checkFollowStatusThunk(userId));
            }
        }
    }, [userId, dispatch, authUser]);

    useEffect(() => {
        if (authUser && authUser.id === userId) {
            router.replace('/profile');
        }
    }, [authUser, userId, router]);

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F2EE] dark:bg-black">
                <Spinner size="lg" label="Chargement du profil public" />
            </div>
        );
    }

    // Mocking a User object from ProfileData for the Header
    const userForHeader = {
        id: profile.user_id,
        full_name: profile.full_name || profile.display_name,
        headline: profile.headline,
        is_active: profile.is_active,
        email: "",
        has_onboarded: true,
        created_at: profile.created_at
    } as any;

    return (
        <div className="min-h-screen bg-neutral-50/50 dark:bg-black font-sans text-neutral-800 antialiased pb-10">
            <div className="max-w-[1120px] mx-auto px-4 py-8 space-y-6">

                <ProfileHeader
                    user={userForHeader}
                    profile={profile}
                    onEdit={() => { }}
                    onOpenPhotoModal={() => { }}
                    onOpenFollowers={() => { }}
                    onOpenFollowing={() => { }}
                />

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Left Column: Main Content */}
                    <div className="w-full lg:max-w-[760px] space-y-6">

                        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <ProfileAbout profile={profile} />
                        </section>

                        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <ProfileExperience experiences={experiences} />
                        </section>

                        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <ProfileEducation educations={educations} />
                        </section>

                        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <ProfileProjects projects={projects} />
                        </section>
                    </div>

                    {/* Right Column: Widgets */}
                    <aside className="w-full lg:w-[300px] space-y-6 lg:sticky lg:top-20">
                        <ProfileInfoCard user={userForHeader} profile={profile} />

                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4">Analyses</h2>
                            <ProfileStats />
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4 italic">Compétences</h2>
                            <SkillsSection profileId={profile.user_id} isCurrentUser={authUser?.id === profile.user_id} />
                        </div>

                        <div className="bg-[#1C1C1C] dark:bg-neutral-900 rounded-lg p-6 text-white shadow-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-4 text-[#FFB020]">
                                <Mail size={16} strokeWidth={2} />
                                <span className="text-[10px] font-bold">Contact</span>
                            </div>
                            <h3 className="font-semibold text-sm mb-2">Prendre contact ?</h3>
                            <p className="text-neutral-400 text-[11px] mb-6 leading-relaxed">Envoyez une demande de connexion ou démarrez un chat direct.</p>
                            <button onClick={handleMessageClick} className="w-full py-2 bg-white text-black rounded text-xs font-bold hover:bg-neutral-100 transition">
                                Envoyer un message
                            </button>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
}
