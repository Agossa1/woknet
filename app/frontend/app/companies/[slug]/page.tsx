"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { companiesApi } from '@/src/features/companies/services/companies-api';
import { Company } from '@/src/features/companies/services/companies-types';
import {
    Building2, Globe, ShieldCheck, ArrowLeft, Settings, Users,
    Layout, Briefcase, Plus, List, Menu, X, CheckCircle,
    Eye, BarChart2, Mail, Pencil, Share2,
    Search, Bell, ChevronRight, MoreHorizontal,
    ExternalLink, Video, Image as ImageIcon, FileText, Calendar,
    Shield, UserCheck, Inbox, AtSign, Target, Lightbulb, Megaphone, TrendingUp, CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { selectProfileUser } from '@/src/features/profiles/services/profile-selectors';
import CreatePostModal from '@/src/components/feed/create-post-modal';
import { fetchCompanyPostsThunk } from '@/src/features/posts/services/posts-thunks';
import { selectCompanyPosts } from '@/src/features/posts/services/posts-slice';
import PostCard from '@/src/components/feed/post-card';
import EditCompanyModal from '@/src/features/companies/components/edit-company-modal';

export default function CompanyDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('publications');
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectAuthUser);
    const profileUser = useAppSelector(selectProfileUser);
    const companyPosts = useAppSelector(state => selectCompanyPosts(state, company?.id));

    // Minimal stroke for all icons
    const iconStroke = 1.25;

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await companiesApi.getCompanyBySlug(slug as string);
                setCompany(response.data);
                // Fetch posts once company is loaded
                if (response.data?.id) {
                    await dispatch(fetchCompanyPostsThunk(response.data.id));
                }
            } catch (err: any) {
                setError(err.userMessage || "Entreprise non trouvée");
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchCompany();
    }, [slug, dispatch]);

    const isAdmin = company && profileUser?.user_id === company.owner_id;

    if (isLoading) return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
            <div className="w-5 h-5 border border-neutral-300 border-t-[#0A66C2] rounded-full animate-spin" />
        </div>
    );

    if (error || !company) return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Espace restreint ou indisponible</h1>
            <Link href="/companies" className="text-[#0A66C2] font-semibold hover:underline flex items-center gap-2 mt-4 text-sm">
                <ArrowLeft size={16} strokeWidth={iconStroke} /> Retour au gestionnaire
            </Link>
        </div>
    );

    // --- PUBLIC VIEW vs ADMIN VIEW ---

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans text-neutral-800 antialiased">

            {/* Header (Different for Public vs Admin) */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-[1128px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/companies"
                            className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-bold uppercase tracking-tight group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour aux entreprises</span>
                        </Link>
                        <div className="h-4 w-px bg-neutral-100 dark:bg-neutral-800" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                                {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : <Building2 size={14} className="text-neutral-400" />}
                            </div>
                            <span className="font-bold text-xs truncate max-w-[200px] text-neutral-900 dark:text-neutral-200 uppercase tracking-tighter">{company.name}</span>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <button className="text-[11px] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Aperçu public</button>
                                <button
                                    onClick={() => setIsCreatePostModalOpen(true)}
                                    className="px-5 py-1.5 bg-[#0A66C2] text-white text-[11px] font-semibold rounded hover:bg-[#004182] transition-colors shadow-sm"
                                >
                                    Créer un post
                                </button>
                            </div>
                            <button className="md:hidden p-2 text-neutral-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X size={20} strokeWidth={iconStroke} /> : <Menu size={20} strokeWidth={iconStroke} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`max-w-[1128px] mx-auto px-4 py-6 grid gap-6 items-start ${isAdmin ? 'grid-cols-1 lg:grid-cols-[240px_1fr]' : 'grid-cols-1'}`}>

                {/* Sidebar Navigation (ADMIN ONLY) */}
                {isAdmin && (
                    <aside className={`
                        lg:sticky lg:top-16 space-y-4
                        ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}
                    `}>
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <nav className="p-1.5">
                                <SidebarLink icon={<Layout size={18} strokeWidth={iconStroke} />} label="Tableau de bord" active />
                                <SidebarLink icon={<FileText size={18} strokeWidth={iconStroke} />} label="Contenu" />
                                <SidebarLink icon={<BarChart2 size={18} strokeWidth={iconStroke} />} label="Statistiques" />
                                <SidebarLink icon={<UserCheck size={18} strokeWidth={iconStroke} />} label="Membres" />
                                <SidebarLink icon={<Inbox size={18} strokeWidth={iconStroke} />} label="Messagerie" />
                                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2 mx-2" />
                                <SidebarLink icon={<Settings size={18} strokeWidth={iconStroke} />} label="Paramètres" />
                            </nav>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-white mb-5 font-inter">Services Premium</h2>
                            <nav className="space-y-1">
                                <QuickLink href="/jobs/create" icon={<Briefcase size={16} strokeWidth={iconStroke} />} title="Gestion recrutement" />
                                <QuickLink href="/search?type=people" icon={<Target size={16} strokeWidth={iconStroke} />} title="Ciblage commercial" />
                                <QuickLink href="/workspaces" icon={<Users size={16} strokeWidth={iconStroke} />} title="Canaux collaboratifs" />
                                <QuickLink href="/ads" icon={<Megaphone size={16} strokeWidth={iconStroke} />} title="Promotion régie" />
                                <QuickLink href="/learning" icon={<Lightbulb size={16} strokeWidth={iconStroke} />} title="Centre de formation" />
                            </nav>
                            <div className="mt-8 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                                <Link href="/settings/billing" className="text-[11px] font-semibold text-[#0A66C2] hover:underline flex items-center gap-2">
                                    <CreditCard size={14} strokeWidth={iconStroke} />
                                    Détails de facturation
                                </Link>
                            </div>
                        </div>

                        <div className="bg-[#1C1C1C] dark:bg-neutral-900 rounded-lg p-6 text-white shadow-lg border border-neutral-800">
                            <div className="flex items-center gap-2 mb-4 text-[#FFB020]">
                                <TrendingUp size={20} strokeWidth={2} />
                                <span className="text-[10px] font-bold tracking-widest">PREMIUM</span>
                            </div>
                            <h3 className="font-semibold text-sm mb-2 font-inter">Analyse prédictive</h3>
                            <p className="text-neutral-400 text-[11px] mb-6 leading-relaxed font-medium">Accédez aux données comportementales de votre audience pour ajuster vos campagnes.</p>
                            <button className="w-full py-2 bg-white text-black rounded text-xs font-bold hover:bg-neutral-100 transition shadow-sm">
                                Essai de 30 jours
                            </button>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="space-y-6 flex-1 min-w-0">

                    {/* Identity Plate */}
                    <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                        <div className="h-40 bg-neutral-100 dark:bg-neutral-800 relative">
                            {company.banner_url && <img src={company.banner_url} className="w-full h-full object-cover" />}
                            <div className="absolute -bottom-12 left-10 w-28 h-28 bg-white dark:bg-neutral-900 p-1 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md">
                                <div className="w-full h-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                    {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : <Building2 size={40} strokeWidth={iconStroke} className="text-neutral-300" />}
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-8 px-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2.5 tracking-tight font-inter">
                                        {company.name}
                                        <Shield size={20} strokeWidth={iconStroke} className="text-[#0A66C2]" />
                                    </h1>
                                    <p className="text-sm text-neutral-500 font-medium">
                                        {company.company_type || "Entreprise"} • {company.company_size || "Taille inconnue"} • {isAdmin ? "Panneau d'administration" : "0 abonné"}
                                    </p>
                                    {!isAdmin && (
                                        <div className="flex gap-2 pt-3">
                                            <button className="px-6 py-1.5 bg-[#0A66C2] text-white text-[14px] font-semibold rounded-full hover:bg-[#004182] transition shadow-sm flex items-center gap-2">
                                                <Plus size={16} /> Suivre
                                            </button>
                                            <button className="px-6 py-1.5 border border-[#0A66C2] text-[#0A66C2] text-[14px] font-semibold rounded-full hover:bg-[#0A66C2]/10 transition shadow-sm">
                                                Visiter le site web
                                            </button>
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <div className="flex gap-5 pt-3">
                                            <MiniStat label="Visiteurs" value="0" />
                                            <MiniStat label="Abonnés" value="0" />
                                        </div>
                                    )}
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="px-5 py-2 bg-[#0A66C2] text-white text-[13px] font-semibold rounded-full hover:bg-[#004182] transition shadow-sm"
                                        >
                                            Modifier la page
                                        </button>
                                        <button className="p-2 border border-neutral-300 dark:border-neutral-700 rounded-full hover:bg-neutral-50 text-neutral-500"><MoreHorizontal size={20} strokeWidth={iconStroke} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Two-Column Layout for Feed and Sidebar */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start">

                        {/* Left Column: Feed (Narrow for feed harmony) */}
                        <div className="w-full lg:max-w-[555px] space-y-4">
                            {/* Tab Navigation */}
                            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-1 font-inter">
                                        {isAdmin ? "Contenu du fil d'actualité" : "Dernières actualités"}
                                    </h2>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        {isAdmin ? "Centralisez vos publications organiques et promotions ciblées." : "Découvrez les dernières publications de l'entreprise."}
                                    </p>
                                </div>
                                <div className="flex border-t border-neutral-100 dark:border-neutral-800 px-6">
                                    <TabItem label="Publications" active={activeTab === 'publications'} onClick={() => setActiveTab('publications')} />
                                    <TabItem label="À propos" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
                                </div>
                            </section>

                            {/* Compose Post Bar (ADMIN ONLY) */}
                            {isAdmin && (
                                <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : <Building2 size={20} strokeWidth={iconStroke} className="text-neutral-300" />}
                                        </div>
                                        <button
                                            onClick={() => setIsCreatePostModalOpen(true)}
                                            className="flex-grow h-11 px-5 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/30 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-left font-medium text-neutral-500 transition-all text-[13px]"
                                        >
                                            Commencer une publication...
                                        </button>
                                    </div>
                                    <div className="flex justify-between mt-4 px-3">
                                        <ActionPoint onClick={() => setIsCreatePostModalOpen(true)} icon={<Video size={18} strokeWidth={iconStroke} />} label="Vidéo" color="#057642" />
                                        <ActionPoint onClick={() => setIsCreatePostModalOpen(true)} icon={<ImageIcon size={18} strokeWidth={iconStroke} />} label="Média" color="#0A66C2" />
                                        <ActionPoint onClick={() => setIsCreatePostModalOpen(true)} icon={<Calendar size={18} strokeWidth={iconStroke} />} label="Événement" color="#915907" />
                                        <ActionPoint onClick={() => setIsCreatePostModalOpen(true)} icon={<FileText size={18} strokeWidth={iconStroke} />} label="Article" color="#C83733" />
                                    </div>
                                </section>
                            )}

                            {/* Posts List or Empty State */}
                            {companyPosts && companyPosts.length > 0 ? (
                                <div className="space-y-4">
                                    {companyPosts.map(post => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 py-20 px-8 shadow-sm flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 border border-neutral-100 dark:border-neutral-700">
                                        <Share2 size={24} strokeWidth={iconStroke} className="text-neutral-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 font-inter">Aucun contenu récent</h3>
                                    <p className="text-xs text-neutral-500 max-w-[280px] mb-8 leading-relaxed">
                                        {isAdmin
                                            ? "Publiez des actualités régulièrement pour augmenter votre portée organique de 20%."
                                            : "Cette entreprise n'a pas encore publié de contenu."
                                        }
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setIsCreatePostModalOpen(true)}
                                            className="flex items-center gap-2 px-8 py-2 border-2 border-[#0A66C2] text-[#0A66C2] font-semibold rounded-full hover:bg-[#0A66C2]/5 transition-all text-[13px]"
                                        >
                                            <Plus size={16} strokeWidth={2} />
                                            Créer un post
                                        </button>
                                    )}
                                </section>
                            )}
                        </div>

                        {/* Right Column: Information Sidebars */}
                        <aside className="hidden lg:flex flex-col flex-1 min-w-[300px] gap-4">
                            {/* About Widget */}
                            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                                <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4">À propos</h3>
                                <div className="space-y-4">
                                    <p className="text-[12px] text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-4">
                                        {company.description || "Aucune description fournie pour le moment."}
                                    </p>
                                    <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <InfoItem icon={<Globe size={14} />} label="Site web" value={company.website_url || "Non renseigné"} isLink />
                                        <InfoItem icon={<Building2 size={14} />} label="Secteur" value={company.company_type || "Télécommunications"} />
                                        <InfoItem icon={<Users size={14} />} label="Taille" value={company.company_size || "100-500 employés"} />
                                        <InfoItem icon={<Target size={14} />} label="Siège" value={"Non renseigné"} />
                                    </div>
                                    <button onClick={() => setActiveTab('about')} className="w-full mt-2 py-1.5 text-[12px] font-semibold text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md transition-colors border border-[#0A66C2]/20">
                                        Voir tous les détails
                                    </button>
                                </div>
                            </div>

                            {/* Similar Companies Mockup */}
                            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                                <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4 italic">Pages similaires</h3>
                                <div className="space-y-5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 items-center group cursor-pointer">
                                            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                                <Building2 size={16} className="text-neutral-300" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-[12px] font-semibold text-neutral-800 dark:text-white group-hover:text-[#0A66C2] truncate transition-colors">Entreprise Partenaire {i}</p>
                                                <p className="text-[11px] text-neutral-500 truncate">Secteur Technologique</p>
                                            </div>
                                            <Plus size={14} className="text-neutral-400 hover:text-[#0A66C2]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>

                    </div>
                </main>
            </div>

            {isAdmin && company && (
                <CreatePostModal
                    isOpen={isCreatePostModalOpen}
                    onClose={() => setIsCreatePostModalOpen(false)}
                    userAvatar={company.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${company.name}`}
                    userName={company.name}
                    companyId={company.id}
                />
            )}

            {isAdmin && company && (
                <EditCompanyModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    company={company}
                    onSuccess={(updated) => setCompany(updated)}
                />
            )}
        </div>
    );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    const iconStroke = 1.25;
    return (
        <button className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium transition-all
            ${active
                ? 'bg-neutral-50 dark:bg-neutral-800 text-[#0A66C2] font-semibold underline underline-offset-4 decoration-2'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white'
            }
        `}>
            {icon}
            <span className="flex-grow text-left">{label}</span>
        </button>
    );
}

function MiniStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{value}</span>
            <span className="text-[11px] font-medium text-neutral-400">{label}</span>
        </div>
    );
}

function TabItem({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-4 text-[12px] font-semibold transition-all relative
                ${active ? 'text-[#0A66C2]' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}
            `}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A66C2]" />}
        </button>
    );
}

function ActionPoint({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded transition-colors group">
            <span style={{ color }}>{icon}</span>
            <span className="text-[12px] font-semibold text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white">{label}</span>
        </button>
    );
}

function QuickLink({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 p-2.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
            <div className="text-neutral-400 group-hover:text-[#0A66C2] transition-colors">
                {icon}
            </div>
            <div className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {title}
            </div>
        </Link>
    );
}

function InfoItem({ icon, label, value, isLink = false }: { icon: React.ReactNode, label: string, value: string, isLink?: boolean }) {
    return (
        <div className="flex items-start gap-3 group">
            <span className="text-neutral-400 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight leading-none mb-1">{label}</p>
                {isLink ? (
                    <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold text-[#0A66C2] hover:underline truncate block">
                        {value}
                    </a>
                ) : (
                    <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-200 truncate">{value}</p>
                )}
            </div>
        </div>
    );
}
