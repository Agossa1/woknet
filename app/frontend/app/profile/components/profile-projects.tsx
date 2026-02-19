'use client';

import { ExternalLink, Github, Calendar, Briefcase } from "lucide-react";
import { Project, ProjectLinkType, LINK_PLATFORM_LABELS } from "@/src/features/projects/services/projects-types";

interface ProfileProjectsProps {
    projects: Project[];
    isOwnProfile?: boolean;
    onAdd?: () => void;
}

import { Plus } from "lucide-react";

export const ProfileProjects = ({ projects, isOwnProfile, onAdd }: ProfileProjectsProps) => {
    return (
        <div className="space-y-0">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Projets</h2>
                {isOwnProfile && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 text-[#0A66C2] hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 rounded transition-colors text-[13px] md:text-[14px] font-semibold whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Ajouter</span>
                    </button>
                )}
            </div>

            <div className="p-4 md:p-6">
                {projects && projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {projects.map((project) => (
                            <div key={project.id} className="group flex flex-col border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden hover:border-[#0A66C2] hover:shadow-md transition-all">
                                {/* Thumbnail */}
                                <div className="h-40 bg-neutral-50 dark:bg-neutral-800 relative overflow-hidden shrink-0">
                                    {project.thumbnail_url ? (
                                        <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Briefcase size={32} className="text-neutral-200 dark:text-neutral-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-0.5 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] font-bold text-neutral-600 dark:text-neutral-400 rounded border border-neutral-100 dark:border-neutral-800">
                                            {LINK_PLATFORM_LABELS[project.link_platform || ProjectLinkType.OTHER]}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors mb-1 font-inter">
                                        {project.title}
                                    </h3>
                                    <p className="text-[12px] text-neutral-500 mb-2">
                                        {project.start_date ? new Date(project.start_date).getFullYear() : '?'} — {project.is_ongoing ? 'Présent' : project.completion_date ? new Date(project.completion_date).getFullYear() : '?'}
                                    </p>
                                    {project.description && (
                                        <p className="text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}
                                    <div className="mt-auto flex items-center gap-2">
                                        <a
                                            href={project.presentation_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-[12px] font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                                        >
                                            Consulter <ExternalLink size={14} />
                                        </a>
                                        {project.repository_url && (
                                            <a
                                                href={project.repository_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                                            >
                                                <Github size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center border border-dashed border-neutral-100 dark:border-neutral-800 rounded-lg">
                        <p className="text-sm text-neutral-400 italic">Aucun projet ajouté pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
