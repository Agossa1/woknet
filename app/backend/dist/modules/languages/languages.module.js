"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguagesModule = void 0;
const languages_repository_1 = require("./languages.repository");
const languages_service_1 = require("./languages.service");
const languages_controller_1 = require("./languages.controller");
const languages_routes_1 = require("./languages.routes");
class LanguagesModule {
    static init(db, logger) {
        const repository = new languages_repository_1.LanguagesRepository(db, logger);
        const service = new languages_service_1.LanguagesService(repository, logger);
        const controller = new languages_controller_1.LanguagesController(service, logger);
        return (0, languages_routes_1.LanguagesRoutes)(controller);
    }
}
exports.LanguagesModule = LanguagesModule;
//# sourceMappingURL=languages.module.js.map