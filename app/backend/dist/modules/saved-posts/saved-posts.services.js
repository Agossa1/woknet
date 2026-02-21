"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPostsServices = void 0;
class SavedPostsServices {
    constructor(repository) {
        this.repository = repository;
    }
    async toggleSavePost(dto) {
        return await this.repository.toggle(dto);
    }
    async getSavedPosts(profileId) {
        return await this.repository.findAllByProfileId(profileId);
    }
}
exports.SavedPostsServices = SavedPostsServices;
//# sourceMappingURL=saved-posts.services.js.map