'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsItemProps {
    icon: LucideIcon;
    title: string;
    description: string;
    subDescription?: string;
    action?: ReactNode;
    iconStroke?: number;
}

export const SettingsItem = ({
    icon: Icon,
    title,
    description,
    subDescription,
    action,
    iconStroke = 1.25
}: SettingsItemProps) => {
    return (
        <div className="flex items-start justify-between py-6 border-b border-neutral-100 dark:border-neutral-800 last:border-0 group">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    <Icon size={18} strokeWidth={iconStroke} />
                </div>
                <div>
                    <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white mb-0.5 font-inter">{title}</h3>
                    <p className="text-[13px] text-neutral-500 font-medium leading-relaxed max-w-xs md:max-w-sm">
                        {description}
                    </p>
                    {subDescription && (
                        <p className="text-[11px] text-neutral-400 font-medium mt-1.5 leading-relaxed max-w-xs italic text-pretty">
                            {subDescription}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center h-10">
                {action}
            </div>
        </div>
    );
};
