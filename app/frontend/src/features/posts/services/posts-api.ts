import { ApiClient, api } from "../../api/apiClients";
import { Post, CreatePostDTO, UpdatePostDTO } from "./posts-types";

export class PostsServices {
    private readonly BASE_PATH = "/posts";

    constructor(private apiClient: ApiClient) { }

    public async getFeed(page = 1, limit = 20): Promise<Post[]> {
        return this.apiClient.get<Post[]>(`${this.BASE_PATH}/feed?page=${page}&limit=${limit}`);
    }

    public async getProfilePosts(profileId: string): Promise<Post[]> {
        return this.apiClient.get<Post[]>(`${this.BASE_PATH}/profile/${profileId}`);
    }

    public async getCompanyPosts(companyId: string): Promise<Post[]> {
        return this.apiClient.get<Post[]>(`${this.BASE_PATH}/company/${companyId}`);
    }

    public async getPostById(id: string): Promise<Post> {
        return this.apiClient.get<Post>(`${this.BASE_PATH}/${id}`);
    }

    public async createPost(dto: CreatePostDTO, onProgress?: (ev: ProgressEvent) => void): Promise<Post> {
        let finalDto = { ...dto };

        // Plusieurs fichiers
        if (dto.files && dto.files.length > 0) {
            const urls: string[] = [];
            for (let i = 0; i < dto.files.length; i++) {
                const url = await this.uploadFile(dto.files[i], (ev) => {
                    if (onProgress) onProgress(ev);
                });
                urls.push(url);
            }
            const { files: _, ...rest } = finalDto;
            finalDto = { ...rest, media_urls: urls };

            const firstFile = dto.files[0];
            const { PostType } = await import('./posts-types');
            if (firstFile.type.startsWith('video/')) finalDto.type = PostType.VIDEO;
            else if (firstFile.type.startsWith('image/')) finalDto.type = PostType.IMAGE;
        }
        else if (dto.file) {
            const secureUrl = await this.uploadFile(dto.file, onProgress);
            const { file: _, ...rest } = finalDto;
            finalDto = { ...rest, media_url: secureUrl, media_urls: [secureUrl] };

            const { PostType } = await import('./posts-types');
            if (dto.file.type.startsWith('video/')) finalDto.type = PostType.VIDEO;
            else if (dto.file.type.startsWith('image/')) finalDto.type = PostType.IMAGE;
        }
        return this.apiClient.post<Post>(this.BASE_PATH, finalDto);
    }

    private async uploadFile(file: File, onProgress?: (ev: ProgressEvent) => void): Promise<string> {
        try {
            // 1. Récupérer signature
            const sigData = await this.apiClient.get<{
                signature: string,
                timestamp: number,
                cloudName: string,
                apiKey: string,
                folder: string
            }>(`/uploads/signature?folder=worknet/posts`);

            // 2. Stratégie d'upload : Simple (< 90MB) ou Chunked (> 90MB)
            const CHUNK_SIZE = 10 * 1024 * 1024;
            if (file.size < 90 * 1024 * 1024) {
                return await this.uploadSimple(file, sigData, onProgress);
            } else {
                return await this.uploadChunked(file, sigData, CHUNK_SIZE, onProgress);
            }
        } catch (error) {
            console.error("[PostsApi] Upload failed:", error);
            if (file.size > 100 * 1024 * 1024) {
                throw new Error("L'envoi a échoué. Fichier trop volumineux.");
            }
            throw error;
        }
    }

