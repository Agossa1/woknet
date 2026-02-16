'use client';

import { Camera, Plus, UserPlus, Mail, UserMinus, MessageSquare } from "lucide-react";
import { User } from "@/src/features/auth/services/authTypes";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";
import { ProfileContactBar } from "./profile-contact-bar";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { toggleFollowThunk, checkFollowStatusThunk, getFollowCountsThunk } from "@/src/features/follows/services/follows-thunks";
import { useEffect } from "react";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";

interface ProfileHeaderProps {
    user: User; // This is the user whose profile we are viewing
    profile: Profile | null;
    onEdit: () => void;
    onOpenPhotoModal: (type: 'avatar' | 'banner') => void;
    onOpenFollowers: () => void;
    onOpenFollowing: () => void;
}

export const ProfileHeader = ({ user, profile, onEdit, onOpenPhotoModal, onOpenFollowers, onOpenFollowing }: ProfileHeaderProps) => {
    const dispatch = useAppDispatch();
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

    return (
        <>
            {/* Banner / Cover Photo Section */}
            <div className="relative h-44 md:h-64 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden group rounded-b-lg md:rounded-b-none shadow-inner">
                {profile?.banner_url ? (
                    <img
                        src={profile.banner_url}
                        alt="Cover"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                        <Camera size={40} strokeWidth={1} className="opacity-20" />
                    </div>
                )}

                {/* Edit Banner Button - Only for own profile */}
                {isOwnProfile && (
                    <button
                        onClick={() => onOpenPhotoModal('banner')}
                        className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                        <Camera size={18} />
                    </button>
                )}

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Header Info Section */}
            <header className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start -mt-16 md:-mt-24 mb-1 max-w-6xl mx-auto px-4 md:px-6 lg:px-12 pb-6">
                <div className="relative shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-white dark:bg-gray-900 border-[6px] border-white dark:border-gray-900 shadow-xl relative group">
                        <img
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />

                        {isOwnProfile && (
                            <button
                                onClick={() => onOpenPhotoModal('avatar')}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera size={28} />
                            </button>
                        )}
                    </div>
                    {user.is_active && (
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full z-20 shadow-lg animate-pulse" />
                    )}
                </div>

                <div className="flex-1 pt-2 md:pt-24 space-y-4 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none truncate">
                                    {profile?.display_name || user.full_name}
                                </h1>
                                {isOwnProfile && (
                                    <button
                                        onClick={onEdit}
                                        className="inline-flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-1.5 rounded-full font-bold text-[11px] hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        <Plus size={14} /> Modifier
                                    </button>
                                )}
                            </div>
                            <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 font-medium tracking-tight line-clamp-2 md:line-clamp-none max-w-2xl">
                                {user.headline || "Prêt à relever de nouveaux défis"}
                            </p>
                        </div>

                        {/* Actions for other profiles */}
                        {!isOwnProfile && currentUser && (
                            <div className="flex items-center justify-center gap-2 pt-2 md:pt-0">
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${isFollowing
                                        ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 group"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus size={18} className="group-hover:hidden" />
                                            <span className="group-hover:hidden whitespace-nowrap">Suivi(e)</span>
                                            <span className="hidden group-hover:block whitespace-nowrap">Se désabonner</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            <span className="whitespace-nowrap">Suivre</span>
                                        </>
                                    )}
                                </button>
                                <button className="flex items-center justify-center p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm active:scale-95">
                                    <MessageSquare size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                        <div onClick={onOpenFollowers} className="flex items-center gap-2 cursor-pointer group">
                            <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tabular-nums">
                                {followCounts.followers}
                            </span>
                            <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors uppercase tracking-wider">Abonnés</span>
                        </div>
                        <div onClick={onOpenFollowing} className="flex items-center gap-2 cursor-pointer group">
                            <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tabular-nums">
                                {followCounts.following}
                            </span>
                            <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors uppercase tracking-wider">Abonnements</span>
                        </div>

                        <div className={`ml-auto md:ml-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border ${user.is_active
                            ? "border-green-100 bg-green-50/30 text-green-700 dark:border-green-900/20 dark:bg-green-900/10 dark:text-green-400"
                            : "border-red-100 bg-red-50/30 text-red-700 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400"
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{user.is_active ? "Actif" : "Inactif"}</span>
                        </div>
                    </div>

                    {/* Contact Bar */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50">
                        <ProfileContactBar user={user} profile={profile} />
                    </div>
                </div>
            </header>
        </>
    );
};
