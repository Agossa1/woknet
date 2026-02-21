"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationsService = void 0;
class CertificationsService {
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
exports.CertificationsService = CertificationsService;
//# sourceMappingURL=certifications.service.js.map