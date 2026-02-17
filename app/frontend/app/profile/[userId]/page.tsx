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
    Briefcase,
    GraduationCap,
    FolderGit2
} from "lucide-react";
import { selectViewedProfile, selectIsViewedProfileLoading } from "@/src/features/profiles/services/profile-selectors";
import { getPublicProfileThunk } from "@/src/features/profiles/services/profile-thunks";
import { Spinner } from "@/src/components/ui/spinner";
import { startConversationThunk } from "@/src/features/chat/services/chat-thunks";
import { getExperiencesByProfileIdThunk } from "@/src/features/experiences/services/experience-thunks";
import { getEducationsByProfileIdThunk } from "@/src/features/educations/services/education-thunks";
import { getProjectsThunk } from "@/src/features/projects/services/projects-thunks";
import { getProfileSkillsThunk } from "@/src/features/skills/services/skills-thunks";
import { getFollowCountsThunk, toggleFollowThunk, checkFollowStatusThunk } from "@/src/features/follows/services/follows-thunks";
import { JOB_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/src/features/experiences/services/experience-types";
import { DEGREE_LABELS } from "@/src/features/educations/services/education-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectAuthUser);
    const profile = useAppSelector(selectViewedProfile);
    const isLoading = useAppSelector(selectIsViewedProfileLoading);

    // Get data from Redux stores
    const { experiences } = useAppSelector((state) => state.experiences);
    const { educations } = useAppSelector((state) => state.educations);
    const { projects } = useAppSelector((state) => state.projects);
    const { profileSkills } = useAppSelector((state) => state.skills);
    const { countsByProfile, isFollowingMap } = useAppSelector((state) => state.follows);

    const userId = params.userId as string;
    const followCounts = countsByProfile[userId];
    const isFollowing = isFollowingMap[userId] || false;

    const handleMessageClick = async () => {
        if (!userId) return;
        await dispatch(startConversationThunk(userId));
        router.push('/messages');
    };

    const handleFollowToggle = async () => {
        if (!userId) return;
        await dispatch(toggleFollowThunk(userId));
    };

    useEffect(() => {
        if (userId) {
            dispatch(getPublicProfileThunk(userId));
            dispatch(getExperiencesByProfileIdThunk(userId));
            dispatch(getEducationsByProfileIdThunk(userId));
            dispatch(getProjectsThunk(userId));
            dispatch(getProfileSkillsThunk(userId));
            dispatch(getFollowCountsThunk(userId));
            if (authUser) {
                dispatch(checkFollowStatusThunk(userId));
            }
        }
    }, [userId, dispatch, authUser]);

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
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20 font-sans">

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
                                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name || profile.display_name}`}
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
                            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">{profile?.full_name || profile?.display_name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
                                    {profile.headline || "Membre WorkNet"}
                                </p>

                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{followCounts?.followers || profile.followers_count || 0}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Abonnés</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-900 dark:text-white">{followCounts?.following || profile.following_count || 0}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Abonnements</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {profile?.location_name && (
                                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {profile.location_name}</span>
                            )}
                            {profile?.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><LinkIcon size={16} /> Site web</a>
                            )}
                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /> Inscrit en {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'février 2026'}</span>
                        </div>

                        <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 dark:border-gray-800 md:flex-row md:items-center">
                            <div className="flex flex-row gap-2 w-full md:w-auto">
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full font-semibold text-sm transition shadow-sm whitespace-nowrap ${isFollowing
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                                        }`}
                                >
                                    <UserPlus size={18} /> {isFollowing ? 'Abonné' : 'S\'abonner'}
                                </button>
                                <button
                                    onClick={handleMessageClick}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition whitespace-nowrap"
                                >
                                    <Mail size={18} /> Message
                                </button>
                            </div>
                            <div className="flex justify-center gap-3 md:ml-auto pt-2 md:pt-0">
                                {profile.social_twitter && (
                                    <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Twitter size={20} /></a>
                                )}
                                {profile.social_github && (
                                    <a href={profile.social_github} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition"><Github size={20} /></a>
                                )}
                                {profile.social_linkedin && (
                                    <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Linkedin size={20} /></a>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* About */}
                        {profile?.bio && (
                            <section className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">À Propos</h2>
                                <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                    {profile.bio}
                                </div>
                            </section>
                        )}

                        {/* Experience */}
                        {experiences.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-gray-400" />
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Expériences</h2>
                                </div>

                                <div className="space-y-6">
                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="border-l-2 border-gray-200 dark:border-gray-800 pl-6 relative">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-blue-600" />
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">{exp.company_name}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{JOB_TYPE_LABELS[exp.type_job]}</span>
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">{PLACE_TYPE_LABELS[exp.type_place]}</span>
                                                <span>{format(new Date(exp.start_date), 'MMM yyyy', { locale: fr })} - {exp.is_current ? 'Présent' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy', { locale: fr }) : 'Présent'}</span>
                                            </div>
                                            {exp.description && (
                                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {educations.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={16} className="text-gray-400" />
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Formation</h2>
                                </div>

                                <div className="space-y-6">
                                    {educations.map((edu) => (
                                        <div key={edu.id} className="border-l-2 border-gray-200 dark:border-gray-800 pl-6 relative">
                                            <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full bg-green-600" />
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{edu.school_name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-medium">{DEGREE_LABELS[edu.degree]} - {edu.field_of_study}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {format(new Date(edu.start_date), 'yyyy', { locale: fr })} - {edu.is_current ? 'En cours' : edu.end_date ? format(new Date(edu.end_date), 'yyyy', { locale: fr }) : 'En cours'}
                                            </p>
                                            {edu.description && (
                                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{edu.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <FolderGit2 size={16} className="text-gray-400" />
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Projets</h2>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {projects.map((project) => (
                                        <a
                                            key={project.id}
                                            href={project.presentation_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all"
                                        >
                                            {project.thumbnail_url && (
                                                <img src={project.thumbnail_url} alt={project.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                                            )}
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{project.title}</h3>
                                            {project.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                <ExternalLink size={14} />
                                                <span>Voir le projet</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Stats */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between divide-x divide-gray-200 dark:divide-gray-700">
                            <div className="px-4 text-center flex-1">
                                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">{projects.length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Projets</span>
                            </div>
                            <div className="px-4 text-center flex-1">
                                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">{profileSkills.length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Compétences</span>
                            </div>
                        </div>

                        {/* Skills */}
                        {profileSkills.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Compétences</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileSkills.map((skill) => (
                                        <span key={skill.skill_id} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg shadow-sm">
                                            {skill.skill_name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
