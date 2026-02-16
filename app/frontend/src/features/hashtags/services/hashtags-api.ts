import { ApiClient, api } from "../../api/apiClients";

export interface Hashtag {
    id: string;
    name: string;
    usage_count: number;
}

export interface TrendingHashtag extends Hashtag {
    posts_last_week: number;
    posts_last_day: number;
}

export class HashtagsService {
    private readonly BASE_PATH = "/hashtags";

    constructor(private apiClient: ApiClient) { }

    public async getTrending(limit: number = 10): Promise<TrendingHashtag[]> {
        return this.apiClient.get<TrendingHashtag[]>(`${this.BASE_PATH}/trending?limit=${limit}`);
    }

    public async search(query: string, limit: number = 20): Promise<Hashtag[]> {
        return this.apiClient.get<Hashtag[]>(`${this.BASE_PATH}/search?q=${query}&limit=${limit}`);
    }

    public async getPostsByHashtag(name: string, limit: number = 20, offset: number = 0): Promise<any[]> {
        return this.apiClient.get<any[]>(`${this.BASE_PATH}/${name}/posts?limit=${limit}&offset=${offset}`);
    }
}

export const hashtagsApi = new HashtagsService(api);
