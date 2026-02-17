import { HashtagsRepository } from "./hashtags.repository";
import Logger from "../../infra/logger/winston";

export class HashtagsService {
    private repository: HashtagsRepository;

    constructor() {
        this.repository = new HashtagsRepository();
    }

    async getTrending(limit: number = 10) {
        // Simple caching logic could go here, but since this service is often
        // instantiated fresh, we'd need a shared Redis instance.
        // For now, let's just make sure the repository query is fast.
        return this.repository.getTrending(limit);
    }

    async search(query: string, limit: number = 20) {
        return this.repository.search(query, limit);
    }

    async getPostsByHashtag(hashtagName: string, limit: number = 20, offset: number = 0, currentProfileId?: string) {
        return this.repository.getPostsByHashtag(hashtagName, limit, offset, currentProfileId);
    }

    async getHashtagDetails(name: string) {
        return this.repository.getHashtagDetails(name);
    }

    async processPostHashtags(postId: string, content: string) {
        return this.repository.processPostHashtags(postId, content);
    }
}
