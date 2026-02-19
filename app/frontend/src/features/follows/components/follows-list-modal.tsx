'use client';

import { X, UserPlus, UserMinus, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { getFollowersThunk, getFollowingThunk, toggleFollowThunk } from "../services/follows-thunks";
import { FollowerInfo } from "../services/follows-types";
import Link from "next/link";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";

interface FollowsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileId: string;
    type: 'followers' | 'following';
    title: string;
}

export const FollowsListModal = ({ isOpen, onClose, profileId, type, title }: FollowsListModalProps) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectAuthUser);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const users = useAppSelector(state =>
        type === 'followers'
            ? state.follows.followersByProfile[profileId] || []
            : state.follows.followingByProfile[profileId] || []
    );

    const isFollowingMap = useAppSelector(state => state.follows.isFollowingMap);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            const thunk = type === 'followers' ? getFollowersThunk : getFollowingThunk;
            dispatch(thunk(profileId)).finally(() => setIsLoading(false));
        }
    }, [isOpen, profileId, type, dispatch]);

    if (!isOpen) return null;

    const filteredUsers = users.filter(user =>
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFollowToggle = (userId: string) => {
        dispatch(toggleFollowThunk(userId));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-black tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-50 dark:border-gray-800/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 size={32} className="text-blue-600 animate-spin" />
                            <p className="text-sm font-bold text-gray-400">Chargement...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="space-y-1">
                            {filteredUsers.map((user) => (
                                <div key={user.user_id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group">
                                    <Link
                                        href={`/profile/${user.user_id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-3 flex-1 min-w-0"
                                    >
                                        <img
                                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.display_name}`}
                                            alt={user.display_name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-sm"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-black text-sm truncate group-hover:text-blue-600 transition-colors">
                                                {user.display_name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                @{user.username}
                                            </p>
                                            {user.headline && (
                                                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                                    {user.headline}
                                                </p>
                                            )}
                                        </div>
                                    </Link>

                                    {currentUser?.id !== user.user_id && (
                                        <button
                                            onClick={() => handleFollowToggle(user.user_id)}
                                            className={`ml-4 px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 ${isFollowingMap[user.user_id]
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                                                : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                                                }`}
                                        >
                                            {isFollowingMap[user.user_id] ? "Suivi(e)" : "Suivre"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <p className="font-black text-gray-300 dark:text-gray-700 text-lg mb-1">Aucun résultat</p>
                            <p className="text-xs text-gray-400">Nous n'avons trouvé personne correspondant à votre recherche.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
