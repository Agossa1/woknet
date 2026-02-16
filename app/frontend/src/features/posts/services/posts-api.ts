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

    public async getPostById(id: string): Promise<Post> {
        return this.apiClient.get<Post>(`${this.BASE_PATH}/${id}`);
    }

    public async createPost(dto: CreatePostDTO, onProgress?: (ev: ProgressEvent) => void): Promise<Post> {
        if (dto.file) {
            try {
                // 1. Récupérer signature
                const sigData = await this.apiClient.get<{
                    signature: string,
                    timestamp: number,
                    cloudName: string,
                    apiKey: string,
                    folder: string
                }>(`/uploads/signature?folder=worknet/posts`);

                const file = dto.file;
                let secureUrl = '';

                // 2. Stratégie d'upload : Simple (< 90MB) ou Chunked (> 90MB)
                // Cloudinary limite l'upload simple à 100MB
                const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks (safer for unstable connections)
                if (file.size < 90 * 1024 * 1024) {
                    secureUrl = await this.uploadSimple(file, sigData, onProgress);
                } else {
                    secureUrl = await this.uploadChunked(file, sigData, CHUNK_SIZE, onProgress);
                }

                // 3. Finalisation post
                const { file: _, ...finalDto } = dto;
                finalDto.media_url = secureUrl;

                // Détection type
                const { PostType } = await import('./posts-types');
                if (file.type.startsWith('video/')) finalDto.type = PostType.VIDEO;
                else if (file.type.startsWith('image/')) finalDto.type = PostType.IMAGE;

                return this.apiClient.post<Post>(this.BASE_PATH, finalDto);
            } catch (error) {
                console.error("[PostsApi] Direct upload failed:", error);

                // CRITICAL: Ne PAS fallback sur le backend pour les fichiers > 100MB.
                // Le backend exploserait (RAM) ou Cloudinary rejetterait (413).
                if (dto.file.size > 100 * 1024 * 1024) {
                    throw new Error("L'envoi a échoué. Votre fichier est trop volumineux pour être traité par le serveur de secours. Veuillez réessayer avec une connexion stable.");
                }

                console.warn("[PostsApi] Falling back to proxy for small file.");
                // Fallback Proxy (seulement pour petits fichiers)
                const formData = new FormData();
                Object.entries(dto).forEach(([key, value]) => {
                    if (key !== 'file' && value !== undefined && value !== null) {
                        formData.append(key, value as string);
                    }
                });
                formData.append('file', dto.file);
                return this.apiClient.post<Post>(this.BASE_PATH, formData, { onUploadProgress: onProgress });
            }
        }
        return this.apiClient.post<Post>(this.BASE_PATH, dto);
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

        // Use 'video' resource type explicitly for large chunked uploads if it's a video, otherwise auto
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
            // Necessary for Cloudinary to know it's a raw upload if we used 'auto' but for chunked video 'video' is safer

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', cloudinaryUrl, true);

                xhr.setRequestHeader('X-Unique-Upload-Id', uniqueUploadId);
                xhr.setRequestHeader('Content-Range', `bytes ${start}-${end - 1}/${total}`);

                if (onProgress) {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            // Calculate global progress
                            // e.loaded is just for this chunk. But start is the base.
                            // Note: e.total in this event is the chunk context usually
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
                        if (chunkIdx === totalChunks - 1) {
                            secureUrl = response.secure_url;
                        }
                        resolve();
                    } else {
                        // Log detailed error from Cloudinary
                        console.error(`Chunk ${chunkIdx} failed:`, xhr.responseText);
                        reject(new Error(`Chunk upload failed at ${start}-${end}: ${xhr.statusText}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error during chunk upload (CORS or Connection)'));
                xhr.send(formData);
            });

            start = end;
        }
        return secureUrl;
    }

    public async updatePost(dto: UpdatePostDTO): Promise<Post> {
        const { id, ...updateData } = dto;
        return this.apiClient.put<Post>(`${this.BASE_PATH}/${id}`, updateData);
    }

    public async deletePost(id: string): Promise<void> {
        await this.apiClient.delete(`${this.BASE_PATH}/${id}`);
    }

    public async toggleLike(postId: string, profileId: string): Promise<{ liked: boolean }> {
        return this.apiClient.post<{ liked: boolean }>("/likes/toggle", {
            post_id: postId,
            profile_id: profileId
        });
    }

    public async checkIfLiked(postId: string, profileId: string): Promise<boolean> {
        const result = await this.apiClient.get<{ liked: boolean }>(`/likes/check/${postId}?profileId=${profileId}`);
        return result.liked;
    }
}

export const postsApi = new PostsServices(api);
