"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const express_1 = require("express");
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const jobs_repository_1 = require("./jobs.repository");
const jobs_services_1 = require("./jobs.services");
const jobs_ai_service_1 = require("./jobs.ai.service");
const jobs_controller_1 = require("./jobs.controller");
const jobs_routes_1 = require("./jobs.routes");
const job_suggestions_controller_1 = require("./job-suggestions.controller");
const job_suggestions_routes_1 = require("./job-suggestions.routes");
class JobsModule {
    constructor() {
        const db = new configDB_1.default();
        const logger = new winston_1.default();
        const repository = new jobs_repository_1.JobsRepository(db, logger);
        const aiService = new jobs_ai_service_1.JobsAIService(logger);
        const service = new jobs_services_1.JobsService(repository, aiService, logger);
        const controller = new jobs_controller_1.JobsController(service, logger);
        const routerInstance = new jobs_routes_1.JobsRouter(controller);
        // Suggestions
        const suggestionsController = new job_suggestions_controller_1.JobSuggestionsController(db, logger);
        const suggestionsRouter = new job_suggestions_routes_1.JobSuggestionsRouter(suggestionsController);
        this.router = (0, express_1.Router)();
        this.router.use('/', routerInstance.getRouter());
        this.router.use('/suggestions', suggestionsRouter.router);
    }
    getRouter() {
        return this.router;
    }
}
exports.JobsModule = JobsModule;
//# sourceMappingURL=jobs.modules.js.map