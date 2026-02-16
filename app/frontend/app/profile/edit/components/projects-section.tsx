'use client';

import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Github, Loader2, Calendar } from "lucide-react";
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectLinkType, LINK_PLATFORM_LABELS } from "@/src/features/projects/services/projects-types";
import { useAppDispatch } from "@/src/store/hooks";
import { createProjectThunk, updateProjectThunk, deleteProjectThunk } from "@/src/features/projects/services/projects-thunks";
import { ProjectModal } from "./project-modal";

interface ProjectsSectionProps {
    projects: Project[];
    isLoading: boolean;
    profileId: string;
}

export const ProjectsSection = ({ projects, isLoading, profileId }: ProjectsSectionProps) => {
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const handleOpenModal = (project?: Project) => {
        setEditingProject(project || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleSave = async (data: CreateProjectDTO | UpdateProjectDTO) => {
        try {
            if ('id' in data) {
                await dispatch(updateProjectThunk(data as UpdateProjectDTO)).unwrap();
            } else {
                await dispatch(createProjectThunk(data as CreateProjectDTO)).unwrap();
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Une erreur est survenue lors de l'enregistrement.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            try {
                await dispatch(deleteProjectThunk(id)).unwrap();
            } catch (error) {
                console.error("Failed to delete project:", error);
                alert("Impossible de supprimer le projet.");
            }
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Projets & Réalisations</h2>
                    <p className="text-sm text-gray-500">Mettez en avant vos meilleurs travaux.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-sm"
                >
                    <Plus size={16} /> Ajouter un projet
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 font-medium">Aucun projet ajouté pour le moment.</p>
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="text-blue-600 font-bold text-sm mt-2 hover:underline"
                    >
                        Ajouter votre premier projet
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-gray-300 dark:hover:border-gray-700 flex flex-col h-full">
                            {/* Actions */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal(project)}
                                    className="p-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 rounded-full hover:text-blue-600 hover:scale-110 transition shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-full hover:bg-red-50 hover:scale-110 transition shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Thumbnail */}
                            <div className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                {project.thumbnail_url ? (
                                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <ExternalLink size={20} className="opacity-50" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2">
                                    <span className="px-2 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded-md">
                                        {LINK_PLATFORM_LABELS[project.link_platform || ProjectLinkType.OTHER]}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {project.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                                    <Calendar size={12} />
                                    <span>
                                        {project.start_date ? new Date(project.start_date).getFullYear() : '?'} — {project.is_ongoing ? 'Présent' : project.completion_date ? new Date(project.completion_date).getFullYear() : '?'}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {project.description}
                                    </p>
                                )}

                                <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <a
                                        href={project.presentation_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Voir le projet <ExternalLink size={12} />
                                    </a>
                                    {project.repository_url && (
                                        <a
                                            href={project.repository_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
                                        >
                                            <ExternalLink size={12} /> Source / Portfolio
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                project={editingProject}
                profileId={profileId}
            />
        </section>
    );
};
