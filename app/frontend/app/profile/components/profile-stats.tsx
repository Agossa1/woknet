'use client';

export const ProfileStats = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tighter">152</span>
                    <span className="text-[11px] font-bold text-neutral-400">Vues profil</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-950 dark:bg-white rounded-full w-[65%] transition-all duration-1000" />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-widest">+12% ce mois</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tighter">1.2k</span>
                    <span className="text-[11px] font-bold text-neutral-400">Impressions</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-300 dark:bg-neutral-600 rounded-full w-[40%] transition-all duration-1000" />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-widest">Stable</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" title="Pas de changement significatif" />
                </div>
            </div>

            <p className="text-[10px] text-neutral-400 font-medium tracking-tight pt-2 border-t border-neutral-50 dark:border-neutral-800">
                Les analyses consolidées sur les 30 derniers jours.
            </p>
        </div>
    );
};
