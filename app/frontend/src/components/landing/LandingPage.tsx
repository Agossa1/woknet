'use client';

import Link from 'next/link';
import {
    ChevronRight,
    ArrowRight,
    Shield,
    Zap,
    Globe,
    Users,
    Lock,
    Target,
    BarChart3,
    CheckCircle2,
    Briefcase,
    Building2
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black selection:bg-neutral-100 dark:selection:bg-neutral-900 text-neutral-800 dark:text-white antialiased font-sans">
            <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-900">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center shadow-sm">
                            <span className="text-white dark:text-black font-black text-lg">W</span>
                        </div>
                        <span className="font-semibold text-[18px] tracking-tight text-neutral-900 dark:text-white font-inter">
                            WorkNet
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black tracking-widest text-neutral-500">
                        <a href="#features" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                            Système
                        </a>
                        <a href="#security" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                            Sécurité
                        </a>
                        <a href="#vision" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                            Vision
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/sign-in"
                            className="hidden sm:block text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/auth/sign-up"
                            className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2 rounded-full text-xs font-semibold transition-all shadow-sm"
                        >
                            Rejoindre
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-20">
                <section className="px-6">
                    <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.5fr,1fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold tracking-widest text-neutral-700 dark:text-neutral-200">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-[#0A66C2]" />
                                <span>Plateforme B2B · WorkNet</span>
                            </div>
                            <div className="space-y-5">
                                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white font-inter">
                                    Pilotez votre marque employeur, vos offres et votre réseau pro.
                                </h1>
                                <p className="text-sm md:text-[15px] text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                                    WorkNet structure vos pages entreprises, vos offres d’emploi et vos échanges
                                    stratégiques dans un espace unique, pensé pour les directions produit, RH et
                                    communication.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Link
                                    href="/auth/sign-up"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0A66C2] px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#004182] transition-colors"
                                >
                                    Créer mon espace
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/auth/sign-in"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 px-7 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    Voir la plateforme
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-7 h-7 rounded-full border-2 border-[#F4F2EE] dark:border-black bg-neutral-300 dark:bg-neutral-700"
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold tracking-widest">
                                    +5k profils et organisations actifs
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                            Vue d’ensemble WorkNet
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            Ce que voit votre équipe au quotidien.
                                        </p>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-[#0A66C2] font-semibold">
                                        Temps réel
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                                                    <Users size={16} />
                                                </div>
                                                <p className="text-xs font-semibold text-neutral-800 dark:text-white">
                                                    Fil réseau
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Partages, retours d’expérience et annonces internes.
                                            </p>
                                        </div>
                                        <div className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                                                    <Building2 size={16} />
                                                </div>
                                                <p className="text-xs font-semibold text-neutral-800 dark:text-white">
                                                    Pages entreprises
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Présentez vos équipes, produits et projets clés.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3 flex items-start gap-3">
                                        <div className="w-7 h-7 rounded bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500">
                                            <Briefcase size={16} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-neutral-800 dark:text-white">
                                                Offres ciblées pour votre réseau
                                            </p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Diffusez des postes aux bons profils, sans spammer le reste de la
                                                plateforme.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="mt-24 border-t border-neutral-300/60 dark:border-neutral-900 py-16 px-6">
                    <div className="max-w-6xl mx-auto space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="space-y-3">
                                <p className="text-[11px] font-black tracking-[0.25em] text-neutral-500">
                                    Modules principaux
                                </p>
                                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white font-inter">
                                    Trois espaces pour orchestrer votre présence et vos opportunités.
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
                                    Chaque module est pensé pour rester simple à prendre en main, tout en offrant
                                    une profondeur suffisante pour les équipes qui scale.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <div className="w-9 h-9 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-300 mb-1">
                                    <Users size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Fil d’actualité professionnel
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Partagez des mises à jour ciblées avec vos équipes, partenaires et clients sans
                                    mélanger le perso et le pro.
                                </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <div className="w-9 h-9 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-300 mb-1">
                                    <Building2 size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Pages organisations
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Créez des espaces dédiés pour vos entités, marques ou business units, avec un
                                    contrôle fin sur la visibilité.
                                </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <div className="w-9 h-9 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-300 mb-1">
                                    <Briefcase size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Offres et missions
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Publiez des postes ou missions, recevez des candidatures qualifiées et suivez les
                                    échanges au même endroit.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="security" className="border-t border-neutral-300/60 dark:border-neutral-900 py-16 px-6">
                    <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.4fr,1fr] items-start">
                            <div className="space-y-4">
                                <p className="text-[11px] font-black tracking-[0.25em] text-neutral-500">
                                Confiance et contrôle
                            </p>
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white font-inter">
                                Une infrastructure pensée pour les organisations exigeantes.
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                                WorkNet s’appuie sur un backend modulaire avec PostgreSQL, Redis et WebSockets pour
                                assurer à la fois réactivité et gouvernance des accès.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                        <Lock size={16} />
                                        <span className="text-[11px] font-semibold tracking-widest">
                                            Accès maîtrisés
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        Rôles, scopes et audits des actions sensibles.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                        <Shield size={16} />
                                        <span className="text-[11px] font-semibold tracking-widest">
                                            Données protégées
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        Chiffrement au repos et en transit pour les flux critiques.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                        <Globe size={16} />
                                        <span className="text-[11px] font-semibold tracking-widest">
                                            Temps réel
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        Notifications et feeds synchronisés sur tous les appareils.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                    Checklist d’onboarding
                                </p>
                                <span className="text-[11px] text-neutral-500">3 / 3 validés</span>
                            </div>
                            <div className="space-y-2 text-[12px] text-neutral-600 dark:text-neutral-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-[#0A66C2]" size={14} />
                                    <span>Connexion sécurisée et vérification des sessions actives.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-[#0A66C2]" size={14} />
                                    <span>Rôles définis pour l’équipe RH, communication et direction.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-[#0A66C2]" size={14} />
                                    <span>Politique de diffusion des posts validée par l’organisation.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="vision" className="border-t border-neutral-300/60 dark:border-neutral-900 py-16 px-6">
                    <div className="max-w-6xl mx-auto space-y-10">
                        <div className="space-y-3 max-w-xl">
                            <p className="text-[11px] font-black tracking-[0.25em] text-neutral-500">
                                Parcours WorkNet
                            </p>
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white font-inter">
                                Passez de l’inscription à la première valeur en quelques jours.
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Nous avons structuré WorkNet pour que vous puissiez démarrer petit, tester avec un
                                périmètre réduit, puis étendre progressivement.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                    Étape 1
                                </p>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Créez votre profil et votre première page.
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Importez vos informations clés, définissez votre bio et créez la page d’une
                                    entité pilote.
                                </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                    Étape 2
                                </p>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Activez le fil pour votre écosystème.
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Publiez des mises à jour, invitez vos équipes et connectez vos partenaires
                                    stratégiques.
                                </p>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                                <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                    Étape 3
                                </p>
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Ouvrez les opportunités.
                                </h3>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Publiez des offres, identifiez des experts et formalisez vos collaborations
                                    directement dans WorkNet.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 px-5 py-4">
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold tracking-widest text-neutral-500">
                                    Prêt à démarrer&nbsp;?
                                </p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-200">
                                    Créez votre compte et votre première page en moins de 5 minutes.
                                </p>
                            </div>
                            <Link
                                href="/auth/sign-up"
                                className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#004182] transition-colors"
                            >
                                Commencer maintenant
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-16 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-900">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
                            <span className="text-white dark:text-black font-black text-xs">W</span>
                        </div>
                        <span className="text-[10px] font-black tracking-widest opacity-40">
                            WorkNet Enterprise
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest">
                        © 2026 Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}
