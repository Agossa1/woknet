"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationsModule = void 0;
const certifications_repository_1 = require("./certifications.repository");
const certifications_service_1 = require("./certifications.service");
const certifications_controller_1 = require("./certifications.controller");
const certifications_routes_1 = require("./certifications.routes");
class CertificationsModule {
    static init(db, logger) {
        const repository = new certifications_repository_1.CertificationsRepository(db, logger);
        const service = new certifications_service_1.CertificationsService(repository, logger);
        const controller = new certifications_controller_1.CertificationsController(service, logger);
        return (0, certifications_routes_1.CertificationsRoutes)(controller);
    }
}
exports.CertificationsModule = CertificationsModule;
//# sourceMappingURL=certifications.module.js.map