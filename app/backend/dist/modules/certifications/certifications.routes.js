"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationsRoutes = void 0;
const express_1 = require("express");
const CertificationsRoutes = (controller) => {
    const router = (0, express_1.Router)();
    router.post("/", controller.add);
    router.get("/profile/:profileId", controller.list);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.delete);
    return router;
};
exports.CertificationsRoutes = CertificationsRoutes;
//# sourceMappingURL=certifications.routes.js.map