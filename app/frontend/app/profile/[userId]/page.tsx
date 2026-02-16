'use client';

import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    MapPin,
    Link as LinkIcon,
    Calendar,
    Mail,
    UserPlus,
    Github,
    Twitter,
    Linkedin,
    ExternalLink,
    Plus,
    CircleDot,
    GraduationCap
} from "lucide-react";
import { selectViewedProfile, selectIsViewedProfileLoading } from "@/src/features/profiles/services/profile-selectors";
import { getPublicProfileThunk } from "@/src/features/profiles/services/profile-thunks";
import { Spinner } from "@/src/components/ui/spinner";
import { startConversationThunk } from "@/src/features/chat/services/chat-thunks";

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectAuthUser);
    const profile = useAppSelector(selectViewedProfile);
    const isLoading = useAppSelector(selectIsViewedProfileLoading);

    const userId = params.userId as string;

    const handleMessageClick = async () => {
        if (!userId) return;
        await dispatch(startConversationThunk(userId));
        router.push('/messages');
    };

    useEffect(() => {
        if (userId) {
            dispatch(getPublicProfileThunk(userId));
        }
    }, [userId, dispatch]);

    // Si c'est notre propre profil, on redirige vers /profile (l'espace privé/éditable)
    useEffect(() => {
        if (authUser && authUser.id === userId) {
            router.replace('/profile');
        }
    }, [authUser, userId, router]);

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <Spinner size="lg" label="Chargement du profil public" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">

            {/* Banner / Cover Photo Section */}
            <div className="relative h-44 md:h-64 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {profile?.banner_url ? (
                    <img
                        src={profile.banner_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-12 space-y-8 md:space-y-12">

                {/* Header Section */}
                <header className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start -mt-12 md:-mt-20 mb-1">
                    <div className="relative shrink-0 mx-auto md:mx-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-900 shadow-sm relative group">
                            <img
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {profile.is_active && (
                            <div className="absolute top-2 right-4 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full z-20" />
                        )}
                    </div>

                    <div className="flex-1 pt-2 md:pt-20 space-y-4 w-full text-center md:text-left mb-0">
                        <div className="space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight">{profile?.display_name}</h1>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <p className="text-base md:text-xl text-blue-600 dark:text-blue-400 font-semibold italic">
                                    {profile.headline || "Membre WorkNet"}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${profile.is_active
                                    ? "border-green-100 bg-green-50/30 text-green-700 dark:border-green-900/20 dark:bg-green-900/10 dark:text-green-400"
                                    : "border-red-100 bg-red-50/30 text-red-700 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400"
                                    }`}>
                                    <div className={`w-1 h-1 rounded-full ${profile.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{profile.is_active ? "Actif" : "Inactif"}</span>
                                </div>

                                <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black text-gray-900 dark:text-white">{profile.followers_count || 0}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Abonnés</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black text-gray-900 dark:text-white">{profile.following_count || 0}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Abonnements</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5"><MapPin size={17} className="text-gray-400" /> {profile?.location_name || 'France'}</span>
                            <a href="#" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><LinkIcon size={16} /> Portfolio</a>
                            <span className="flex items-center gap-1.5"><Calendar size={17} className="text-gray-400" /> Inscrit en {profile.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'février 2026'}</span>
                        </div>

                        <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 dark:border-gray-800 md:flex-row md:items-center">
                            <div className="flex flex-row gap-2 w-full md:w-auto">
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-4 md:px-10 py-3 rounded-full font-bold text-xs md:text-sm hover:opacity-90 transition shadow-lg shadow-black/5 dark:shadow-white/5 whitespace-nowrap">
                                    <UserPlus size={18} /> Se connecter
                                </button>
                                <button
                                    onClick={handleMessageClick}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 md:px-10 py-3 rounded-full font-bold text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition whitespace-nowrap"
                                >
                                    <Mail size={18} /> Message
                                </button>
                            </div>
                            <div className="flex justify-center gap-4 md:ml-auto pt-2 md:pt-0">
                                <a href="#" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Twitter size={20} /></a>
                                <a href="#" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition"><Github size={20} /></a>
                                <a href="#" className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Linkedin size={20} /></a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* About */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">À Propos</h2>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                                {profile?.bio || "Ce membre n'a pas encore ajouté de biographie."}
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Parcours professionnel</h2>
                            </div>

                            <div className="space-y-10 border-l-2 border-gray-100 dark:border-gray-800 ml-1 pl-6 md:pl-8 relative">
                                <div className="relative group">
                                    <div className="absolute -left-[27px] md:-left-[37px] top-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-gray-900 bg-blue-600 shadow-sm" />
                                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">Software Engineer</h3>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">Expérience</span>
                                    </div>
                                    <p className="text-gray-400 font-bold mb-3 tracking-tight">Poste actuel</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                        Détails du parcours professionnel non communiqués pour le moment.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Stats */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between divide-x divide-gray-200 dark:divide-gray-700">
                            <div className="px-4 text-center flex-1">
                                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">15</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Projets</span>
                            </div>
                            <div className="px-4 text-center flex-1">
                                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">50</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Compétences</span>
                            </div>
                        </div>

                        {/* Skills */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Expertises</h2>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {["Développement", "Stratégie", "UI/UX"].map((skill) => (
                                    <span key={skill} className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:border-blue-500/50 hover:bg-blue-50/10 transition cursor-default shadow-sm shadow-black/5">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
