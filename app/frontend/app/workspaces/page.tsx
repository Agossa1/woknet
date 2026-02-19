"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { getMyWorkspacesThunk, createWorkspaceThunk } from "@/src/features/workspaces/services/workspaces-thunks";
import { selectWorkspaces, selectWorkspacesLoading } from "@/src/features/workspaces/services/workspaces-selectors";
import { Workspace } from "@/src/features/workspaces/services/workspaces-types";
import Link from "next/link";
import { Plus, Briefcase, Lock, Globe, Layers, ArrowRight, ArrowLeft } from "lucide-react";

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

    const iconStroke = 1.5;

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800 pb-20">
            <div className="max-w-5xl mx-auto px-6 py-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                            <ArrowLeft size={14} strokeWidth={iconStroke} />
                            <span>Retour à l’espace pro</span>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
                            Espaces professionnels
                        </h1>
                        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-md leading-relaxed">
                            Centralisez vos flux de travail et gérez vos projets critiques.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 rounded font-semibold text-sm shadow-sm transition-colors"
                    >
                        <Plus size={16} strokeWidth={2} />
                        Ouvrir un espace
                    </button>
                </div>

                {/* Main Content Area */}
                {loading && workspaces.length === 0 ? (
                    <div className="flex justify-center items-center h-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                        <div className="w-5 h-5 border-2 border-neutral-300 border-t-[#0A66C2] rounded-full animate-spin" />
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 p-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-center mx-auto mb-6 border border-neutral-100 dark:border-neutral-700">
                            <Briefcase size={28} strokeWidth={1} className="text-neutral-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Aucun environnement actif</h2>
                        <p className="text-sm text-neutral-400 mb-8 max-w-sm mx-auto font-medium">
                            Vous n'avez pas encore d'espace de travail. Créez votre premier environnement pour démarrer.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#0A66C2] hover:bg-[#004182] text-white px-8 py-2.5 rounded font-semibold text-sm shadow-sm transition-colors"
                        >
                            Initialiser un workspace
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((ws: Workspace) => (
                            <Link
                                key={ws.id}
                                href={`/workspaces/${ws.id}`}
                                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col shadow-sm hover:border-[#0A66C2] transition-colors"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-400">
                                        <Briefcase size={18} strokeWidth={iconStroke} />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-[9px] font-bold text-neutral-500 uppercase tracking-tight">
                                        {ws.is_private ? (
                                            <>
                                                <Lock size={10} strokeWidth={2} /> <span>Privé</span>
                                            </>
                                        ) : (
                                            <>
                                                <Globe size={10} strokeWidth={2} /> <span>Public</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-[15px] font-semibold text-neutral-950 dark:text-white mb-2 tracking-tight font-inter">
                                    {ws.name}
                                </h3>

                                <p className="text-neutral-500 dark:text-neutral-400 text-[12px] line-clamp-2 mb-6 font-medium">
                                    {ws.description || "Pas de description spécifiée."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
                                    <div className="flex flex-col text-neutral-400">
                                        <span className="text-[10px] font-semibold">Mis à jour</span>
                                        <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                                            {new Date(ws.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="w-7 h-7 flex items-center justify-center text-neutral-400 group-hover:text-[#0A66C2] transition-colors">
                                        <ArrowRight size={14} strokeWidth={2} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Modal de création */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
                        <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-8 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">Créer un espace</h2>
                                <p className="text-xs text-neutral-500 font-medium mt-1">Configurez un nouvel environnement de travail.</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block">Nom de l'espace *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex : Squad Produit Europe"
                                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-950 dark:text-white outline-none text-sm font-medium focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Objectifs de cet espace..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-950 dark:text-white outline-none text-sm font-medium resize-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border border-neutral-100 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300">
                                        <Lock size={14} />
                                        <span className="text-[11px] font-semibold">Espace privé</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(!isPrivate)}
                                        className="h-5 w-9 rounded-full border border-neutral-300 dark:border-neutral-700 relative bg-white dark:bg-neutral-800"
                                    >
                                        <span className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-[#0A66C2] dark:bg-white transition-all ${isPrivate ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold rounded border border-[#0A66C2] shadow-sm transition-colors"
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
