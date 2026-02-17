'use client';

import { X, Image, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { updatePostThunk, deletePostThunk } from "@/src/features/posts/services/posts-thunks";
import { Post } from "@/src/features/posts/services/posts-types";
import { VideoPlayer } from "@/src/components/ui/video-player";
import { compressImage } from "@/src/utils/image-utils";
import { Newspaper } from "lucide-react";
import { POST_BACKGROUND_PRESETS, MAX_BACKGROUND_POST_CHARACTERS } from "@/src/features/posts/services/posts-constants";

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    userAvatar?: string;
    userName?: string;
}

export default function EditPostModal({ isOpen, onClose, post, userAvatar, userName }: EditPostModalProps) {
    const [content, setContent] = useState(post.content || "");
    const [loading, setLoading] = useState(false);
    const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(post.media_urls || (post.media_url ? [post.media_url] : []));
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState<string | null>(post.background_color || null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

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

    const removePreviewFile = (index: number) => {
        const urlToRemove = previewUrls[index];
        URL.revokeObjectURL(urlToRemove);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingMedia = (index: number) => {
        setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!content.trim() && existingMediaUrls.length === 0 && selectedFiles.length === 0) return;

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

            await dispatch(updatePostThunk({
                dto: {
                    id: post.id,
                    content: content.trim(),
                    // On garde la compatibilité avec media_url pour le premier média conservé
                    media_url: existingMediaUrls.length > 0 ? existingMediaUrls[0] : null,
                    media_urls: existingMediaUrls,
                    files: filesToUpload,
                    background_color: (backgroundColor && content.trim().length <= MAX_BACKGROUND_POST_CHARACTERS) ? backgroundColor : undefined
                },
                onProgress: (ev) => {
                    if (ev.lengthComputable) {
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        setUploadProgress(percent);
                    }
                }
            })).unwrap();

            onClose();
        } catch (error: any) {
            console.error("Failed to update post:", error);
            alert(`Erreur lors de la modification : ${error.message}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async () => {
        if (confirm("Voulez-vous vraiment supprimer ce post ?")) {
            setLoading(true);
            try {
                await dispatch(deletePostThunk(post.id)).unwrap();
                onClose();
            } catch (error: any) {
                console.error("Failed to delete post:", error);
                alert(`Erreur lors de la suppression : ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const hasChanges = content !== post.content ||
        backgroundColor !== (post.background_color || null) ||
        JSON.stringify(existingMediaUrls) !== JSON.stringify(post.media_urls || (post.media_url ? [post.media_url] : [])) ||
        selectedFiles.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modifier le post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-3 mb-4">
                        <img
                            src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"}
                            className="w-12 h-12 rounded-full bg-gray-100 object-cover"
                            alt="User"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{userName || "Vous"}</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-300 dark:border-gray-700 rounded-full px-2 py-0.5 mt-0.5 flex items-center gap-1">
                                🌎 Public
                            </button>
                        </div>
                    </div>

                    <div className={`relative transition-all duration-500 rounded-xl overflow-hidden ${backgroundColor ? POST_BACKGROUND_PRESETS.find(p => p.id === backgroundColor)?.class : 'bg-transparent'}`}>
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
                            className={`w-full min-h-[150px] bg-transparent transition-all duration-300 placeholder-gray-400 border-none focus:ring-0 resize-none p-6 ${backgroundColor ? 'text-2xl font-bold flex items-center justify-center text-center' : 'text-lg text-gray-900 dark:text-white'}`}
                            autoFocus
                            style={backgroundColor ? { minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}
                        />
                    </div>


                    {/* Color Picker Toggle & Presets */}
                    {existingMediaUrls.length === 0 && previewUrls.length === 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                title="Choisir un arrière-plan"
                            >
                                <Newspaper size={20} className="text-gray-500" />
                            </button>

                            {showColorPicker && (
                                <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                                    {POST_BACKGROUND_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => setBackgroundColor(preset.id === 'none' ? null : preset.id)}
                                            className={`w-8 h-8 rounded-lg ${preset.class} border-2 ${backgroundColor === preset.id || (preset.id === 'none' && !backgroundColor) ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'} transition-all shadow-sm`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Media Display Grid */}
                    {(existingMediaUrls.length > 0 || previewUrls.length > 0) && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {/* Existing Media */}
                            {existingMediaUrls.map((url, index) => (
                                <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                                    {post.type === 'VIDEO' ? (
                                        <VideoPlayer src={url} className="w-full h-full object-cover aspect-video" />
                                    ) : (
                                        <img src={url} alt="Existing" className="w-full h-40 object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeExistingMedia(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* New Previews */}
                            {previewUrls.map((url, index) => (
                                <div key={`preview-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                                    {selectedFiles[index]?.type.startsWith('video/') ? (
                                        <VideoPlayer src={url} className="w-full h-full object-cover aspect-video" />
                                    ) : (
                                        <img src={url} alt="Preview" className="w-full h-40 object-cover" />
                                    )}
                                    <button
                                        onClick={() => removePreviewFile(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex gap-2 text-gray-500">
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
                            className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition text-teal-600"
                            title="Ajouter une photo ou vidéo"
                        >
                            <Image size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-2 mr-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                            title="Supprimer le post"
                        >
                            <Trash2 size={24} />
                        </button>

                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || (content.trim().length === 0 && existingMediaUrls.length === 0 && selectedFiles.length === 0) || !hasChanges}
                            className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-full hover:opacity-90 transition disabled:opacity-50 shadow-lg"
                        >
                            {loading ? (uploadProgress > 0 ? `${uploadProgress}%` : "Envoi...") : "Enregistrer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
