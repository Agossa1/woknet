import { Router } from "express";
import { FollowsController } from "./follows.controller";
import { AuthGuard } from "../../infra/middleware/auth.middleware";

export const followsRoutes = (controller: FollowsController) => {
    const router = Router();

    // Toggle follow/unfollow
    router.post("/toggle", AuthGuard.authenticate, (req, res) => controller.toggleFollow(req, res));

    // Check follow status
    router.get("/status/:profileId", AuthGuard.authenticate, (req, res) => controller.checkStatus(req, res));

    // Get followers of a profile
    router.get("/followers/:profileId", AuthGuard.optionalAuthenticate, (req, res) => controller.getFollowers(req, res));

    // Get profiles followed by a profile
    router.get("/following/:profileId", AuthGuard.optionalAuthenticate, (req, res) => controller.getFollowing(req, res));

    // Get counts
    router.get("/counts/:profileId", (req, res) => controller.getCounts(req, res));

    return router;
};
