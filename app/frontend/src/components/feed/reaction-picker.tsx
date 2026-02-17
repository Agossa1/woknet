'use client';

import { useState } from 'react';
import { ReactionType } from '@/src/features/posts/services/posts-types';
import { ThumbsUp, Heart, Award, Lightbulb, Smile, HelpingHand, LucideIcon } from 'lucide-react';

export interface ReactionConfig {
    type: ReactionType;
    icon: LucideIcon;
    label: string;
    color: string;
    textColor: string;
    emoji?: string; // Gardé pour la modal
}

export const REACTIONS: ReactionConfig[] = [
    {
        type: ReactionType.LIKE,
        icon: ThumbsUp,
        label: 'J\'aime',
        color: 'bg-blue-500',
        textColor: 'text-blue-500',
        emoji: '👍'
    },
    {
        type: ReactionType.CELEBRATE,
        icon: Award,
        label: 'Bravo',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        emoji: '🎉'
    },
    {
        type: ReactionType.SUPPORT,
        icon: HelpingHand,
        label: 'Soutien',
        color: 'bg-purple-500',
        textColor: 'text-purple-500',
        emoji: '🤝'
    },
    {
        type: ReactionType.LOVE,
        icon: Heart,
        label: 'J\'adore',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        emoji: '❤️'
    },
    {
        type: ReactionType.INSIGHTFUL,
        icon: Lightbulb,
        label: 'Instructif',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        emoji: '💡'
    },
    {
        type: ReactionType.FUNNY,
        icon: Smile,
        label: 'Amusant',
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
        emoji: '😂'
    }
];

interface ReactionPickerProps {
    onSelect: (reactionType: ReactionType) => void;
    currentReaction?: ReactionType;
}

export default function ReactionPicker({ onSelect, currentReaction }: ReactionPickerProps) {
    const [isVisible, setIsVisible] = useState(false);

    const handleSelect = (type: ReactionType) => {
        onSelect(type);
        setIsVisible(false);
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Invisble trigger bridge (prevents flickering when moving mouse from button to picker) */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-20 -mb-10"
            />

            {/* Picker Popup */}
            <div
                className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 
                    transition-all duration-300 ease-out
                    ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90 pointer-events-none'}
                `}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 px-2 py-2 flex items-center gap-1.5">
                    {REACTIONS.map((reaction, index) => {
                        const Icon = reaction.icon;
                        return (
                            <button
                                key={reaction.type}
                                onClick={() => handleSelect(reaction.type)}
                                className={`
                                    relative flex items-center justify-center
                                    w-11 h-11 rounded-full transition-all duration-200
                                    hover:scale-125 hover:-translate-y-1.5
                                    ${currentReaction === reaction.type ? 'bg-gray-100 dark:bg-gray-700 scale-110' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                    group
                                `}
                                style={{ transitionDelay: `${index * 30}ms` }}
                            >
                                <Icon
                                    size={24}
                                    className={`${reaction.textColor} ${currentReaction === reaction.type ? 'fill-current' : 'group-hover:fill-current'} transition-all duration-300`}
                                />

                                {/* Hover Indicator dot */}
                                <div className={`absolute -bottom-1.5 w-1 h-1 rounded-full ${reaction.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                {/* Label Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 
                                    opacity-0 group-hover:opacity-100 
                                    bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg
                                    shadow-xl border border-white/10
                                    pointer-events-none transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0">
                                    {reaction.label}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {/* Decorative background shadow */}
                <div className="absolute inset-x-4 -bottom-1 h-2 bg-black/5 blur-md rounded-full -z-10" />
            </div>
        </div>
    );
}

export function getReactionConfig(type: ReactionType): ReactionConfig {
    return REACTIONS.find(r => r.type === type) || REACTIONS[0];
}

