"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const companies_repository_1 = require("./companies.repository");
const companies_services_1 = require("./companies.services");
const companies_controller_1 = require("./companies.controller");
const companies_routes_1 = require("./companies.routes");
class CompaniesModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new companies_repository_1.CompaniesRepository(db, logger);
        const service = new companies_services_1.CompaniesService(repository, logger);
        const controller = new companies_controller_1.CompaniesController(service, logger);
        const routerInstance = new companies_routes_1.CompaniesRouter(controller);
        this.router = routerInstance.getRouter();
    }
    getRouter() {
        return this.router;
    }
}
exports.CompaniesModule = CompaniesModule;
//# sourceMappingURL=companies.modules.js.map