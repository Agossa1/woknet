'use client';

import { X, Image, Calendar, Newspaper, Trash2, Globe, Smile, Video, MoreHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { createPostThunk } from "@/src/features/posts/services/posts-thunks";
import { VideoPlayer } from "@/src/components/ui/video-player";
import { compressImage } from "@/src/utils/image-utils";
import { POST_BACKGROUND_PRESETS, MAX_BACKGROUND_POST_CHARACTERS } from "@/src/features/posts/services/posts-constants";
import { useMentions } from "@/src/hooks/useMentions";
import { MentionDropdown } from "@/src/components/ui/MentionDropdown";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAvatar?: string;
    userName?: string;
    companyId?: string;
}

export default function CreatePostModal({ isOpen, onClose, userAvatar, userName, companyId }: CreatePostModalProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

    const {
        mentionQuery,
        dropdownRect,
        handleTextChange,
        insertMention,
        textareaRef
    } = useMentions();

    const colorPresets = POST_BACKGROUND_PRESETS;
    const iconStroke = 1.5;

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
            setUploadProgress(0);
        }
    };

    const removeFile = (index: number) => {
        const fileToRemove = selectedFiles[index];
        const urlToRemove = previewUrls[index];

        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(urlToRemove);
            return newUrls;
        });

        if (selectedFiles.length === 1 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const clearAll = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviewUrls([]);
        setUploadProgress(0);
        setBackgroundColor(null);
        setShowColorPicker(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePublish = async () => {
        const hasContent = content.trim().length > 0;
        if (!hasContent && selectedFiles.length === 0) return;

        setLoading(true);
        try {
            const filesToUpload: File[] = [];

            for (const file of selectedFiles) {
                if (file.type.startsWith('image/')) {
                    try {
                        const compressed = await compressImage(file);
                        filesToUpload.push(compressed);
                    } catch (e) {
                        filesToUpload.push(file);
                    }
                } else {
                    filesToUpload.push(file);
                }
            }

            // Limit background color to short posts
            const finalBackgroundColor = (backgroundColor && content.trim().length <= MAX_BACKGROUND_POST_CHARACTERS)
                ? backgroundColor
                : undefined;

            await dispatch(createPostThunk({
                dto: {
                    company_id: companyId,
                    content: hasContent ? content : undefined,
                    files: filesToUpload,
                    background_color: finalBackgroundColor,
                    visibility: 'PUBLIC' as any
                },
                onProgress: (ev) => {
                    if (ev.lengthComputable) {
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        setUploadProgress(percent);
                    }
                }
            })).unwrap();

            setContent("");
            clearAll();
            onClose();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            alert(`Erreur lors de la publication : ${error.userMessage || error.message || "Erreur réseau"}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center sm:pt-[10vh] bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-[#1d2226] w-full max-w-2xl sm:rounded-xl rounded-t-2xl shadow-2xl border-t sm:border border-neutral-200/50 dark:border-white/10 flex flex-col max-h-[96vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5 duration-500 relative"
            >
                {/* Mobile Drag Handle */}
                <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden mb-1 opacity-50" />

                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 dark:border-white/5">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white-90 font-inter">Créer un post</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={iconStroke} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* User Profile Info */}
                    <div className="flex gap-3 mb-4 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-white/5 shadow-sm">
                            <img
                                src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"}
                                className="w-full h-full object-cover"
                                alt="User"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm sm:text-[16px] text-neutral-900 dark:text-white-90">{userName || "Vous"}</h3>
                                {companyId && (
                                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded font-medium">Equipe</span>
                                )}
                            </div>
                            <button className="flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60">
                                <Globe size={13} strokeWidth={iconStroke} />
                                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide">Tout le monde</span>
                                <ChevronDown size={13} strokeWidth={iconStroke} />
                            </button>
                        </div>
                    </div>

                    <div
                        className={`relative transition-all duration-700 min-h-[150px] flex flex-col rounded-xl overflow-hidden ${backgroundColor ? colorPresets.find(p => p.id === backgroundColor)?.class : 'bg-transparent'}`}
                        style={backgroundColor ? colorPresets.find(p => p.id === backgroundColor)?.style : {}}
                    >
                        {backgroundColor && (
                            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                        )}
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => {
                                const newContent = e.target.value;
                                setContent(newContent);
                                handleTextChange(newContent, e.target.selectionStart);
                                if (backgroundColor && newContent.length > MAX_BACKGROUND_POST_CHARACTERS) {
                                    setBackgroundColor(null);
                                }
                            }}
                            onKeyUp={(e) => {
                                if (e.target instanceof HTMLTextAreaElement) {
                                    handleTextChange(content, e.target.selectionStart);
                                }
                            }}
                            onClick={(e) => {
                                if (e.target instanceof HTMLTextAreaElement) {
                                    handleTextChange(content, e.target.selectionStart);
                                }
                            }}
                            placeholder="De quoi souhaitez-vous discuter ?"
                            className={`w-full min-h-[140px] bg-transparent transition-all duration-300 placeholder-neutral-400 dark:placeholder-white/30 border-none focus:ring-0 resize-none p-0 ${backgroundColor ? 'text-xl sm:text-2xl font-bold flex items-center justify-center text-center text-white py-16 px-6 shadow-sm' : 'text-base sm:text-lg text-neutral-900 dark:text-white-90'}`}
                            autoFocus
                            spellCheck={false}
                        />

                        {mentionQuery !== null && (
                            <MentionDropdown
                                query={mentionQuery}
                                anchorRect={dropdownRect}
                                onSelect={(user) => {
                                    const newText = insertMention(user.username, content, textareaRef.current?.selectionStart || 0);
                                    setContent(newText);
                                    textareaRef.current?.focus();
                                }}
                            />
                        )}
                    </div>

                    {/* Organized Color Picker */}
                    {previewUrls.length === 0 && showColorPicker && (
                        <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                            {[
                                { title: 'Dégradé', key: 'gradient' },
                                { title: 'Uni', key: 'solid' },
                                { title: 'Décoratif', key: 'decorative' }
                            ].map(cat => (
                                <div key={cat.key} className="space-y-2">
                                    <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest px-1">{cat.title}</h4>
                                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                                        {colorPresets.filter(p => p.category === cat.key).map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setBackgroundColor(preset.id === backgroundColor ? null : preset.id)}
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0 ${preset.class} border-2 ${backgroundColor === preset.id ? 'border-blue-500 scale-110 shadow-lg ring-2 ring-blue-500/20' : 'border-white dark:border-gray-800 hover:scale-105 shadow-sm'} transition-all`}
                                                style={preset.style}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setBackgroundColor(null)}
                                className="w-full py-2 text-[11px] font-bold text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white transition-colors border-t border-neutral-200 dark:border-white/5 mt-2"
                            >
                                Réinitialiser le fond
                            </button>
                        </div>
                    )}

                    {/* Preview Area */}
                    {previewUrls.length > 0 && (
                        <div className={`grid ${previewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4 mt-6`}>
                            {previewUrls.map((url, index) => (
                                <div key={url} className="relative group rounded-xl border border-neutral-200 dark:border-white/10 bg-black/80 ring-1 ring-black/5 shadow-md flex items-center justify-center">
                                    {selectedFiles[index]?.type.startsWith('video/') ? (
                                        <VideoPlayer
                                            src={url}
                                            className="max-w-full max-h-[360px] w-auto h-auto object-contain block"
                                        />
                                    ) : (
                                        <img
                                            src={url}
                                            alt="Preview"
                                            className="max-w-full max-h-[360px] w-auto h-auto object-contain block"
                                        />
                                    )}
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md shadow-lg scale-90 sm:scale-100"
                                    >
                                        <X size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-6 py-4 pt-2 bg-white dark:bg-[#1d2226] border-t border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-1 mb-4">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`p-2 sm:p-2.5 rounded-full transition-all relative group ${showColorPicker ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-neutral-100 dark:hover:bg-white/5'}`}
                            title="Choisir un arrière-plan"
                        >
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 block shadow-md border border-white/20 transform group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center sm:pt-2">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 sm:p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-all hover:text-[#0A66C2] dark:hover:text-blue-400"
                                title="Ajouter un média"
                            >
                                <Image className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2 sm:p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-all hover:text-[#0A66C2] dark:hover:text-blue-400"
                                title="Ajouter une vidéo"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Video className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2 sm:p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-all hover:text-[#0A66C2] dark:hover:text-blue-400 hidden xs:block"
                                title="Créer un événement"
                            >
                                <Calendar className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2 sm:p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-all hover:text-[#0A66C2] dark:hover:text-blue-400"
                                title="Plus d'options"
                            >
                                <MoreHorizontal className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={iconStroke} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            {loading && uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Téléchargement</span>
                                    <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
                                </div>
                            )}

                            <button
                                onClick={handlePublish}
                                disabled={loading || (!content.trim() && selectedFiles.length === 0)}
                                className="px-5 sm:px-8 py-2 sm:py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm sm:text-base rounded-full transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20 active:scale-95"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Envoi...</span>
                                    </div>
                                ) : "Publier"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
