import { ApiClient, api } from "../../api/apiClients";
import { FeedItem } from "./feed.types";

type PowerFeedResponse = {
    items: FeedItem[];
    hasMore: boolean;
};

export class FeedService {
    private readonly BASE_PATH = "/feed";

    constructor(private apiClient: ApiClient) { }

    public async getFeed(page: number = 1): Promise<PowerFeedResponse> {
        const cacheBuster = Date.now();
        const response = await this.apiClient.get<{
            success: boolean;
            data: FeedItem[];
            metadata?: { hasMore?: boolean };
        }>(`${this.BASE_PATH}?page=${page}&ts=${cacheBuster}`);

        const items = response.data;
        const hasMore = response.metadata?.hasMore ?? (items.length > 0);

        return { items, hasMore };
    }
}

export const feedApi = new FeedService(api);
