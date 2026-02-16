'use client';

interface BasicInfoSectionProps {
    formData: {
        username: string;
        display_name: string;
        bio: string;
        location_name: string;
        website_url: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BasicInfoSection = ({ formData, onChange }: BasicInfoSectionProps) => {
    return (
        <div className="space-y-6">
            <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Informations de base
                </h2>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                            Nom d'affichage
                        </label>
                        <input
                            type="text"
                            name="display_name"
                            value={formData.display_name}
                            onChange={onChange}
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                            placeholder="Nom Public"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                        Site web
                    </label>
                    <input
                        type="url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={onChange}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                        placeholder="https://example.com"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                        Localisation
                    </label>
                    <input
                        type="text"
                        name="location_name"
                        value={formData.location_name}
                        onChange={onChange}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                        placeholder="Ville, Pays"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                        Biographie
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={onChange}
                        maxLength={500}
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 min-h-[100px] resize-none leading-relaxed text-sm transition-all"
                        placeholder="Décrivez votre parcours..."
                    />
                    <p className="text-[10px] text-right text-gray-400 mt-1">
                        {formData.bio.length}/500
                    </p>
                </div>
            </div>
        </div>
    );
};
