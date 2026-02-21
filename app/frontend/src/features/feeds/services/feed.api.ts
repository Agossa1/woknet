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
            success?: boolean;
            data?: FeedItem[] | { items?: FeedItem[] };
            metadata?: { hasMore?: boolean };
        }>(`${this.BASE_PATH}?page=${page}&ts=${cacheBuster}`);

        // Support both { data: [...] } and { data: { items: [...] } }
        const rawData = response?.data;
        const items = Array.isArray(rawData)
            ? rawData
            : Array.isArray((rawData as any)?.items)
                ? (rawData as { items: FeedItem[] }).items
                : [];
        const hasMore = response?.metadata?.hasMore ?? (items.length > 0);

        return { items, hasMore };
    }
}

export const feedApi = new FeedService(api);
