'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, X, Printer, Layout, CheckCircle2 } from "lucide-react";
import { MinimalistTemplate } from "./resume-templates/minimalist";
import { ModernTemplate } from "./resume-templates/modern";
import { ClassicTemplate } from "./resume-templates/classic";
import { useAppSelector } from "@/src/store/hooks";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { selectProfileUser } from "@/src/features/profiles/services/profile-selectors";
import { selectExperiences } from "@/src/features/experiences/services/experience-selectors";
import { selectEducations } from "@/src/features/educations/services/education-selectors";
import { selectProfileSkills } from "@/src/features/skills/services/skills-selectors";
import { AnimatePresence, motion } from "framer-motion";

export const ResumeExportButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<'minimalist' | 'modern' | 'classic'>('minimalist');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const user = useAppSelector(selectAuthUser);
    const profile = useAppSelector(selectProfileUser);
    const experiences = useAppSelector(selectExperiences);
    const educations = useAppSelector(selectEducations);
    const skillsList = useAppSelector(selectProfileSkills);

    if (!user) return null;

    const handlePrint = () => {
        window.print();
    };

    const templates = [
        { id: 'minimalist', name: 'Minimalist', desc: 'Noir & Blanc • Épuré' },
        { id: 'modern', name: 'Modern', desc: 'Sidebar • Coloré' },
        { id: 'classic', name: 'Classic', desc: 'Formel • Serif' }
    ];

    // Modal Content Component to be portaled
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-7xl h-[95vh] bg-[#F5F5F5] dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Sidebar: Template Selector */}
                        <div className="w-full md:w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 flex flex-col h-full">
                            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Layout size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">Design du CV</h3>
                                </div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Choisissez votre style WorkNet</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {templates.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id as any)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start justify-between group ${selectedTemplate === t.id
                                            ? "border-[#0A66C2] bg-blue-50/50 dark:bg-[#0A66C2]/10"
                                            : "border-transparent bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-200"
                                            }`}
                                    >
                                        <div>
                                            <p className={`text-[13px] font-black uppercase tracking-tight ${selectedTemplate === t.id ? "text-[#0A66C2]" : "text-neutral-700 dark:text-neutral-300"}`}>
                                                {t.name}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 leading-none">{t.desc}</p>
                                        </div>
                                        {selectedTemplate === t.id && <CheckCircle2 size={18} className="text-[#0A66C2]" />}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-black/20">
                                <button
                                    onClick={handlePrint}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A66C2] text-white rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-[#004182] transition shadow-lg"
                                >
                                    <Printer size={16} />
                                    <span>Télécharger en PDF</span>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-3 text-neutral-500 text-xs font-bold uppercase hover:text-neutral-700 transition"
                                >
                                    Fermer l'aperçu
                                </button>
                            </div>
                        </div>

                        {/* Main Preview Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-12 print:p-0 bg-neutral-200 dark:bg-neutral-900/50 custom-scrollbar">
                            <style jsx global>{`
                                @media print {
                                    body * { visibility: hidden; }
                                    #resume-content, #resume-content * { visibility: visible; }
                                    #resume-content {
                                        position: absolute;
                                        left: 0;
                                        top: 0;
                                        width: 100%;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        box-shadow: none !important;
                                    }
                                    @page { size: A4; margin: 0; }
                                }
                                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                            `}</style>

                            <div className="flex justify-center">
                                {selectedTemplate === 'minimalist' && (
                                    <MinimalistTemplate
                                        user={user}
                                        profile={profile}
                                        experiences={experiences}
                                        educations={educations}
                                        skills={skillsList}
                                    />
                                )}
                                {selectedTemplate === 'modern' && (
                                    <ModernTemplate
                                        user={user}
                                        profile={profile}
                                        experiences={experiences}
                                        educations={educations}
                                        skills={skillsList}
                                    />
                                )}
                                {selectedTemplate === 'classic' && (
                                    <ClassicTemplate
                                        user={user}
                                        profile={profile}
                                        experiences={experiences}
                                        educations={educations}
                                        skills={skillsList}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm group"
            >
                <FileText size={16} strokeWidth={1.25} className="group-hover:rotate-12 transition-transform" />
                <span>Générer mon CV PDF</span>
            </button>

            {mounted && createPortal(modalContent, document.body)}
        </>
    );
};
