"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useParams } from "next/navigation";
import { getProjectsThunk, createProjectThunk, getMyWorkspacesThunk } from "@/src/features/workspaces/services/workspaces-thunks";
import { selectWorkspaceProjects, selectWorkspacesLoading, selectWorkspaces } from "@/src/features/workspaces/services/workspaces-selectors";
import { Workspace, WPProject } from "@/src/features/workspaces/services/workspaces-types";
import Link from "next/link";
import { Plus, Layout, ChevronRight, ArrowLeft, Settings, Users, Shield } from "lucide-react";

export default function WorkspaceDetailPage() {
    const { workspaceId } = useParams();
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectWorkspaceProjects);
    const workspaces = useAppSelector(selectWorkspaces);
    const loading = useAppSelector(selectWorkspacesLoading);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [keyPrefix, setKeyPrefix] = useState("");

    const workspace = workspaces.find((w: Workspace) => w.id === workspaceId);

    useEffect(() => {
        if (workspaceId) {
            dispatch(getProjectsThunk(workspaceId as string));
            if (workspaces.length === 0) {
                dispatch(getMyWorkspacesThunk());
            }
        }
    }, [workspaceId, dispatch, workspaces?.length]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !keyPrefix.trim()) return;

        await dispatch(createProjectThunk({
            workspaceId: workspaceId as string,
            dto: {
                name: name.trim(),
                description: description.trim() || null,
                key_prefix: keyPrefix.trim().toUpperCase()
            }
        }));

        setIsModalOpen(false);
        setName("");
        setDescription("");
        setKeyPrefix("");
    };

    const iconStroke = 1.25;

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800 pb-20">
            <div className="max-w-5xl mx-auto w-full px-6 py-10">

                {/* Header bar */}
                <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 -mx-6 px-6 py-4 mb-8 -mt-10 sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/workspaces"
                                className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-bold uppercase tracking-tight group"
                            >
                                <ArrowLeft size={16} strokeWidth={iconStroke} className="group-hover:-translate-x-1 transition-transform" />
                                Retour aux espaces
                            </Link>
                            <div className="h-4 w-px bg-neutral-100 dark:bg-neutral-800" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-100 dark:border-neutral-700">
                                    <Layout size={16} strokeWidth={iconStroke} className="text-neutral-400" />
                                </div>
                                <span className="font-bold text-sm truncate max-w-[200px] text-neutral-900 dark:text-white">
                                    {workspace?.name || "Workspace"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <Users size={18} strokeWidth={iconStroke} />
                            </button>
                            <button className="p-2 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <Settings size={18} strokeWidth={iconStroke} />
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold rounded shadow-sm transition-colors"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Nouveau projet
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">

                    {/* Sidebar */}
                    <aside className="space-y-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
                            <h3 className="text-[13px] font-semibold text-neutral-900 dark:text-white mb-3 font-inter">
                                Statistiques
                            </h3>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{projects.length}</p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                                Projets actifs
                            </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} strokeWidth={iconStroke} className="text-neutral-400" />
                                <span className="text-[12px] font-semibold text-neutral-900 dark:text-white">Sécurité</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Accès restreint aux membres vérifiés. Modifications auditées.
                            </p>
                        </div>
                    </aside>

                    {/* Projets */}
                    <div className="space-y-4">
                        <div className="border-b border-neutral-300/60 dark:border-neutral-800 pb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
                                Projets
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Gérez vos flux de travail et déploiements
                            </p>
                        </div>

                        {loading && projects.length === 0 ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 animate-pulse" />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-16 text-center shadow-sm">
                                <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-100 dark:border-neutral-700">
                                    <Layout size={28} strokeWidth={iconStroke} className="text-neutral-300" />
                                </div>
                                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2 font-inter">
                                    Aucun projet
                                </h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 max-w-[260px] mx-auto font-medium">
                                    Créez votre premier projet pour démarrer.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-[#0A66C2] font-semibold hover:underline text-sm"
                                >
                                    + Créer un projet
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map((project: WPProject) => (
                                    <Link
                                        key={project.id}
                                        href={`/workspaces/projects/${project.id}`}
                                        className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex items-center justify-between shadow-sm hover:border-[#0A66C2] transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-100 dark:border-neutral-700 font-bold text-neutral-700 dark:text-neutral-300 text-sm group-hover:text-[#0A66C2] transition-colors">
                                                {project.key_prefix}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-[15px] truncate group-hover:text-[#0A66C2] transition-colors">
                                                    {project.name}
                                                </h3>
                                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[320px] mt-0.5">
                                                    {project.description || "Aucune description"}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} strokeWidth={iconStroke} className="text-neutral-400 group-hover:text-[#0A66C2] shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal création projet */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter">
                                    Nouveau projet
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    Initialisez un nouveau flux de travail
                                </p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: API v2, Design System..."
                                        className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-medium text-neutral-900 dark:text-white transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">
                                        Préfixe *
                                    </label>
                                    <input
                                        type="text"
                                        value={keyPrefix}
                                        onChange={(e) => setKeyPrefix(e.target.value.toUpperCase())}
                                        placeholder="Ex: DS, API..."
                                        maxLength={10}
                                        className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-mono font-medium text-neutral-900 dark:text-white uppercase transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 block">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Objectifs, contexte..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm font-medium text-neutral-900 dark:text-white resize-none transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
