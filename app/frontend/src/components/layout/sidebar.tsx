"use client";

import Link from "next/link";
import { Home, Users, Briefcase, User, MessageSquare, LogOut, Settings, X, LogIn, UserPlus, Bell, Layers, Building2 } from "lucide-react";
import { useSidebar } from "../../../src/providers/sidebar-provider";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

const defaultLinks = [
  { label: "Accueil", href: "/feed", icon: Home },
  { label: "Réseau", href: "/connections", icon: Users },
  { label: "Offres d'emploi", href: "/jobs", icon: Briefcase },
  { label: "Espaces pro", href: "/workspaces", icon: Layers },
  { label: "Entreprises", href: "/companies", icon: Building2 },
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

  // Standard icon stroke
  const iconStroke = 1.5;

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

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 lg:static lg:h-screen lg:flex lg:flex-col transition-all duration-300 ${isOpen ? "opacity-100 visible translate-x-0" : "opacity-0 invisible -translate-x-4 lg:opacity-100 lg:visible lg:translate-x-0"
          }`}
      >
        {/* Header / Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded flex items-center justify-center">
              <span className="text-white dark:text-black font-semibold text-base">W</span>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden lg:block dark:text-white">WorkNet</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-500 hover:text-gray-900">
            <X size={20} strokeWidth={iconStroke} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {defaultLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-2.5 rounded transition group ${active
                  ? "bg-neutral-50 dark:bg-gray-800 text-black dark:text-white font-semibold"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                  }`}
                onClick={handleLinkClick}
              >
                <Icon
                  size={18}
                  className={active ? "text-black dark:text-white" : "text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white"}
                  strokeWidth={iconStroke}
                />
                <span className="text-sm tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-2.5 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
            onClick={handleLinkClick}
          >
            <Settings size={18} strokeWidth={iconStroke} className="text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white" />
            <span className="text-sm font-medium tracking-tight">Paramètres</span>
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
              className="w-full flex items-center gap-3 p-2.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition group"
            >
              <LogOut size={18} strokeWidth={iconStroke} />
              <span className="text-sm font-medium tracking-tight">Déconnexion</span>
            </button>
          ) : (
            <>
              <Link
                href="/auth/sign-up"
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 p-2.5 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
              >
                <UserPlus size={18} strokeWidth={iconStroke} />
                <span className="text-sm font-medium tracking-tight">S'inscrire</span>
              </Link>
              <Link
                href="/auth/sign-in"
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 p-2.5 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50/50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition group"
              >
                <LogIn size={18} strokeWidth={iconStroke} />
                <span className="text-sm font-medium tracking-tight">Se connecter</span>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}