"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguagesService = void 0;
class LanguagesService {
    constructor(repository, logger) {
        this.repository = repository;
        this.logger = logger;
    }
    async addLanguage(dto) {
        return this.repository.createLanguage(dto);
    }
    async getProfileLanguages(profileId) {
        return this.repository.getLanguagesByProfileId(profileId);
    }
    async updateLanguage(id, dto) {
        return this.repository.updateLanguage(id, dto);
    }
    async removeLanguage(id) {
        return this.repository.deleteLanguage(id);
    }
}
exports.LanguagesService = LanguagesService;
//# sourceMappingURL=languages.service.js.map