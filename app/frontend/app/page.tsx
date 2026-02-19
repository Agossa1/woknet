'use client';

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import LandingPage from "../src/components/landing/LandingPage";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Newspaper, Briefcase, Building2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // On reste sur cette page "espace pro" une fois connecté,
      // plutôt que de rediriger directement vers /feed
    }
  }, [isAuthenticated, isLoading]);

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
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black p-6 md:p-10 font-sans antialiased text-neutral-800">
      <div className="max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          <div className="pb-6 border-b border-neutral-300/60 dark:border-neutral-800">
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
              Espace professionnel
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base mt-1 font-medium max-w-xl">
              Centralisez votre activité sur WorkNet&nbsp;: fil d’actualité, offres d’emploi et gestion de vos entreprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HomeCard
              href="/feed"
              icon={<Newspaper size={22} />}
              title="Fil d’actualité"
              description="Suivez les dernières publications de votre réseau."
            />
            <HomeCard
              href="/jobs"
              icon={<Briefcase size={22} />}
              title="Offres d’emploi"
              description="Explorez les opportunités qui vous correspondent."
            />
            <HomeCard
              href="/companies"
              icon={<Building2 size={22} />}
              title="Centre entreprises"
              description="Gérez vos pages et votre marque employeur."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-transform"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-[#0A66C2] transition-colors">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white font-inter">
          {title}
        </h2>
      </div>
      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
