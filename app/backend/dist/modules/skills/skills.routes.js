"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
class SkillsRouter {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public search
        // Mounted as: /api/skills/search (because router is already on /skills)
        this.router.get('/search', this.controller.searchSkills.bind(this.controller));
        // Profile skills management
        // These routes handle both skills listing and profile-specific operations
        // However, since we're mounted on /skills, we need to go back to root for /profiles
        // We'll need to change the mounting strategy in index.ts instead
    }
    // Alternative: Move profile-related routes to a separate router
    // For now, let's create methods that return route handlers
    getProfileRouter() {
        const profileRouter = (0, express_1.Router)();
        // GET /api/profiles/:profileId/skills
        profileRouter.get('/:profileId/skills', this.controller.getSkills.bind(this.controller));
        // POST /api/profiles/:profileId/skills
        profileRouter.post('/:profileId/skills', auth_middleware_1.AuthGuard.authenticate, this.controller.addSkill.bind(this.controller));
        // DELETE /api/profiles/:profileId/skills/:skillId
        profileRouter.delete('/:profileId/skills/:skillId', auth_middleware_1.AuthGuard.authenticate, this.controller.removeSkill.bind(this.controller));
        // POST /api/profiles/:profileId/skills/:skillId/endorse
        profileRouter.post('/:profileId/skills/:skillId/endorse', auth_middleware_1.AuthGuard.authenticate, this.controller.endorseSkill.bind(this.controller));
        // DELETE /api/profiles/:profileId/skills/:skillId/endorse
        profileRouter.delete('/:profileId/skills/:skillId/endorse', auth_middleware_1.AuthGuard.authenticate, this.controller.removeEndorsement.bind(this.controller));
        // --- Categories ---
        // GET /api/profiles/:profileId/skill-categories
        profileRouter.get('/:profileId/skill-categories', this.controller.getCategories.bind(this.controller));
        // POST /api/profiles/:profileId/skill-categories
        profileRouter.post('/:profileId/skill-categories', auth_middleware_1.AuthGuard.authenticate, this.controller.createCategory.bind(this.controller));
        // DELETE /api/profiles/:profileId/skill-categories/:id
        profileRouter.delete('/:profileId/skill-categories/:id', auth_middleware_1.AuthGuard.authenticate, this.controller.deleteCategory.bind(this.controller));
        return profileRouter;
    }
    getRouter() {
        return this.router;
    }
}
exports.SkillsRouter = SkillsRouter;
//# sourceMappingURL=skills.routes.js.map