"use client";

import Link from "next/link";
import { Home, Users, Briefcase, User, MessageSquare, LogOut, Settings, X, LogIn, UserPlus, Bell, Layers, Building2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapsed } = useSidebar();
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;
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
          className="fixed inset-0 bg-white/80 dark:bg-black/80 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 lg:static lg:h-screen lg:flex lg:flex-col transition-none ${isCollapsed ? "w-20" : "w-64"} ${isOpen ? "visible" : "invisible lg:visible"
          }`}
      >
        {/* Header / Logo */}
        <div className={`h-16 flex items-center border-b border-neutral-100 dark:border-neutral-800 px-5 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <Link href="/feed" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-neutral-950 dark:bg-white rounded-none flex items-center justify-center shrink-0">
              <span className="text-white dark:text-black font-extrabold text-[15px]">W</span>
            </div>
            {!isCollapsed && <span className="font-bold text-[17px] tracking-tight text-neutral-900 dark:text-white truncate">WorkNet</span>}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-none"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {isCollapsed && (
            <div className="px-3 mb-2 flex justify-center">
              <button
                onClick={toggleCollapsed}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-none"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {defaultLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 py-2.5 px-5 transition-none group relative ${active
                  ? "text-neutral-900 dark:text-white font-bold"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                onClick={handleLinkClick}
              >
                {/* Active Indicator Flat */}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-neutral-950 dark:bg-white" />
                )}
                {active && isCollapsed && (
                  <div className="absolute left-2 top-3 bottom-3 w-[4px] bg-neutral-950 dark:bg-white" />
                )}

                <Icon
                  size={20}
                  className="shrink-0 transition-none"
                  strokeWidth={active ? 2 : iconStroke}
                />
                {!isCollapsed && <span className="text-[14px] tracking-tight truncate">{link.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-none z-[100] bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-3 py-2 text-[10px] font-bold whitespace-nowrap border border-neutral-900 dark:border-neutral-200">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="py-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 py-2.5 px-5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-none group relative ${isCollapsed ? "justify-center px-0" : ""}`}
            onClick={handleLinkClick}
          >
            <Settings size={20} className="transition-none shrink-0" strokeWidth={iconStroke} />
            {!isCollapsed && <span className="text-[14px] tracking-tight truncate">Paramètres</span>}
            {isCollapsed && (
              <div className="absolute left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-none z-[100] bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-3 py-2 text-[10px] font-bold whitespace-nowrap border border-neutral-900 dark:border-neutral-200">
                Paramètres
              </div>
            )}
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
              className={`w-full flex items-center gap-3 py-2.5 px-5 text-neutral-400 dark:text-neutral-500 hover:text-red-600 transition-none group relative ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <LogOut size={20} strokeWidth={iconStroke} className="shrink-0 transition-none" />
              {!isCollapsed && <span className="text-[14px] font-medium tracking-tight truncate">Déconnexion</span>}
              {isCollapsed && (
                <div className="absolute left-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-none z-[100] bg-red-600 text-white px-3 py-2 text-[10px] font-bold whitespace-nowrap border border-red-700">
                  Déconnexion
                </div>
              )}
            </button>
          ) : (
            <div className="space-y-1 px-4">
              <Link
                href="/auth/sign-in"
                onClick={handleLinkClick}
                className={`flex items-center justify-center py-2.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold border border-neutral-950 dark:border-white transition-none ${isCollapsed ? "w-10 h-10 px-0" : "w-full"}`}
              >
                {isCollapsed ? <LogIn size={18} /> : <span>Se connecter</span>}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}