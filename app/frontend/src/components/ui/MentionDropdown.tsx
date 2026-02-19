"use client";

import React, { useEffect, useState } from 'react';
import { ProfileData } from '@/src/features/profiles/services/profile-types';
import { mentionsApi } from '@/src/features/profiles/services/mentions-api';

interface MentionDropdownProps {
    query: string;
    onSelect: (user: ProfileData) => void;
    anchorRect: DOMRect | null;
}

export function MentionDropdown({ query, onSelect, anchorRect }: MentionDropdownProps) {
    const [users, setUsers] = useState<ProfileData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            if (query.length < 1) {
                setUsers([]);
                return;
            }
            setIsLoading(true);
            try {
                const results = await mentionsApi.searchUsers(query);
                setUsers(results);
                setSelectedIndex(0);
            } catch (error) {
                console.error("Failed to fetch users for mentions", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 200);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (users.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % users.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (users[selectedIndex]) {
                    e.preventDefault();
                    onSelect(users[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [users, selectedIndex, onSelect]);

    if (users.length === 0 && !isLoading) return null;

    const style: React.CSSProperties = anchorRect ? {
        position: 'fixed',
        top: Math.min(anchorRect.top + anchorRect.height + 5, window.innerHeight - 300),
        left: anchorRect.left,
        zIndex: 1000,
    } : { display: 'none' };

    return (
        <div
            style={style}
            className="w-64 bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            {isLoading ? (
                <div className="p-4 text-center">
                    <div className="flex justify-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            ) : (
                <div className="max-h-60 overflow-y-auto">
                    {users.map((user, index) => (
                        <button
                            key={user.user_id}
                            onClick={() => onSelect(user)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0A66C2]'
                                    : 'hover:bg-neutral-50 dark:hover:bg-gray-700/50 text-neutral-700 dark:text-gray-200'
                                }`}
                        >
                            <img
                                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                alt={user.username}
                                className="w-8 h-8 rounded-full bg-neutral-100 object-cover"
                            />
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{user.display_name || user.username}</p>
                                <p className="text-[10px] text-neutral-400 truncate">@{user.username}</p>
                            </div>
                        </button>
                    ))}
                    {users.length === 0 && query.length > 0 && (
                        <div className="p-4 text-center text-xs text-neutral-400 italic">
                            Aucun utilisateur trouvé
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
