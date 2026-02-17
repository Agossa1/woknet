'use client';

import { X, Image, Calendar, Newspaper, Trash2, Globe, Smile, Video, MoreHorizontal, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { createPostThunk } from "@/src/features/posts/services/posts-thunks";
import { VideoPlayer } from "@/src/components/ui/video-player";
import { compressImage } from "@/src/utils/image-utils";
import { POST_BACKGROUND_PRESETS, MAX_BACKGROUND_POST_CHARACTERS } from "@/src/features/posts/services/posts-constants";

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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl shadow-2xl border border-neutral-100 dark:border-gray-800 flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-5 duration-300 relative overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter">Créer un post</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={24} strokeWidth={iconStroke} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* User Profile Info */}
                    <div className="flex gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-gray-800">
                            <img
                                src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"}
                                className="w-full h-full object-cover"
                                alt="User"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[16px] text-neutral-900 dark:text-white">{userName || "Vous"}</h3>
                            <button className="flex items-center gap-1.5 px-2 py-1 mt-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors border border-neutral-200 dark:border-gray-700 text-neutral-600 dark:text-neutral-400">
                                <Globe size={14} strokeWidth={iconStroke} />
                                <span className="text-xs font-medium">Tout le monde</span>
                                <ChevronDown size={14} strokeWidth={iconStroke} />
                            </button>
                        </div>
                    </div>

                    <div className={`relative transition-all duration-500 rounded-lg overflow-hidden ${backgroundColor ? colorPresets.find(p => p.id === backgroundColor)?.class : 'bg-transparent'}`}>
                        {backgroundColor && (
                            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                        )}
                        <textarea
                            value={content}
                            onChange={(e) => {
                                const newContent = e.target.value;
                                setContent(newContent);
                                if (backgroundColor && newContent.length > MAX_BACKGROUND_POST_CHARACTERS) {
                                    setBackgroundColor(null);
                                }
                            }}
                            placeholder="De quoi souhaitez-vous discuter ?"
                            className={`w-full min-h-[120px] bg-transparent transition-all duration-300 placeholder-neutral-400 border-none focus:ring-0 resize-none p-0 ${backgroundColor ? 'text-2xl font-bold flex items-center justify-center text-center text-white py-12 px-6' : 'text-lg text-neutral-900 dark:text-white'}`}
                            autoFocus
                            spellCheck={false}
                        />
                    </div>

                    {/* Color Picker Toggle & Presets */}
                    {previewUrls.length === 0 && (
                        <div className="mt-2 flex items-center gap-3">
                            {showColorPicker && (
                                <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300 py-2">
                                    {colorPresets.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setBackgroundColor(preset.id === 'none' ? null : preset.id)}
                                            className={`w-6 h-6 rounded-full ${preset.class} border ${backgroundColor === preset.id || (preset.id === 'none' && !backgroundColor) ? 'border-white ring-2 ring-neutral-400' : 'border-black/5 hover:scale-110'} transition-all`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview Area */}
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {previewUrls.map((url, index) => (
                                <div key={url} className="relative group rounded-lg overflow-hidden border border-neutral-100 dark:border-gray-800 bg-neutral-50 dark:bg-gray-800">
                                    {selectedFiles[index]?.type.startsWith('video/') ? (
                                        <VideoPlayer src={url} className="w-full h-full object-cover aspect-video" />
                                    ) : (
                                        <img src={url} alt="Preview" className="w-full h-48 object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                    >
                                        <X size={16} strokeWidth={iconStroke} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-2">
                    <div className="flex items-center gap-1 mb-4">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors relative group"
                            title="Choisir un arrière-plan"
                        >
                            <span className="w-5 h-5 rounded bg-gradient-to-tr from-purple-400 to-blue-400 block shadow-sm border border-black/5" />
                        </button>
                    </div>

                    <div className="flex justify-between items-center border-t border-neutral-100 dark:border-gray-800 pt-4">
                        <div className="flex items-center gap-1">
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
                                className="p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors hover:text-neutral-900 dark:hover:text-white"
                                title="Ajouter un média"
                            >
                                <Image size={20} strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors hover:text-neutral-900 dark:hover:text-white"
                                title="Ajouter une vidéo"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Video size={20} strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors hover:text-neutral-900 dark:hover:text-white"
                                title="Créer un événement"
                            >
                                <Calendar size={20} strokeWidth={iconStroke} />
                            </button>
                            <button
                                className="p-2.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-800 rounded-full transition-colors hover:text-neutral-900 dark:hover:text-white hidden sm:block"
                                title="Plus d'options"
                            >
                                <MoreHorizontal size={20} strokeWidth={iconStroke} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {loading && uploadProgress > 0 && uploadProgress < 100 && (
                                <span className="text-xs font-semibold text-neutral-500">{uploadProgress}%</span>
                            )}

                            <button
                                onClick={handlePublish}
                                disabled={loading || (!content.trim() && selectedFiles.length === 0)}
                                className="px-6 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? "Publication..." : "Publier"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
