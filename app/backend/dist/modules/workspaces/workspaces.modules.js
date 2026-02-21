"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const workspaces_repository_1 = require("./workspaces.repository");
const workspaces_services_1 = require("./workspaces.services");
const workspaces_controller_1 = require("./workspaces.controller");
const workspaces_routes_1 = require("./workspaces.routes");
class WorkspacesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new workspaces_repository_1.WorkspacesRepository(db, logger);
        const service = new workspaces_services_1.WorkspacesService(repository, logger);
        const controller = new workspaces_controller_1.WorkspacesController(service, logger);
        const routerInstance = new workspaces_routes_1.WorkspacesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.WorkspacesModule = WorkspacesModule;
//# sourceMappingURL=workspaces.modules.js.map