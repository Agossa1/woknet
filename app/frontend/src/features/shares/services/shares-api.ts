import { ApiClient, api } from "../../api/apiClients";

export interface Share {
    id: string;
    post_id: string;
    profile_id: string;
    caption?: string;
    created_at: string;
}

export class SharesService {
    private readonly BASE_PATH = "/shares";

    constructor(private apiClient: ApiClient) { }

    public async sharePost(postId: string, caption?: string): Promise<Share> {
        const response = await this.apiClient.post<Share>(this.BASE_PATH, {
            post_id: postId,
            caption
        });
        return response;
    }

    public async unsharePost(shareId: string): Promise<void> {
        await this.apiClient.delete(`${this.BASE_PATH}/${shareId}`);
    }
}

export const sharesApi = new SharesService(api);
