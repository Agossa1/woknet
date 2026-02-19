import { Router } from "express";
import { CertificationsController } from "./certifications.controller";

export const CertificationsRoutes = (controller: CertificationsController): Router => {
    const router = Router();
    router.post("/", controller.add);
    router.get("/profile/:profileId", controller.list);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    return router;
};
