'use client';

import React, { useState } from 'react';
import {
    X,
    Share2,
    MessageSquare,
    Facebook,
    Copy,
    Link as LinkIcon,
    Check,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInternalShare: (caption: string) => void;
    postUrl: string;
    postContent?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    onInternalShare,
    postUrl,
    postContent
}) => {
    const [internalCaption, setInternalCaption] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`Découvrez ce post sur WorkNet : ${postUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800/50">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            Partager
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Post Preview (Minimalist) */}
                        {postContent && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/30 border-l-2 border-gray-200 dark:border-gray-700 rounded-r-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                    {postContent}
                                </p>
                            </div>
                        )}

                        {/* Internal Share */}
                        <div className="space-y-3">
                            <textarea
                                value={internalCaption}
                                onChange={(e) => setInternalCaption(e.target.value)}
                                placeholder="Votre message (optionnel)..."
                                className="w-full h-20 p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 outline-none resize-none transition-all placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => {
                                    onInternalShare(internalCaption);
                                    setInternalCaption('');
                                }}
                                className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity uppercase tracking-wider"
                            >
                                Partager sur le flux
                            </button>
                        </div>

                        {/* External Options */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={shareToWhatsApp}
                                className="flex flex-col items-center gap-2 py-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <MessageSquare size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-green-500" />
                                <span className="text-[10px] font-medium text-gray-500">WhatsApp</span>
                            </button>

                            <button
                                onClick={shareToFacebook}
                                className="flex flex-col items-center gap-2 py-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <Facebook size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                                <span className="text-[10px] font-medium text-gray-500">Facebook</span>
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="flex flex-col items-center gap-2 py-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            >
                                {copied ? (
                                    <Check size={18} className="text-green-500" />
                                ) : (
                                    <Copy size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                                )}
                                <span className="text-[10px] font-medium text-gray-500">{copied ? 'Copié' : 'Lien'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
