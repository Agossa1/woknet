"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagsService = void 0;
const hashtags_repository_1 = require("./hashtags.repository");
class HashtagsService {
    constructor() {
        this.repository = new hashtags_repository_1.HashtagsRepository();
    }
    async getTrending(limit = 10) {
        // Simple caching logic could go here, but since this service is often
        // instantiated fresh, we'd need a shared Redis instance.
        // For now, let's just make sure the repository query is fast.
        return this.repository.getTrending(limit);
    }
    async search(query, limit = 20) {
        return this.repository.search(query, limit);
    }
    async getPostsByHashtag(hashtagName, limit = 20, offset = 0, currentProfileId) {
        return this.repository.getPostsByHashtag(hashtagName, limit, offset, currentProfileId);
    }
    async getHashtagDetails(name) {
        return this.repository.getHashtagDetails(name);
    }
    async processPostHashtags(postId, content) {
        return this.repository.processPostHashtags(postId, content);
    }
}
exports.HashtagsService = HashtagsService;
//# sourceMappingURL=hashtags.service.js.map