"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedContentService = void 0;
class FeaturedContentService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async add(dto) {
        return this.repository.create(dto);
    }
    async getByProfile(profileId) {
        return this.repository.getByProfileId(profileId);
    }
    async update(id, dto) {
        return this.repository.update(id, dto);
    }
    async remove(id) {
        return this.repository.delete(id);
    }
}
exports.FeaturedContentService = FeaturedContentService;
//# sourceMappingURL=featured-content.service.js.map