"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturedContentRoutes = void 0;
const express_1 = require("express");
const FeaturedContentRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post("/", controller.add);
    router.get("/profile/:profileId", controller.list);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    return router;
};
exports.FeaturedContentRoutes = FeaturedContentRoutes;
//# sourceMappingURL=featured-content.routes.js.map