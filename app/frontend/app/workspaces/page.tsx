"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { getMyWorkspacesThunk, createWorkspaceThunk } from "@/src/features/workspaces/services/workspaces-thunks";
import { selectWorkspaces, selectWorkspacesLoading } from "@/src/features/workspaces/services/workspaces-selectors";
import { Workspace } from "@/src/features/workspaces/services/workspaces-types";
import Link from "next/link";
import { Plus, Briefcase, Lock, Globe, ChevronRight } from "lucide-react";

export default function WorkspacesPage() {
    const dispatch = useAppDispatch();
    const workspaces = useAppSelector(selectWorkspaces);
    const loading = useAppSelector(selectWorkspacesLoading);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(true);

    useEffect(() => {
        dispatch(getMyWorkspacesThunk());
    }, [dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        await dispatch(createWorkspaceThunk({
            name: name.trim(),
            description: description.trim() || null,
            is_private: isPrivate
        }));

        setIsModalOpen(false);
        setName("");
        setDescription("");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Espaces de Travail</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez vos projets et collaborez avec votre équipe.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} />
                    Nouvel Espace
                </button>
            </div>

            {loading && workspaces.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : workspaces.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase size={40} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Aucun espace de travail</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Créez votre premier espace pour commencer à organiser vos projets et tâches.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg active:scale-95"
                    >
                        Créer mon premier espace
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((ws: Workspace) => (
                        <Link
                            key={ws.id}
                            href={`/workspaces/${ws.id}`}
                            className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Briefcase size={24} />
                                </div>
                                {ws.is_private ? (
                                    <span className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                                        <Lock size={12} /> Privé
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                                        <Globe size={12} /> Public
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                {ws.name}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                {ws.description || "Aucune description fournie."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                    Mis à jour {new Date(ws.updated_at).toLocaleDateString()}
                                </span>
                                <div className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold text-sm">
                                    Ouvrir <ChevronRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal de création */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Nouvel Espace de Travail</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nom de l'espace</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ex: Projet X, Agence, Équipe Mobile..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (optionnelle)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="De quoi s'agit-il ?"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspace privé</span>
                                <button
                                    type="button"
                                    onClick={() => setIsPrivate(!isPrivate)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrivate ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    Créer l'espace
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
