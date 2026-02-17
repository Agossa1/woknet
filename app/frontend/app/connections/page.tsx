'use client';

import React, { useEffect, useState } from 'react';
import { Search, MoreHorizontal, UserPlus, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { getFollowingThunk } from '@/src/features/follows/services/follows-thunks';
import { fetchProfileSuggestionsThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import Link from 'next/link';

export default function ConnectionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { followingByProfile } = useAppSelector((state) => state.follows);
  const { profileSuggestions } = useAppSelector((state) => state.recommendations);

  const [searchTerm, setSearchTerm] = useState('');

  // Get connections for current user
  const connections = user?.id ? (followingByProfile[user.id] || []) : [];

  useEffect(() => {
    if (user?.id) {
      console.log('Fetching following for user:', user.id);
      dispatch(getFollowingThunk(user.id));
      dispatch(fetchProfileSuggestionsThunk(3));
    }
  }, [dispatch, user?.id]);

  // Debug: log what we have
  useEffect(() => {
    console.log('ConnectionsPage Debug:', {
      userId: user?.id,
      followingByProfile,
      connections: connections.length,
      connectionsData: connections
    });
  }, [user, followingByProfile, connections]);

  const filteredConnections = connections.filter(c =>
    c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.headline && c.headline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900 dark:text-white">
              Mon Réseau<span className="text-blue-600">.</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">Gérez vos relations et découvrez de nouvelles opportunités.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une personne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent w-full md:w-80 transition-shadow shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Main Connections Grid */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-3">
                  Vos relations
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-400">
                    {filteredConnections.length}
                  </span>
                </h2>
                <button className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Récents</button>
              </div>

              {filteredConnections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-gray-400 font-medium italic mb-8">
                    {searchTerm ? "Aucune relation trouvée." : "Vous ne suivez personne pour le moment."}
                  </p>
                  <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Voir tout</button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
                    {filteredConnections.map(connection => (
                      <div key={connection.user_id} className="bg-white dark:bg-gray-900 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition duration-200 group flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <Link href={`/profile/${connection.user_id}`}>
                            <img
                              src={connection.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${connection.username}`}
                              alt={connection.display_name}
                              className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover bg-gray-50"
                            />
                          </Link>
                          <button className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 transition">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>

                        <Link href={`/profile/${connection.user_id}`} className="block flex-1 mb-4">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-blue-600 transition-colors">
                            {connection.display_name}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-1">
                            {connection.headline || connection.username}
                          </p>
                        </Link>

                        <div className="flex gap-2">
                          <Link href={`/profile/${connection.user_id}`} className="flex-1 py-1.5 text-center border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            Profil
                          </Link>
                          <Link href={`/messages`} className="p-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center">
                            <MessageSquare size={16} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 text-center border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Voir tout</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Suggestions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-widest">Suggestions</h2>
                <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 uppercase tracking-wider">Voir tout</button>
              </div>

              <div className="space-y-5">
                {profileSuggestions.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">Aucune suggestion pour le moment.</p>
                ) : (
                  profileSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="flex items-center gap-3">
                      <Link href={`/profile/${suggestion.user_id}`}>
                        <img
                          src={suggestion.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.full_name}`}
                          alt={suggestion.full_name}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 dark:border-gray-700 object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${suggestion.user_id}`}>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate hover:text-blue-600 transition-colors">{suggestion.full_name}</h4>
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{suggestion.headline}</p>
                      </div>
                      <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors text-gray-400">
                        <UserPlus size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-black dark:bg-white rounded-2xl p-8 text-white dark:text-black text-center shadow-lg">
              <h3 className="font-extrabold text-xl italic uppercase mb-2">Invitez<br />vos amis</h3>
              <p className="text-sm opacity-70 mb-6 font-medium leading-relaxed">Développez votre réseau en invitant vos connaissances à rejoindre WorkNet.</p>

              <button className="w-full py-3 bg-white dark:bg-black text-black dark:text-white font-bold uppercase tracking-wider rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                Envoyer une invitation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
