'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronRight,
    ArrowRight,
    Shield,
    Zap,
    Globe,
    Users,
    Lock,
    Target,
    BarChart3,
    CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-gray-100 dark:selection:bg-gray-900 text-gray-900 dark:text-white antialiased">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                            <span className="text-white dark:text-black font-black text-lg">W</span>
                        </div>
                        <span className="font-bold text-xl tracking-tighter">WorkNet</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                        <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Système</a>
                        <a href="#security" className="hover:text-black dark:hover:text-white transition-colors">Sécurité</a>
                        <a href="#vision" className="hover:text-black dark:hover:text-white transition-colors">Vision</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/sign-in" className="hidden sm:block text-xs font-bold hover:text-gray-500 transition-colors">
                            Connexion
                        </Link>
                        <Link href="/auth/sign-up" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-xs font-bold transition-all hover:opacity-80">
                            Rejoindre
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="relative pt-40 pb-20">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expertise Vérifiée</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900 dark:text-white">
                                L'Expertise <br />
                                <span className="text-gray-400">Collaborative.</span>
                            </h1>

                            <p className="max-w-md text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                Une infrastructure souveraine et performante, réservée aux leaders de l'industrie numérique.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link href="/auth/sign-up" className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 group">
                                Commencer
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex -space-x-2 items-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black overflow-hidden bg-gray-100 italic">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=expert${i}`} alt="Expert" />
                                    </div>
                                ))}
                                <span className="ml-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">+5k experts</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-700 hover:shadow-2xl">
                            <img
                                src="/images/hero.png"
                                alt="Dashboard"
                                className="w-full h-auto grayscale transition-all duration-700 hover:grayscale-0"
                            />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <Target className="text-gray-400" size={20} />
                                <p className="text-xl font-black text-gray-900 dark:text-white">99.4%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Trust Bar */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-wrap justify-between items-center gap-8 opacity-20 grayscale">
                    {['Google', 'Microsoft', 'NVIDIA', 'Stripe', 'Tesla'].map((brand) => (
                        <span key={brand} className="text-sm font-black tracking-widest uppercase">{brand}</span>
                    ))}
                </div>
            </div>

            {/* Features */}
            <section id="features" className="py-32 border-t border-gray-50 dark:border-gray-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                            {
                                icon: <Shield size={24} />,
                                title: "Souveraineté",
                                desc: "Infrastructure décentralisée et chiffrement asymétrique."
                            },
                            {
                                icon: <Zap size={24} />,
                                title: "Performance",
                                desc: "Latence réduite au minimum. Réponse en moins de 100ms."
                            },
                            {
                                icon: <Users size={24} />,
                                title: "Exclusivité",
                                desc: "Chaque membre est vérifié par nos experts métiers."
                            }
                        ].map((f, i) => (
                            <div key={i} className="space-y-6">
                                <div className="text-gray-400">{f.icon}</div>
                                <h3 className="text-lg font-bold tracking-tight uppercase">{f.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-xs">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto border border-gray-100 dark:border-gray-800 rounded-[40px] p-12 md:p-24 text-center space-y-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                        Rejoignez l'élite du <br />
                        développement pro.
                    </h2>
                    <Link href="/auth/sign-up" className="inline-block bg-black dark:bg-white text-white dark:text-black px-12 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105">
                        Créer mon accès
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-gray-50/50 dark:bg-gray-950/20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-gray-100 dark:border-gray-900 pt-10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
                            <span className="text-white dark:text-black font-black text-xs">W</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">WorkNet Enterprise</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© 2026 Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}
