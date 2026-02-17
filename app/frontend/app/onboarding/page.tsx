'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser, selectAuthLoading, selectError } from '@/src/features/auth/services/authSelectors';
import { completeOnboardingThunk } from '@/src/features/auth/services/authThunks';
import { authServices } from '@/src/features/auth/services/authApi';
import { Industry, Country, JobTitle, JobType } from '@/src/features/auth/services/authTypes';
import {
    ChevronRight,
    Check
} from 'lucide-react';
import { Spinner } from '@/src/components/ui/spinner';

export default function OnboardingPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const isLoading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectError);

    const [step, setStep] = useState(1);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [jobCatalog, setJobCatalog] = useState<JobTitle[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    const [formData, setFormData] = useState({
        headline: '',
        city: '',
        country: 'Bénin',
        country_code: 'BJ',
        company_name: '',
        job_title: '',
        job_type: 'FULL_TIME',
        start_date: ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user.has_onboarded) {
            router.push('/profile');
        }
    }, [user, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [indRes, countriesRes, jobRes, typesRes] = await Promise.all([
                    authServices.getIndustries(),
                    authServices.getCountries(),
                    authServices.getJobCatalog(),
                    authServices.getJobTypes()
                ]);

                if (indRes.success) setIndustries(indRes.data);
                if (countriesRes.success) setCountries(countriesRes.data);
                if (jobRes.success) setJobCatalog(jobRes.data);
                if (typesRes.success) setJobTypes(typesRes.data);
            } catch (err) {
                console.error("Failed to fetch onboarding data", err);
            }
        };
        fetchData();
    }, []);

    const handleNext = () => {
        if (step === 1 && selectedIndustry && formData.city) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        const finalData = {
            ...formData,
            industry_id: selectedIndustry,
            headline: formData.headline || industries.find(i => i.id === selectedIndustry)?.label || ''
        };
        const result = await dispatch(completeOnboardingThunk(finalData));
        if (completeOnboardingThunk.fulfilled.match(result)) {
            router.push('/profile');
        }
    };

    const filteredIndustries = industries.filter(i =>
        i.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentIndustry = industries.find(i => i.id === selectedIndustry);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 antialiased selection:bg-gray-100">
            <div className="max-w-md w-full">
                {/* Progress bar */}
                <div className="mb-12 flex gap-1">
                    <div className={`h-1 flex-1 transition-all duration-500 ${step >= 1 ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'}`} />
                    <div className={`h-1 flex-1 transition-all duration-500 ${step >= 2 ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'}`} />
                </div>

                <div className="space-y-12">
                    {step === 1 ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-1 duration-400">
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Secteur et localisation</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">Précisez votre domaine d'activité et votre ville actuelle.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2 relative">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Secteur d'activité</label>
                                    <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className={`w-full text-left px-5 py-4 border rounded-xl transition-all flex items-center justify-between bg-transparent ${isCategoryOpen
                                            ? 'border-[#0A66C2] ring-1 ring-[#0A66C2]'
                                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                                            }`}
                                    >
                                        <span className={`text-[15px] font-semibold ${currentIndustry ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                                            {currentIndustry ? currentIndustry.label : "Quel est votre domaine ?"}
                                        </span>
                                        <ChevronRight size={18} strokeWidth={1.5} className={`text-neutral-300 transition-transform ${isCategoryOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isCategoryOpen && (
                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Rechercher un secteur..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border-none rounded-lg px-3 py-2 outline-none text-sm font-medium"
                                                />
                                            </div>
                                            <div className="max-h-52 overflow-y-auto p-1">
                                                {filteredIndustries.map((ind) => (
                                                    <button
                                                        key={ind.id}
                                                        onClick={() => {
                                                            setSelectedIndustry(ind.id);
                                                            setIsCategoryOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${selectedIndustry === ind.id ? 'bg-[#0A66C2]/10 text-[#0A66C2]' : 'hover:bg-neutral-50'}`}
                                                    >
                                                        <span className="text-sm font-semibold">{ind.label}</span>
                                                        {selectedIndustry === ind.id && <Check size={14} strokeWidth={2.5} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Pays de résidence</label>
                                        <button
                                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                                            className="w-full text-left px-5 py-4 border border-neutral-200 dark:border-neutral-800 rounded-xl font-semibold text-neutral-900 dark:text-white flex items-center justify-between transition-colors hover:border-neutral-300 bg-transparent"
                                        >
                                            <span className="truncate text-[15px]">{formData.country}</span>
                                            <ChevronRight size={18} strokeWidth={1.5} className={`text-neutral-300 transition-transform ${isCountryOpen ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isCountryOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                                <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                                                    <input
                                                        type="text"
                                                        placeholder="Chercher un pays..."
                                                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm outline-none font-medium"
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="max-h-52 overflow-y-auto p-1">
                                                    {countries.filter(c => c.name_fr.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                                                        <button
                                                            key={c.code}
                                                            onClick={() => {
                                                                setFormData({ ...formData, country: c.name_fr, country_code: c.code });
                                                                setIsCountryOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 hover:bg-neutral-50 rounded-lg text-left text-sm font-semibold flex items-center gap-3 transition-colors"
                                                        >
                                                            <span>{c.flag_emoji}</span>
                                                            <span className="text-neutral-700 dark:text-neutral-300">{c.name_fr}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Ville actuelle</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Nantes"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full border border-neutral-200 dark:border-neutral-800 focus:border-[#0A66C2] rounded-xl px-5 py-4 outline-none font-semibold text-neutral-900 dark:text-white transition-colors bg-transparent text-[15px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!selectedIndustry || !formData.city}
                                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-4 rounded-xl font-bold text-[16px] transition-all disabled:opacity-30 active:scale-[0.98] shadow-sm"
                            >
                                Continuer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-1 duration-400">
                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Expérience professionnelle</h1>
                                <p className="text-neutral-500 dark:text-neutral-400 text-base leading-relaxed">Valorisez votre parcours pour attirer les meilleures opportunités.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Intitulé du poste</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Ex: Chef de Projet Digital"
                                                value={formData.job_title}
                                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value, headline: e.target.value })}
                                                className="w-full border border-neutral-200 dark:border-neutral-800 focus:border-[#0A66C2] rounded-xl px-5 py-4 outline-none font-semibold text-neutral-900 dark:text-white transition-colors bg-transparent text-[15px]"
                                            />
                                            {formData.job_title && jobCatalog.filter(j => j.title.toLowerCase().includes(formData.job_title.toLowerCase()) && j.title !== formData.job_title).length > 0 && (
                                                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                                    {jobCatalog
                                                        .filter(j => j.title.toLowerCase().includes(formData.job_title.toLowerCase()) && j.title !== formData.job_title)
                                                        .slice(0, 5)
                                                        .map(j => (
                                                            <button
                                                                key={j.id}
                                                                onClick={() => setFormData({ ...formData, job_title: j.title, headline: j.title })}
                                                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 font-semibold text-sm text-neutral-600 transition-colors"
                                                            >
                                                                {j.title}
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Organisation</label>
                                        <input
                                            type="text"
                                            placeholder="Nom de votre entreprise actuelle"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full border border-neutral-200 dark:border-neutral-800 focus:border-[#0A66C2] rounded-xl px-5 py-4 outline-none font-semibold text-neutral-900 dark:text-white transition-colors bg-transparent text-[15px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Nature du contrat</label>
                                        <div className="relative">
                                            <select
                                                value={formData.job_type || 'FULL_TIME'}
                                                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                                className="w-full border border-neutral-200 dark:border-neutral-800 focus:border-[#0A66C2] rounded-xl px-5 py-4 outline-none font-semibold text-neutral-900 dark:text-white appearance-none cursor-pointer bg-transparent text-[15px]"
                                            >
                                                {jobTypes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.label}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={18} strokeWidth={1.5} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Début de l'activité</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full border border-neutral-200 dark:border-neutral-800 focus:border-[#0A66C2] rounded-xl px-5 py-4 outline-none font-semibold text-neutral-900 dark:text-white cursor-pointer bg-transparent text-[15px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-600 text-[13px] font-medium text-center">{error}</p>
                            )}

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-4 rounded-xl font-bold text-[16px] transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-sm"
                                >
                                    {isLoading ? <Spinner size="sm" color="current" label="Finalisation..." /> : 'Publier mon profil'}
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-neutral-400 font-semibold text-sm hover:text-black transition-colors"
                                >
                                    Revenir à l'étape précédente
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-20 text-center border-t border-neutral-100 dark:border-neutral-900 pt-8">
                    <p className="text-[10px] font-bold tracking-widest text-neutral-300 dark:text-neutral-700 uppercase">Infrastructure sécurisée WorkNet Corporate</p>
                </div>
            </div>
        </div>
    );



}
