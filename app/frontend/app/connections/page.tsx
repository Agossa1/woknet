'use client';

import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, UserPlus, MessageSquare, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { getFollowingThunk, toggleFollowThunk } from '@/src/features/follows/services/follows-thunks';
import { fetchProfileSuggestionsThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import Link from 'next/link';

const iconStroke = 1.25;

export default function ConnectionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { followingByProfile, isFollowingMap } = useAppSelector((state) => state.follows);
  const { profileSuggestions } = useAppSelector((state) => state.recommendations);

  const [searchTerm, setSearchTerm] = useState('');

  const connections = user?.id ? (followingByProfile[user.id] || []) : [];

  useEffect(() => {
    if (user?.id) {
      dispatch(getFollowingThunk(user.id));
      dispatch(fetchProfileSuggestionsThunk(3));
    }
  }, [dispatch, user?.id]);

  const filteredConnections = connections.filter(c =>
    c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.headline && c.headline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black p-6 md:p-10 font-sans antialiased text-neutral-800">
      <div className="max-w-5xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="pb-6 border-b border-neutral-300/60 dark:border-neutral-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-2"
          >
            <ArrowLeft size={14} strokeWidth={iconStroke} />
            <span>Retour à l'espace pro</span>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
            Mon réseau
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1 max-w-md">
            Gérez vos relations et découvrez de nouvelles opportunités.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={iconStroke} />
            <input
              type="text"
              placeholder="Rechercher une personne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Vos relations */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden min-h-[320px] flex flex-col">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter flex items-center gap-2">
                  Vos relations
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {filteredConnections.length}
                  </span>
                </h2>
              </div>

              {filteredConnections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-100 dark:border-neutral-700">
                    <UserPlus className="text-neutral-300" size={26} strokeWidth={iconStroke} />
                  </div>
                  <p className="text-neutral-900 dark:text-white font-semibold text-sm">
                    {searchTerm ? "Aucune relation trouvée" : "Vous ne suivez personne pour le moment"}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mt-1">
                    {searchTerm ? "Essayez une autre recherche." : "Découvrez des profils dans les suggestions."}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 p-5">
                  {filteredConnections.map(connection => (
                    <div key={connection.user_id} className="bg-neutral-50/50 dark:bg-neutral-800/30 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:border-[#0A66C2]/30 transition-colors group flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <Link href={`/profile/${connection.user_id}`}>
                          <img
                            src={connection.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.username}`}
                            alt={connection.display_name}
                            className="w-11 h-11 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover"
                          />
                        </Link>
                        <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded transition-colors">
                          <MoreHorizontal size={16} strokeWidth={iconStroke} />
                        </button>
                      </div>
                      <Link href={`/profile/${connection.user_id}`} className="block flex-1 mb-3">
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-[14px] group-hover:text-[#0A66C2] transition-colors font-inter">
                          {connection.display_name}
                        </h3>
                        <p className="text-[12px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5 line-clamp-1">
                          {connection.headline || connection.username}
                        </p>
                      </Link>
                      <div className="flex gap-2">
                        <Link href={`/profile/${connection.user_id}`} className="flex-1 py-1.5 text-center border border-neutral-200 dark:border-neutral-700 rounded-lg text-[12px] font-semibold text-neutral-600 dark:text-neutral-400 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors">
                          Profil
                        </Link>
                        <Link href="/messages" className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-500 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-colors flex items-center justify-center">
                          <MessageSquare size={14} strokeWidth={iconStroke} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter mb-4">
                Suggestions
              </h2>
              <div className="space-y-4">
                {profileSuggestions.length === 0 ? (
                  <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium text-center py-6">
                    Aucune suggestion pour le moment.
                  </p>
                ) : (
                  profileSuggestions.map(suggestion => {
                    const isFollowing = isFollowingMap[suggestion.id];
                    return (
                      <div key={suggestion.id} className="flex items-center gap-3">
                        <Link href={`/profile/${suggestion.id}`}>
                          <img
                            src={suggestion.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.full_name}`}
                            alt={suggestion.full_name}
                            className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/profile/${suggestion.id}`}>
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-[13px] truncate hover:text-[#0A66C2] transition-colors font-inter">{suggestion.full_name}</h4>
                          </Link>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-medium">{suggestion.headline}</p>
                        </div>
                        <button
                          onClick={() => dispatch(toggleFollowThunk(suggestion.id))}
                          className={`p-2 rounded-lg border transition-colors ${
                            isFollowing
                              ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
                              : "border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                          }`}
                        >
                          <UserPlus size={16} strokeWidth={iconStroke} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter mb-2">
                Invitez vos amis
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-5">
                Développez votre réseau en invitant vos connaissances à rejoindre WorkNet.
              </p>
              <button className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
                Envoyer une invitation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