    private async uploadSimple(file: File, sigData: any, onProgress?: (ev: ProgressEvent) => void): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp.toString());
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', cloudinaryUrl, true);
            if (onProgress) xhr.upload.onprogress = onProgress;
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText).secure_url);
                else reject(new Error(`Simple upload failed: ${xhr.statusText} (${xhr.responseText})`));
            };
            xhr.onerror = () => reject(new Error('Network error during simple upload'));
            xhr.send(formData);
        });
    }

    private async uploadChunked(file: File, sigData: any, chunkSize: number, onProgress?: (ev: ProgressEvent) => void): Promise<string> {
        const total = file.size;
        const totalChunks = Math.ceil(total / chunkSize);
        const uniqueUploadId = `worknet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const resourceType = file.type.startsWith('video/') ? 'video' : 'auto';
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;

        let start = 0;
        let secureUrl = '';

        for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
            const end = Math.min(start + chunkSize, total);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('api_key', sigData.apiKey);
            formData.append('timestamp', sigData.timestamp.toString());
            formData.append('signature', sigData.signature);
            formData.append('folder', sigData.folder);

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', cloudinaryUrl, true);
                xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
                xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${total}`);

                if (onProgress) {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const totalUploaded = start + e.loaded;
                            onProgress({
                                loaded: totalUploaded,
                                total: total,
                                lengthComputable: true
                            } as any);
                        }
                    };
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        if (chunkIdx === totalChunks - 1) secureUrl = response.secure_url;
                        resolve();
                    } else {
                        reject(new Error(`Chunk upload failed at ${start}-${end}: ${xhr.statusText}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during chunk upload'));
                xhr.send(formData);
            });

            start = end;
        }
        return secureUrl;
    }

    public async updatePost(dto: UpdatePostDTO, onProgress?: (ev: ProgressEvent) => void): Promise<Post> {
        const { id, ...updateData } = dto;
        let finalData = { ...updateData };

        // Gestion des nouveaux fichiers multiples
        if (dto.files && dto.files.length > 0) {
            const newUrls: string[] = [];
            for (let i = 0; i < dto.files.length; i++) {
                const url = await this.uploadFile(dto.files[i], (ev) => {
                    if (onProgress) onProgress(ev);
                });
                newUrls.push(url);
            }

            // On fusionne les URLs existantes conservées et les nouvelles
            const currentUrls = dto.media_urls || [];
            const mergedUrls = [...currentUrls, ...newUrls];

            const { files: _, ...rest } = finalData;
            finalData = { ...rest, media_urls: mergedUrls, media_url: mergedUrls[0] };

            const firstFileType = dto.files[0].type;
            const { PostType } = await import('./posts-types');
            if (firstFileType.startsWith('video/')) finalData.type = PostType.VIDEO;
            else if (firstFileType.startsWith('image/')) finalData.type = PostType.IMAGE;
        }
        // Un seul fichier (rétrocompatibilité)
        else if (dto.file) {
            const secureUrl = await this.uploadFile(dto.file, onProgress);
            const { file: _, ...rest } = finalData;
            finalData = { ...rest, media_url: secureUrl, media_urls: [secureUrl] };

            const { PostType } = await import('./posts-types');
            if (dto.file.type.startsWith('video/')) finalData.type = PostType.VIDEO;
            else if (dto.file.type.startsWith('image/')) finalData.type = PostType.IMAGE;
        }
        // Si plus aucun média, on repasse en TEXT
        else if (dto.media_url === null || (dto.media_urls && dto.media_urls.length === 0)) {
            const { PostType } = await import('./posts-types');
            finalData.type = PostType.TEXT;
            finalData.media_url = null;
            finalData.media_urls = [];
        }

        return this.apiClient.put<Post>(`${this.BASE_PATH}/${id}`, finalData);
    }

    public async deletePost(id: string): Promise<void> {
        await this.apiClient.delete(`${this.BASE_PATH}/${id}`);
    }

    public async toggleLike(postId: string, profileId: string, reactionType?: string): Promise<{ liked: boolean }> {
        return this.apiClient.post<{ liked: boolean }>("/likes/toggle", {
            post_id: postId,
            profile_id: profileId,
            reaction_type: reactionType
        });
    }

    public async checkIfLiked(postId: string, profileId: string): Promise<boolean> {
        const result = await this.apiClient.get<{ liked: boolean }>(`/likes/check/${postId}?profileId=${profileId}`);
        return result.liked;
    }

    public async getPostLikes(postId: string): Promise<{ likes: any[], count: number }> {
        return this.apiClient.get<{ likes: any[], count: number }>(`/likes/${postId}`);
    }

    public async toggleSavePost(postId: string): Promise<{ saved: boolean }> {
        return this.apiClient.post<{ saved: boolean }>(`/saved-posts/${postId}/toggle`, {});
    }

    public async getSavedPosts(): Promise<Post[]> {
        return this.apiClient.get<Post[]>("/saved-posts");
    }
}

export const postsApi = new PostsServices(api);
