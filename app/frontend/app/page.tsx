'use client';

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import LandingPage from "../src/components/landing/LandingPage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/feed');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Bienvenue sur WorkNet.</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">
            Votre espace professionnel sécurisé. Collaborez, explorez les opportunités et développez votre réseau d'experts.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-8 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 transition-colors">Connexions</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white">2.5K</p>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-8 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 transition-colors">Offres actives</p>
            <p className="text-4xl font-black text-gray-900 dark:text-white">1.2K</p>
          </div>
          <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-2xl p-8 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 transition-colors">Messages</p>
            <p className="text-4xl font-black text-black dark:text-white">3</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-10 border border-transparent dark:border-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Feuille de route</h2>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Consultez le fil d'actualité pour suivre l'expertise de votre réseau.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Parcourez les offres d'emploi sélectionnées pour votre profil.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-2 shrink-0" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Élargissez votre cercle professionnel par invitations directes.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
