"use client";

import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, Image as ImageIcon, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Company } from '../services/companies-types';
import { useAppDispatch } from '@/src/store/hooks';
import { updateCompanyThunk } from '../services/companies-thunks';

interface EditCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company;
    onSuccess?: (updatedCompany: Company) => void;
}

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

export default function EditCompanyModal({ isOpen, onClose, company, onSuccess }: EditCompanyModalProps) {
    const dispatch = useAppDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: company.name,
        slug: company.slug,
        description: company.description || '',
        website_url: company.website_url || '',
        company_size: company.company_size || '',
        company_type: company.company_type || '',
        logo_url: company.logo_url || '',
        banner_url: company.banner_url || ''
    });

    const iconStroke = 1.25;

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: company.name,
                slug: company.slug,
                description: company.description || '',
                website_url: company.website_url || '',
                company_size: company.company_size || '',
                company_type: company.company_type || '',
                logo_url: company.logo_url || '',
                banner_url: company.banner_url || ''
            });
        }
    }, [isOpen, company]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

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

        try {
            const updatedCompany = await dispatch(updateCompanyThunk({ id: company.id, dto: payload })).unwrap();
            if (onSuccess) onSuccess(updatedCompany);
            onClose();
        } catch (error) {
            console.error("Failed to update company:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white font-inter">Modifier la page entreprise</h2>
                        <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-tight">Mettez à jour les informations de votre organisation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400">
                        <X size={20} strokeWidth={iconStroke} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-company-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Nom de l'entreprise *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Slogan (Description courte)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium resize-none h-20"
                                        placeholder="Décrivez votre entreprise en quelques mots..."
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Site internet</label>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="text"
                                            value={formData.website_url}
                                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Taille de l'organisation</label>
                                    <div className="relative">
                                        <select
                                            value={formData.company_size}
                                            onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="">Sélectionner une taille</option>
                                            <option value="0-1">0-1 salarié</option>
                                            <option value="2-10">2-10 salariés</option>
                                            <option value="11-50">11-50 salariés</option>
                                            <option value="51-200">51-200 salariés</option>
                                            <option value="201-500">201-500 salariés</option>
                                            <option value="501-1000">501-1,000 salariés</option>
                                            <option value="1001-5000">1,001-5,000 salariés</option>
                                            <option value="10000+">10,000+ salariés</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Secteur d'activité</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.company_type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, company_type: e.target.value });
                                            setIsIndustryDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsIndustryDropdownOpen(true)}
                                        className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                        placeholder="Rechercher un secteur..."
                                    />
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                </div>

                                {isIndustryDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsIndustryDropdownOpen(false)} />
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {INDUSTRIES.filter(ind => ind.toLowerCase().includes(formData.company_type.toLowerCase())).map((industry) => (
                                                <button
                                                    key={industry}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, company_type: industry });
                                                        setIsIndustryDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                                                >
                                                    {industry}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Visual Assets (Right Column) */}
                        <div className="space-y-6 bg-neutral-50/50 dark:bg-neutral-800/30 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            {/* Logo */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Logo</label>
                                <div className="relative w-24 h-24 mx-auto group">
                                    <div className="w-full h-full rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shadow-inner">
                                        {formData.logo_url ? (
                                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={32} strokeWidth={iconStroke} className="text-neutral-200" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'logo_url')}
                                        className="hidden"
                                        id="logo-upload-modal"
                                    />
                                    <label
                                        htmlFor="logo-upload-modal"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                                    >
                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                            <ImageIcon size={18} />
                                        </div>
                                    </label>
                                </div>
                                <p className="text-[10px] text-center text-neutral-400 font-medium leading-tight">Cliquer pour modifier (Carré recommandé)</p>
                            </div>

                            {/* Banner */}
                            <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Bannière</label>
                                <div className="relative w-full h-24 group">
                                    <div className="w-full h-full rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shadow-inner">
                                        {formData.banner_url ? (
                                            <img src={formData.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={24} strokeWidth={iconStroke} className="text-neutral-200" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'banner_url')}
                                        className="hidden"
                                        id="banner-upload-modal"
                                    />
                                    <label
                                        htmlFor="banner-upload-modal"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                                    >
                                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                            <ImageIcon size={18} />
                                        </div>
                                    </label>
                                </div>
                                <p className="text-[10px] text-center text-neutral-400 font-medium leading-tight">Format paysage panoramique</p>
                            </div>

                            {/* Verification Badge Placeholder */}
                            <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between opacity-50">
                                <span className="text-[11px] font-semibold text-neutral-500">Statut de vérification</span>
                                <div className="flex items-center gap-1.5 text-[#0A66C2]">
                                    <span className="text-[10px] font-bold">ACTIF</span>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="edit-company-form"
                        disabled={isSubmitting || !formData.name}
                        className="px-8 py-2 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            "Enregistrer les modifications"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
