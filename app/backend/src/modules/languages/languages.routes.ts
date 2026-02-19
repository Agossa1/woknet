import { Router } from "express";
import { LanguagesController } from "./languages.controller";

export const LanguagesRoutes = (controller: LanguagesController): Router => {
    const router = Router();

    router.post("/", controller.addLanguage);
    router.get("/profile/:profileId", controller.getLanguages);
    router.put("/:id", controller.updateLanguage);
    router.delete("/:id", controller.deleteLanguage);

    return router;
};
