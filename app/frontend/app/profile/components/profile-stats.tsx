'use client';

export const ProfileStats = () => {
    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between divide-x divide-gray-200 dark:divide-gray-700">
            <div className="px-4 text-center flex-1">
                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">152</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Projets</span>
            </div>
            <div className="px-4 text-center flex-1">
                <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">1.2k</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contacts</span>
            </div>
        </div>
    );
};
