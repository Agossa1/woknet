'use client';

import { X, Image, Calendar, Newspaper, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { createPostThunk } from "@/src/features/posts/services/posts-thunks";
import { VideoPlayer } from "@/src/components/ui/video-player";
import { compressImage } from "@/src/utils/image-utils";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    userAvatar?: string;
    userName?: string;
}

export default function CreatePostModal({ isOpen, onClose, userAvatar, userName }: CreatePostModalProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setUploadProgress(0);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePublish = async () => {
        const hasContent = content.trim().length > 0;
        if (!hasContent && !selectedFile) return;

        setLoading(true);
        try {
            let fileToUpload = selectedFile || undefined;

            // On compresse seulement si c'est une image (les vidéos sont trop lourdes à traiter en JS pur ici)
            if (selectedFile && selectedFile.type.startsWith('image/')) {
                try {
                    fileToUpload = await compressImage(selectedFile);
                } catch (e) {
                    console.warn("Compression failed, uploading original:", e);
                }
            }

            await dispatch(createPostThunk({
                dto: {
                    content: hasContent ? content : undefined,
                    file: fileToUpload,
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
            clearFile();
            onClose();
        } catch (error: any) {
            console.error("Failed to create post:", error);
            alert(`Erreur lors de la publication : ${error.userMessage || error.message || "Erreur réseau ou fichier trop volumineux"}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Créer un post</h2>
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

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="De quoi souhaitez-vous discuter ?"
                        className="w-full min-h-[120px] bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-400 border-none focus:ring-0 resize-none p-0"
                        autoFocus
                    />

                    {/* Preview Area */}
                    {previewUrl && (
                        <div className={`relative mt-4 overflow-hidden border border-gray-200 dark:border-gray-800 group ${selectedFile?.type.startsWith('image/') ? 'rounded-xl' : ''}`}>
                            {selectedFile?.type.startsWith('image/') ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-gray-50 dark:bg-gray-800" />
                            ) : (
                                <VideoPlayer
                                    src={previewUrl}
                                    className="w-full h-auto"
                                />
                            )}
                            <button
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* Progress Overlay */}
                            {loading && uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                                    <div className="w-2/3 h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-white transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold">{uploadProgress}%</span>
                                </div>
                            )}
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
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition text-teal-600"
                            title="Ajouter une photo ou vidéo"
                        >
                            <Image size={24} />
                        </button>
                        <button className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition text-orange-500"><Calendar size={24} /></button>
                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition text-red-500"><Newspaper size={24} /></button>
                    </div>
                    <div className="flex items-center gap-4">
                        {loading && !previewUrl && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent animate-spin rounded-full" />
                                <span className="text-xs font-bold text-gray-500">{uploadProgress > 0 ? `${uploadProgress}%` : "Envoi..."}</span>
                            </div>
                        )}
                        <button
                            onClick={handlePublish}
                            disabled={loading || (!content.trim() && !selectedFile)}
                            className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs rounded-full hover:opacity-90 transition disabled:opacity-50 shadow-lg"
                        >
                            {loading ? "Chargement..." : "Publier"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
