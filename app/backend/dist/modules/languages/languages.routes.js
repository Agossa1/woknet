"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguagesRoutes = void 0;
const express_1 = require("express");
const LanguagesRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post("/", controller.addLanguage);
    router.get("/profile/:profileId", controller.getLanguages);
    router.put("/:id", controller.updateLanguage);
    router.delete("/:id", controller.deleteLanguage);
    return router;
};
exports.LanguagesRoutes = LanguagesRoutes;
//# sourceMappingURL=languages.routes.js.map