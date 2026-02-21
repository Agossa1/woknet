"use client";

import { Bell, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useSidebar } from '../../../src/providers/sidebar-provider';
import { useTheme } from '../../../src/providers/theme-provider';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/src/features/notifications/components/notification-bell';
import { useAppDispatch } from '@/src/store/hooks';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { isOpen, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Standard icon stroke
  const iconStroke = 1.5;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-900 sticky top-0 z-40 w-full transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Left Side: Mobile Menu & Search */}
          <div className="flex items-center gap-4 flex-1">

            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-black hover:bg-neutral-50 dark:hover:bg-gray-800 transition"
            >
              {isOpen ? <X size={20} strokeWidth={iconStroke} /> : <Menu size={20} strokeWidth={iconStroke} />}
            </button>

            {/* Search Bar (Desktop) */}
            <div className="relative max-w-md w-full hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" strokeWidth={iconStroke} />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded bg-[#F4F2EE] dark:bg-black text-neutral-800 dark:text-gray-100 placeholder-neutral-400 focus:outline-none focus:bg-white dark:focus:bg-neutral-950 focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition sm:text-[13px] font-medium"
                placeholder="Rechercher sur WorkNet"
              />
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-neutral-400 hover:text-black dark:hover:text-gray-200"
            >
              <Search size={20} strokeWidth={iconStroke} />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-4">

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-gray-200 transition"
            >
              {mounted && (theme === 'dark' ? <Sun size={18} strokeWidth={iconStroke} /> : <Moon size={18} strokeWidth={iconStroke} />)}
              {!mounted && <Moon size={18} strokeWidth={iconStroke} />}
            </button>

            <Link
              href="/messages"
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-gray-200 transition"
              title="Messages"
            >
              <MessageSquare size={18} strokeWidth={iconStroke} />
            </Link>

            <NotificationBell />

            <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 ml-2 h-6 flex items-center">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex flex-col items-center group"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-gray-700 overflow-hidden border border-neutral-200 dark:border-gray-600 transition group-hover:border-neutral-400">
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
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 border-b border-neutral-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" strokeWidth={iconStroke} />
            </div>
            <input
              type="text"
              autoFocus
              className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded bg-white dark:bg-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0A66C2] transition shadow-sm"
              placeholder="Rechercher..."
            />
          </div>
        </div>
      )}
    </nav>
  );
}
