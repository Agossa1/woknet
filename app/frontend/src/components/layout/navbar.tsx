"use client";

import { Bell, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { useTheme } from '../../../src/providers/theme-provider';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/src/features/notifications/components/notification-bell';
import { useAppDispatch } from '@/src/store/hooks';
import { toggleChatDrawer } from '@/src/features/chat/services/chat-slice';
import { MessageSquare } from 'lucide-react';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isOpen, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 w-full transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Left Side: Mobile Menu & Search */}
          <div className="flex items-center gap-4 flex-1">

            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search Bar (Desktop) */}
            <div className="relative max-w-md w-full hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black dark:focus:ring-white transition sm:text-sm"
                placeholder="Rechercher..."
              />
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Search size={22} />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
            >
              {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
              {!mounted && <Moon size={20} />}
            </button>

            <button
              onClick={() => dispatch(toggleChatDrawer())}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition"
              title="Messages"
            >
              <MessageSquare size={20} />
            </button>

            <NotificationBell />

            <div className="relative border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex flex-col items-center group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600 transition ring-offset-2 ring-offset-white dark:ring-offset-gray-900 group-hover:ring-2 ring-gray-200 dark:ring-gray-700">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Input Overlay */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              autoFocus
              className="block w-full pl-10 pr-3 py-2 border border-blue-500 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none ring-1 ring-blue-500 transition sm:text-sm shadow-sm"
              placeholder="Rechercher..."
            />
          </div>
        </div>
      )}
    </nav>
  );
}
