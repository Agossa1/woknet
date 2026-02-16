'use client';

import Link from 'next/link';
import { Bookmark, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectProfileUser } from '@/src/features/profiles/services/profile-selectors';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { useEffect } from 'react';
import { getProfileThunk } from '@/src/features/profiles/services/profile-thunks';

export function ProfileSidebar() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const profileUser = useAppSelector(selectProfileUser);

  useEffect(() => {
    if (authUser?.id) {
      dispatch(getProfileThunk(authUser.id));
    }
  }, [authUser?.id, dispatch]);

  return (
    <div className="hidden lg:flex flex-col gap-2 w-full">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Background Banner */}
        <div className="h-14 bg-gray-200 dark:bg-gray-700 relative">
          {profileUser?.banner_url && (
            <img
              src={profileUser.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-8 mb-3">
            <img
              src={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-900 object-cover bg-white dark:bg-gray-800 shadow-sm"
            />
            <Link href="/profile" className="mt-3 hover:underline underline-offset-2">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm">{authUser?.full_name}</h3>
            </Link>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center mt-1 leading-tight px-2">
              {authUser?.headline || "Membre WorkNet"}
            </p>
            {profileUser?.location_name && (
              <p className="text-[10px] text-gray-400 text-center mt-1">{profileUser.location_name}</p>
            )}
          </div>

          {/* Stats */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1 pb-3">
            <div className="flex justify-between items-center px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded transition">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Vues du profil</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">247</span>
            </div>
            <div className="flex justify-between items-center px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded transition">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Relations</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">35</span>
            </div>
          </div>

          {/* Premium / Upsell (Optional minimalist version) */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 px-2">
            <Link href="#" className="flex items-center gap-2 group">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 underline decoration-dotted">Passez en pros</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3 px-2">
            <Link href="#" className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              <Bookmark size={14} />
              <span>Mes éléments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Groups & Events */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm p-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
        <div className="space-y-3">
          <Link href="#" className="block hover:underline">Groupes</Link>
          <Link href="#" className="block hover:underline">Événements</Link>
          <Link href="#" className="block hover:underline">Hashtags suivis</Link>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 text-center">
          <span className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">Découvrir plus</span>
        </div>
      </div>
    </div>
  );
}
