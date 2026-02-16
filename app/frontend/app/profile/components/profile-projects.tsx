'use client';

import { ExternalLink, Github, Calendar, Briefcase } from "lucide-react";
import { Project, ProjectLinkType, LINK_PLATFORM_LABELS } from "@/src/features/projects/services/projects-types";

interface ProfileProjectsProps {
    projects: Project[];
}

export const ProfileProjects = ({ projects }: ProfileProjectsProps) => {
    // Show empty state instead of null to be visible during development
    if (!projects || projects.length === 0) {
        return (
            <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Briefcase size={14} /> Projets & Réalisations
                </h2>
                <div className="py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10">
                    <p className="text-sm text-gray-500 font-medium">Aucun projet public pour le moment.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Briefcase size={14} /> Projets & Réalisations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded  overflow-hidden   hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

                        {/* Thumbnail */}
                        <div className="h-48 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                            {project.thumbnail_url ? (
                                <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                        <Briefcase size={24} className="opacity-30" />
                                    </div>
                                </div>
                            )}

                            {/* Platform Badge */}
                            <div className="absolute top-3 right-3">
                                <span className="px-2.5 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-md text-black dark:text-white text-[10px] uppercase font-black tracking-wider rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                    {LINK_PLATFORM_LABELS[project.link_platform || ProjectLinkType.OTHER]}
                                </span>
                            </div>

                            {/* Ongoing Badge */}
                            {project.is_ongoing && (
                                <div className="absolute top-3 left-3">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> En cours
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-bold uppercase tracking-wide">
                                <Calendar size={12} />
                                <span>
                                    {project.start_date ? new Date(project.start_date).getFullYear() : '?'} — {project.is_ongoing ? 'Présent' : project.completion_date ? new Date(project.completion_date).getFullYear() : '?'}
                                </span>
                            </div>

                            {project.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                                    {project.description}
                                </p>
                            )}

                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <a
                                    href={project.presentation_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition shadow-sm"
                                >
                                    Consulter le projet <ExternalLink size={12} />
                                </a>
                                {project.repository_url && (
                                    <a
                                        href={project.repository_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                        title="Source / Documentation"
                                    >
                                        {project.repository_url.includes('github') ? <Github size={16} /> : <ExternalLink size={16} />}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
