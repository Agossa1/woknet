"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { getMyCompaniesThunk, createCompanyThunk, deleteCompanyThunk } from '@/src/features/companies/services/companies-thunks';
import { selectMyCompanies, selectCompaniesLoading, selectCompaniesError } from '@/src/features/companies/services/companies-selectors';
import { Building2, Plus, Globe, ShieldCheck, Trash2, ArrowRight, ArrowLeft, LayoutGrid, List, Briefcase, Users, Megaphone, TrendingUp, Target, Lightbulb, Settings, FileText, ChevronDown, CreditCard, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CompaniesPage() {
    const dispatch = useAppDispatch();
    const companies = useAppSelector(selectMyCompanies);
    const isLoading = useAppSelector(selectCompaniesLoading);

    // Standard stroke for icons
    const iconStroke = 1.25;

    // UI state
    // Step 0: 'none' (Dashboard), Step 1: 'type-selection', Step 2: 'details'
    const [creationStep, setCreationStep] = useState<'none' | 'type-selection' | 'details'>('none');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '', // Acting as "Slogan"
        website_url: '',
        company_size: '',
        company_type: '',
        logo_url: '',
        banner_url: ''
    });

    // Industry Search State
    const [industrySearch, setIndustrySearch] = useState('');
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

    const INDUSTRIES = [
        "Technology", "Information Technology", "Computer Software", "Internet",
        "Marketing & Advertising", "Telecommunications", "Financial Services",
        "Banking", "Investment Management", "Insurance", "Accounting",
        "Management Consulting", "Real Estate", "Construction",
        "Automotive", "Transportation", "Logistics & Supply Chain",
        "Retail", "E-commerce", "Fashion", "Luxury Goods",
        "Consumer Goods", "Food & Beverages", "Hospitality",
        "Health, Wellness & Fitness", "Hospital & Health Care",
        "Pharmaceuticals", "Medical Devices", "Biotechnology",
        "Education Management", "Higher Education", "E-Learning",
        "Research", "Government Administration", "Non-profit Organization Management",
        "Media Production", "Entertainment", "Music", "Publishing",
        "Design", "Architecture & Planning", "Civil Engineering",
        "Energy", "Oil & Energy", "Renewables & Environment",
        "Utilities", "Mining & Metals", "Chemicals",
        "Manufacturing", "Electrical/Electronic Manufacturing",
        "Mechanical or Industrial Engineering", "Aviation & Aerospace",
        "Defense & Space", "Security & Investigations",
        "Legal Services", "Law Practice",
        "Human Resources", "Staffing and Recruiting",
        "Professional Training & Coaching",
        "Event Services", "Public Relations and Communications",
        "Translation and Localization", "Writing and Editing",
        "Photography", "Fine Art", "Arts and Crafts",
        "Sporting Goods", "Sports", "Gambling & Casinos",
        "Computer Games", "Animation",
        "Computer Hardware", "Computer Networking",
        "Nanotechnology", "Semiconductors",
        "Agriculture", "Farming", "Fishery", "Ranching", "Dairy",
        "Veterinary", "Environmental Services",
        "Maritime", "Import and Export", "International Trade and Development",
        "Civic & Social Organization", "Fund-Raising", "Philanthropy",
        "Think Tanks", "Political Organization",
        "Religious Institutions",
        "Libraries", "Museums and Institutions"
    ].sort();

    useEffect(() => {
        dispatch(getMyCompaniesThunk());
    }, [dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanWebsiteUrl = (url: string) => {
            if (!url) return undefined;
            const trimmed = url.trim();
            if (trimmed === '' || trimmed === 'https://' || trimmed === 'http://') return undefined;
            if (!/^https?:\/\//i.test(trimmed)) {
                return 'https://' + trimmed;
            }
            return trimmed;
        };

        const payload = {
            ...formData,
            website_url: cleanWebsiteUrl(formData.website_url)
        };

        const res = await dispatch(createCompanyThunk(payload));
        if (createCompanyThunk.fulfilled.match(res)) {
            const createdCompany = res.payload;
            setCreationStep('none');
            setFormData({ name: '', slug: '', description: '', website_url: '', company_size: '', company_type: '', logo_url: '', banner_url: '' });
            // Redirection vers la page de détail de l'entreprise
            if (createdCompany?.slug) {
                window.location.href = `/companies/${createdCompany.slug}`;
            }
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
            dispatch(deleteCompanyThunk(id));
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Wizard: Step 1 - Type Selection
    if (creationStep === 'type-selection') {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center pt-24 px-6 font-sans">
                <button
                    onClick={() => setCreationStep('none')}
                    className="absolute top-8 right-8 p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                    <Plus size={24} strokeWidth={iconStroke} className="rotate-45" />
                </button>

                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-3 font-inter">Créer une Page Entreprise</h1>
                <p className="text-sm text-neutral-500 mb-12 text-center max-w-md leading-relaxed">Boostez votre visibilité et recrutez des talents en créant un espace dédié à votre organisation.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                    <button
                        onClick={() => setCreationStep('details')}
                        className="group bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#0A66C2] transition-all text-left shadow-sm"
                    >
                        <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-center mb-6 border border-neutral-100 dark:border-neutral-700">
                            <Building2 size={24} strokeWidth={iconStroke} className="text-neutral-400 group-hover:text-[#0A66C2] transition-colors" />
                        </div>
                        <h3 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-2 font-inter">Société ou Marque</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed font-medium">Pour les entreprises de toutes tailles souhaitant gérer leur présence et leurs offres d'emploi.</p>
                    </button>

                    <button
                        onClick={() => setCreationStep('details')}
                        className="group bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#0A66C2] transition-all text-left shadow-sm"
                    >
                        <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-center mb-6 border border-neutral-100 dark:border-neutral-700">
                            <Briefcase size={24} strokeWidth={iconStroke} className="text-neutral-400 group-hover:text-[#0A66C2] transition-colors" />
                        </div>
                        <h3 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-2 font-inter">Institution d'Enseignement</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed font-medium">Écoles, centres de formation et universités souhaitant connecter leurs étudiants et alumnis.</p>
                    </button>
                </div>
            </div>
        );
    }

    // Wizard: Step 2 - Form
    if (creationStep === 'details') {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans">
                {/* Navbar */}
                <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-8 h-14 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h2 className="font-semibold text-sm text-neutral-700 dark:text-neutral-200 font-inter">Finalisation de la page</h2>
                    <button onClick={() => setCreationStep('none')} className="text-xs font-semibold text-[#0A66C2] hover:underline">Annuler</button>
                </div>

                <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Inputs */}
                    <div className="space-y-10">
                        <div>
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2 font-inter tracking-tight">Identité de votre organisation</h1>
                            <p className="text-sm text-neutral-500 font-medium">Les champs marqués d'un astérisque (*) sont requis pour la publication.</p>
                        </div>

                        <div className="space-y-6 bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Nom commercial *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setFormData({ ...formData, name, slug: generateSlug(name) });
                                    }}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                    placeholder="Ex: WorkNet Solutions"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Identifiant de page *</label>
                                <div className="flex rounded border border-neutral-300 dark:border-neutral-700 overflow-hidden focus-within:ring-1 focus-within:ring-[#0A66C2] focus-within:border-[#0A66C2] transition-all">
                                    <span className="bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5 text-xs text-neutral-500 font-medium border-r border-neutral-200 dark:border-neutral-700">worknet.com/companies/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        className="flex-1 bg-transparent px-4 py-2.5 outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Logo de l'entreprise</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                                        {formData.logo_url ? (
                                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={32} strokeWidth={iconStroke} className="text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, logo_url: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="inline-block px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                                        >
                                            Choisir une image
                                        </label>
                                        <p className="text-[10px] text-neutral-500 mt-2 font-medium">Format carré recommandé (500x500px minimum)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Bannière de couverture</label>
                                <div className="space-y-3">
                                    <div className="w-full h-32 rounded bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                        {formData.banner_url ? (
                                            <img src={formData.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <ImageIcon size={32} strokeWidth={iconStroke} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData({ ...formData, banner_url: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="banner-upload"
                                        />
                                        <label
                                            htmlFor="banner-upload"
                                            className="inline-block px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                                        >
                                            Choisir une image
                                        </label>
                                        <p className="text-[10px] text-neutral-500 mt-2 font-medium">Format panoramique recommandé (1584x396px minimum)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Site internet</label>
                                <input
                                    type="text"
                                    value={formData.website_url}
                                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                    placeholder="https://votre-site.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Taille de l'organisation *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.company_size}
                                            onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="" disabled>Nombre de salariés</option>
                                            <option value="0-1">0-1 salarié</option>
                                            <option value="2-10">2-10 salariés</option>
                                            <option value="11-50">11-50 salariés</option>
                                            <option value="51-200">51-200 salariés</option>
                                            <option value="201-500">201-500 salariés</option>
                                            <option value="501-1000">501-1,000 salariés</option>
                                            <option value="1001-5000">1,001-5,000 salariés</option>
                                            <option value="10000+">10,000+ salariés</option>
                                        </select>
                                        <ChevronDown size={16} strokeWidth={iconStroke} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Secteur d'activité *</label>
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Rechercher un secteur..."
                                                value={formData.company_type}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, company_type: e.target.value });
                                                    setIndustrySearch(e.target.value);
                                                    setIsIndustryDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsIndustryDropdownOpen(true)}
                                                className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                            />
                                            <ChevronDown size={16} strokeWidth={iconStroke} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                        </div>

                                        {isIndustryDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {INDUSTRIES.filter(ind => ind.toLowerCase().includes((formData.company_type || "").toLowerCase())).length > 0 ? (
                                                    INDUSTRIES.filter(ind => ind.toLowerCase().includes((formData.company_type || "").toLowerCase())).map((industry) => (
                                                        <button
                                                            key={industry}
                                                            onClick={() => {
                                                                setFormData({ ...formData, company_type: industry });
                                                                setIndustrySearch(industry);
                                                                setIsIndustryDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                                                        >
                                                            {industry}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-sm text-neutral-500 italic">Aucun résultat</div>
                                                )}
                                            </div>
                                        )}
                                        {/* Overlay to close dropdown when clicking outside */}
                                        {isIndustryDropdownOpen && (
                                            <div className="fixed inset-0 z-40" onClick={() => setIsIndustryDropdownOpen(false)} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Slogan</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium resize-none h-24"
                                    placeholder="Ex: Accélérer l'innovation durable..."
                                />
                            </div>

                            <div className="pt-4 flex items-start gap-3">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0A66C2] focus:ring-[#0A66C2]" required />
                                <p className="text-[11px] text-neutral-500 leading-normal">Je confirme être le représentant légal de cette entité et dispose des droits nécessaires pour administrer sa présence sur WorkNet.</p>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={isLoading || !formData.name || !formData.slug}
                                className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4 shadow-sm"
                            >
                                {isLoading ? "Initialisation..." : "Créer la page"}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview (Minimalist) */}
                    <div className="lg:sticky lg:top-32 hidden lg:block">
                        <h3 className="text-xs font-semibold text-neutral-400 mb-4 tracking-tight">Rendu en temps réel</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden min-h-[300px]">
                            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                                {formData.banner_url ? (
                                    <img src={formData.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                                ) : null}
                                <div className="absolute -bottom-10 left-8 w-24 h-24 bg-white dark:bg-neutral-900 p-1 rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md">
                                    <div className="w-full h-full bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-center overflow-hidden">
                                        {formData.logo_url ? (
                                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={32} strokeWidth={iconStroke} className="text-neutral-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-12 px-8 pb-10">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 font-inter">
                                    {formData.name || "Ma Structure"}
                                </h2>
                                <p className="text-sm text-neutral-500 mb-4 font-medium italic">
                                    {formData.description || "Votre slogan professionnel apparaîtra ici."}
                                </p>
                                <div className="text-[11px] text-neutral-400 mb-8 flex items-center gap-1.5 font-medium">
                                    <span className="text-[#057642]">Secteur sélectionné</span> • <span>Bénéfice membre</span>
                                </div>
                                <button className="flex items-center gap-2 bg-[#0A66C2] text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                    <Plus size={14} strokeWidth={2.5} />
                                    Suivre
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default View: Dashboard
    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black p-6 md:p-10 font-sans antialiased text-neutral-800">
            <div className="max-w-5xl mx-auto w-full">

                {/* Main Column */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-300/60 dark:border-neutral-800">
                        <div>
                            <Link
                                href="/feed"
                                className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-2"
                            >
                                <ArrowLeft size={14} />
                                <span>Retour à l'accueil</span>
                            </Link>
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">Centre de gestion des entreprises</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 font-medium">Administrez vos pages, analysez les performances et recrutez.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {companies.length > 0 && (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded p-1 flex items-center shadow-sm">
                                    <ViewBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={<LayoutGrid size={16} strokeWidth={iconStroke} />} />
                                    <ViewBtn active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={<List size={16} strokeWidth={iconStroke} />} />
                                </div>
                            )}
                            <button
                                onClick={() => setCreationStep('type-selection')}
                                className="bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 rounded font-semibold transition-all flex items-center gap-2 text-[13px] shadow-sm"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Nouvelle page
                            </button>
                        </div>
                    </div>

                    {/* Content List */}
                    {isLoading && companies.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 rounded-lg border border-neutral-200 bg-white/50 animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                            <Building2 size={40} strokeWidth={1} className="text-neutral-200 mx-auto mb-6" />
                            <h3 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-2 font-inter">Aucune organisation enregistrée</h3>
                            <p className="text-xs text-neutral-500 mb-10 max-w-[280px] mx-auto font-medium">Prenez le contrôle de votre présence professionnelle dès aujourd'hui.</p>
                            <button
                                onClick={() => setCreationStep('type-selection')}
                                className="text-[#0A66C2] font-semibold hover:underline text-sm"
                            >
                                + Enregistrer ma structure
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {companies.map(company => (
                                <div
                                    key={company.id}
                                    className={`group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#0A66C2] transition-colors duration-300 shadow-sm ${viewMode === 'grid' ? 'rounded-lg p-6 flex flex-col' : 'rounded p-4 flex items-center gap-6'}`}
                                >
                                    <div className={`flex-shrink-0 bg-neutral-50 dark:bg-neutral-800 rounded flex items-center justify-center border border-neutral-100 dark:border-neutral-700 overflow-hidden ${viewMode === 'grid' ? 'w-12 h-12 mb-5' : 'w-10 h-10'}`}>
                                        {company.logo_url ? (
                                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity duration-300" />
                                        ) : (
                                            <Building2 size={24} strokeWidth={iconStroke} className="text-neutral-300 group-hover:text-[#0A66C2] transition-colors" />
                                        )}
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="text-[15px] font-semibold text-neutral-800 dark:text-white truncate font-inter">
                                                {company.name}
                                            </h3>
                                            {company.is_verified && <ShieldCheck size={14} strokeWidth={iconStroke} className="text-[#0A66C2] shrink-0 fill-[#0A66C2]/5" />}
                                        </div>
                                        <div className="text-[11px] text-neutral-400 flex items-center gap-3 mb-4 font-medium uppercase tracking-tighter">
                                            <span>/{company.slug}</span>
                                        </div>
                                        {viewMode === 'grid' && (
                                            <p className="text-[11px] text-neutral-500 line-clamp-2 mb-6 h-8 leading-normal font-medium italic">
                                                {company.description || "Aucune description renseignée."}
                                            </p>
                                        )}
                                    </div>

                                    <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800' : 'ml-auto'}`}>
                                        <Link
                                            href={`/companies/${company.slug}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded text-xs font-semibold transition shadow-sm"
                                        >
                                            Administrer
                                            <ArrowRight size={12} strokeWidth={2.5} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(company.id)}
                                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={15} strokeWidth={iconStroke} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
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

function ViewBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`p-1.5 rounded transition-all ${active ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'}`}
        >
            {icon}
        </button>
    );
}
