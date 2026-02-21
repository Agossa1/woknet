"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsModule = void 0;
const learnings_repository_1 = require("./learnings.repository");
const learnings_services_1 = require("./learnings.services");
const learnings_controller_1 = require("./learnings.controller");
const learnings_routes_1 = require("./learnings.routes");
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
class LearningsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        // Initialization
        const repository = new learnings_repository_1.LearningsRepository(db, logger);
        const service = new learnings_services_1.LearningsServices(repository, logger);
        const controller = new learnings_controller_1.LearningsController(service, logger);
        const routes = new learnings_routes_1.LearningsRoutes(controller);
        this.router = routes.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.LearningsModule = LearningsModule;
//# sourceMappingURL=learnings.modules.js.map