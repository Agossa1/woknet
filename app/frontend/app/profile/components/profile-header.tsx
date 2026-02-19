'use client';

import { Camera, Plus, Mail, Shield, MoreHorizontal } from "lucide-react";
import { User } from "@/src/features/auth/services/authTypes";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { toggleFollowThunk, checkFollowStatusThunk, getFollowCountsThunk } from "@/src/features/follows/services/follows-thunks";
import { useEffect } from "react";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";

import { startConversationThunk } from "@/src/features/chat/services/chat-thunks";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
    user: User;
    profile: Profile | null;
    onEdit: () => void;
    onOpenPhotoModal: (type: 'avatar' | 'banner') => void;
    onOpenFollowers: () => void;
    onOpenFollowing: () => void;
}

export const ProfileHeader = ({ user, profile, onEdit, onOpenPhotoModal, onOpenFollowers, onOpenFollowing }: ProfileHeaderProps) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const currentUser = useAppSelector(selectAuthUser);
    const isOwnProfile = currentUser?.id === user.id;

    const isFollowing = useAppSelector(state => state.follows.isFollowingMap[user.id] || false);
    const followCounts = useAppSelector(state => state.follows.countsByProfile[user.id] || {
        followers: profile?.followers_count || 0,
        following: profile?.following_count || 0
    });

    useEffect(() => {
        if (!isOwnProfile && currentUser?.id) {
            dispatch(checkFollowStatusThunk(user.id));
        }
        dispatch(getFollowCountsThunk(user.id));
    }, [user.id, currentUser?.id, isOwnProfile, dispatch]);

    const handleFollowToggle = () => {
        if (!currentUser?.id) return;
        dispatch(toggleFollowThunk(user.id));
    };

    const handleStartConversation = async () => {
        if (!currentUser?.id || isOwnProfile) return;
        try {
            const resultAction = await dispatch(startConversationThunk(user.id));
            if (startConversationThunk.fulfilled.match(resultAction)) {
                const conversation = resultAction.payload;
                router.push(`/messages?conversationId=${conversation.id}`);
            }
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    };

    const iconStroke = 1.25;

    return (
        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm relative">
            {/* Banner Section */}
            <div className="h-40 md:h-48 bg-neutral-50 dark:bg-neutral-800 relative group overflow-hidden">
                {profile?.banner_url ? (
                    <img src={profile.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="banner" />
                ) : null}

                {isOwnProfile && (
                    <button
                        onClick={() => onOpenPhotoModal('banner')}
                        className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-neutral-900 px-3 py-1.5 rounded flex items-center gap-2 text-[10px] font-bold tracking-tight"
                    >
                        <Camera size={14} strokeWidth={iconStroke} />
                        Modifier la bannière
                    </button>
                )}
            </div>

            {/* Overlapping Avatar Area */}
            <div className="absolute top-24 md:top-28 left-6 md:left-10 z-[5]">
                <div className="w-28 h-28 md:w-36 md:h-36 bg-white dark:bg-neutral-900 p-1 rounded-xl border-4 border-white dark:border-neutral-900 shadow-lg overflow-hidden relative">
                    <div className="w-full h-full bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden relative">
                        <img
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                        {isOwnProfile && (
                            <button
                                onClick={() => onOpenPhotoModal('avatar')}
                                className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <Camera size={24} strokeWidth={iconStroke} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 md:pt-20 pb-8 px-6 md:px-10">
                <div className="flex flex-col gap-5">
                    {/* Top Row: Name and Actions */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
                                    {user.full_name}
                                </h1>
                                <Shield size={18} strokeWidth={iconStroke} className="text-[#0A66C2]" fill="currentColor" />
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl leading-relaxed">
                                {user.headline || "Expert passionné • Télécommunications • Prêt à relever de nouveaux défis"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isOwnProfile ? (
                                <>
                                    <button
                                        onClick={onEdit}
                                        className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
                                    >
                                        Gérer le profil
                                    </button>
                                    <button className="p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-neutral-500">
                                        <Plus size={18} strokeWidth={2} />
                                    </button>
                                    
                                </>
                            ) : currentUser ? (
                                <>
                                <button onClick={handleStartConversation} className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-neutral-200 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white">
                                <Mail size={18} strokeWidth={2} />
                                <span>Messages</span>
                                </button>

                                    <button
                                        onClick={handleFollowToggle}
                                        className={`px-6 py-2.5 rounded-lg font-semibold text-[13px] transition-colors shadow-sm ${isFollowing
                                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                            : "bg-[#0A66C2] hover:bg-[#004182] text-white"
                                            }`}
                                    >
                                        {isFollowing ? "Ne plus suivre" : "Suivre"}
                                    </button>
                                    <button className="p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-neutral-500">
                                        <MoreHorizontal size={20} />
                                    </button>
                                   
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Bottom Row: Stats & Secondary Info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm border-t border-neutral-200 dark:border-neutral-800 pt-5">
                        <div onClick={onOpenFollowers} className="flex items-center gap-2 cursor-pointer group">
                            <span className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors">{followCounts.followers}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Visiteurs</span>
                        </div>
                        <div onClick={onOpenFollowing} className="flex items-center gap-2 cursor-pointer group">
                            <span className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors">{followCounts.following}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Abonnés</span>
                        </div>
                        <div className="h-4 w-px bg-neutral-200 dark:border-neutral-700 hidden sm:block" />
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 font-medium">
                            <Shield size={14} strokeWidth={iconStroke} className="text-[#0A66C2]" />
                            <span>Identité vérifiée WorkNet</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
