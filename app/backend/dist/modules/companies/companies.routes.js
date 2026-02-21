"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class CompaniesRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", auth_middleware_1.AuthGuard.authenticate, this.controller.createCompany);
        this.router.get("/me", auth_middleware_1.AuthGuard.authenticate, this.controller.getMyCompanies);
        this.router.get("/id/:id", this.controller.getCompanyById);
        this.router.get("/:slug", this.controller.getCompanyBySlug);
        this.router.put("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.updateCompany);
        this.router.delete("/:id", auth_middleware_1.AuthGuard.authenticate, this.controller.deleteCompany);
    }
    getRouter() {
        return this.router;
    }
}
exports.CompaniesRouter = CompaniesRouter;
//# sourceMappingURL=companies.routes.js.map