"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSuggestionsRouter = void 0;
const express_1 = require("express");
class JobSuggestionsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public routes for suggestions
        this.router.get('/titles', this.controller.getJobTitles);
        this.router.get('/locations', this.controller.getWorkLocations);
        this.router.get('/categories', this.controller.getCategories);
    }
}
exports.JobSuggestionsRouter = JobSuggestionsRouter;
//# sourceMappingURL=job-suggestions.routes.js.map