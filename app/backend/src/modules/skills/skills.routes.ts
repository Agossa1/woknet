import { Router } from "express";
import { SkillsController } from "./skills.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export class SkillsRouter {
    private readonly router: Router;

    constructor(
        private readonly controller: SkillsController,
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Public search
        // Mounted as: /api/skills/search (because router is already on /skills)
        this.router.get(
            '/search',
            this.controller.searchSkills.bind(this.controller)
        );

        // Profile skills management
        // These routes handle both skills listing and profile-specific operations
        // However, since we're mounted on /skills, we need to go back to root for /profiles
        // We'll need to change the mounting strategy in index.ts instead
    }

    // Alternative: Move profile-related routes to a separate router
    // For now, let's create methods that return route handlers
    public getProfileRouter(): Router {
        const profileRouter = Router();

        // GET /api/profiles/:profileId/skills
        profileRouter.get(
            '/:profileId/skills',
            this.controller.getSkills.bind(this.controller)
        );

        // POST /api/profiles/:profileId/skills
        profileRouter.post(
            '/:profileId/skills',
            AuthGuard.authenticate,
            this.controller.addSkill.bind(this.controller)
        );

        // DELETE /api/profiles/:profileId/skills/:skillId
        profileRouter.delete(
            '/:profileId/skills/:skillId',
            AuthGuard.authenticate,
            this.controller.removeSkill.bind(this.controller)
        );

        // POST /api/profiles/:profileId/skills/:skillId/endorse
        profileRouter.post(
            '/:profileId/skills/:skillId/endorse',
            AuthGuard.authenticate,
            this.controller.endorseSkill.bind(this.controller)
        );

        // DELETE /api/profiles/:profileId/skills/:skillId/endorse
        profileRouter.delete(
            '/:profileId/skills/:skillId/endorse',
            AuthGuard.authenticate,
            this.controller.removeEndorsement.bind(this.controller)
        );

        return profileRouter;
    }

    public getRouter(): Router {
        return this.router;
    }
}
