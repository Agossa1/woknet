"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedContentModule = void 0;
const featured_content_repository_1 = require("./featured-content.repository");
const featured_content_service_1 = require("./featured-content.service");
const featured_content_controller_1 = require("./featured-content.controller");
const featured_content_routes_1 = require("./featured-content.routes");
class FeaturedContentModule {
    static init(db, logger) {
        const repository = new featured_content_repository_1.FeaturedContentRepository(db, logger);
        const service = new featured_content_service_1.FeaturedContentService(repository, logger);
        const controller = new featured_content_controller_1.FeaturedContentController(service, logger);
        return (0, featured_content_routes_1.FeaturedContentRoutes)(controller);
    }
}
exports.FeaturedContentModule = FeaturedContentModule;
//# sourceMappingURL=featured-content.module.js.map