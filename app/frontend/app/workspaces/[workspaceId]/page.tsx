"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useParams } from "next/navigation";
import { getProjectsThunk, createProjectThunk, getMyWorkspacesThunk } from "@/src/features/workspaces/services/workspaces-thunks";
import { selectWorkspaceProjects, selectWorkspacesLoading, selectWorkspaces } from "@/src/features/workspaces/services/workspaces-selectors";
import { Workspace, WPProject } from "@/src/features/workspaces/services/workspaces-types";
import Link from "next/link";
import { Plus, Layout, List, ChevronRight, ArrowLeft, Settings, Users, PieChart } from "lucide-react";

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
    }, [workspaceId, dispatch, workspaces.length]);

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

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Link href="/workspaces" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Retour aux workspaces
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {workspace?.name || "Workspace"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                        {workspace?.description || "Visualisez et gérez les projets de cet espace."}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <Users size={20} />
                    </button>
                    <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Stats */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-4">
                            < PieChart size={32} />
                            <span className="font-bold text-lg">Aperçu</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-100">Projets</span>
                                <span className="font-bold">{projects.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-100">Tasks</span>
                                <span className="font-bold">--</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layout size={20} className="text-indigo-600" />
                            Projets Actifs
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                        >
                            <Plus size={18} />
                            Nouveau Projet
                        </button>
                    </div>

                    {loading && projects.length === 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">Aucun projet dans cet espace.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((project: WPProject) => (
                                <Link
                                    key={project.id}
                                    href={`/workspaces/projects/${project.id}`}
                                    className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all hover:border-indigo-200 dark:hover:border-indigo-900"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-lg border border-gray-100 dark:border-gray-700">
                                            {project.key_prefix}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{project.description || "Aucune description"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex -space-x-2">
                                            {[1, 2].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700" />
                                            ))}
                                        </div>
                                        <ChevronRight size={20} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de création de projet */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Nouveau Projet</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom du projet</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ex: Design System, API Integration..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Clé du projet (Préfixe)</label>
                                <input
                                    type="text"
                                    value={keyPrefix}
                                    onChange={(e) => setKeyPrefix(e.target.value.toUpperCase())}
                                    placeholder="ex: DS, API, WEB..."
                                    maxLength={10}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-1 uppercase">Sera utilisé pour numéroter vos tâches (ex: {keyPrefix || 'PROJ'}-123)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all">Créer Projet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
