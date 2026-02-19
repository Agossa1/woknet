import { Router } from "express";
import { FeaturedContentController } from "./featured-content.controller";

export const FeaturedContentRoutes = (controller: FeaturedContentController): Router => {
    const router = Router();
    router.post("/", controller.add);
    router.get("/profile/:profileId", controller.list);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    return router;
};
