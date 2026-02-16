'use client';

import { useRef, useState, useEffect } from "react";
import { Camera, Upload, Loader2, X } from "lucide-react";

interface PhotoUploadModalProps {
    isOpen: boolean;
    type: 'avatar' | 'banner' | null;
    currentImageUrl?: string;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
}

export const PhotoUploadModal = ({ isOpen, type, currentImageUrl, onClose, onUpload }: PhotoUploadModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes or type changes
    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImageUrl || '');
            setSelectedFile(null);
            setIsUploading(false);
        }
    }, [isOpen, currentImageUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            await onUpload(selectedFile);
            onClose();
        } catch (error) {
            // Error handling should be done by the parent or displayed here
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !isUploading && onClose()}
            />
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tighter">
                                {type === 'avatar' ? 'Photo de profil' : 'Bannière de couverture'}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">Téléchargez une image</p>
                        </div>
                        {!isUploading && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                        />

                        <div
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            className={`relative aspect-video w-full rounded-2xl bg-gray-50 dark:bg-gray-800/50 overflow-hidden border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 group
                    ${previewUrl ? 'border-transparent' : 'border-gray-200 dark:border-gray-700 hover:border-blue-500/50'}
                  `}
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    {!isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload size={32} className="text-white" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform">
                                        <Camera size={32} className="text-gray-400 group-hover:text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Cliquez pour parcourir</p>
                                        <p className="text-xs text-gray-400 font-medium tracking-tight">JPG, PNG ou GIF (max. 5MB)</p>
                                    </div>
                                </>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md flex flex-col items-center justify-center space-y-3">
                                    <Loader2 size={32} className="animate-spin text-blue-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!selectedFile || isUploading}
                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition shadow-xl disabled:opacity-50"
                        >
                            {isUploading ? 'Chargement...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
