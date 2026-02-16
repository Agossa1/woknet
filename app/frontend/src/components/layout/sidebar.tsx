"use client";

import Link from "next/link";
import { Home, Users, Briefcase, User, MessageSquare, LogOut, Settings, X, LogIn, UserPlus, Bell } from "lucide-react";
import { useSidebar } from "../../../src/providers/sidebar-provider";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

const defaultLinks = [
  { label: "Accueil", href: "/feed", icon: Home },
  { label: "Réseau", href: "/connections", icon: Users },
  { label: "Offres d'emploi", href: "/jobs", icon: Briefcase },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Messagerie", href: "/messages", icon: MessageSquare },
  { label: "Profil", href: "/profile", icon: User },
];

export function AppSidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  // Prevent hydration mismatch for window access
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Unified for Mobile & Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 lg:static lg:h-screen lg:flex lg:flex-col transition-all duration-300 ${isOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible -translate-x-4 lg:opacity-100 lg:visible lg:translate-x-0"
          }`}
      >
        {/* Header / Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-xl tracking-tight hidden lg:block dark:text-white">WorkNet</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-500 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {defaultLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-md transition group ${active
                  ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                  }`}
                onClick={handleLinkClick}
              >
                <Icon
                  size={20}
                  className={active ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-3 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
            onClick={handleLinkClick}
          >
            <Settings size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white" />
            <span className="text-sm font-medium">Paramètres</span>
          </Link>
          {mounted && isAuthenticated ? (
            <button
              onClick={async () => {
                try {
                  await logout();
                  router.push('/auth/sign-in');
                } catch (err) {
                  console.error('Logout failed', err);
                } finally {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) toggleSidebar();
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition group"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          ) : (
            <>
              <Link
                href="/auth/sign-up"
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 p-3 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
              >
                <UserPlus size={20} />
                <span className="text-sm font-medium">S'inscrire</span>
              </Link>
              <Link
                href="/auth/sign-in"
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 p-3 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
              >
                <LogIn size={20} />
                <span className="text-sm font-medium">Se connecter</span>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}