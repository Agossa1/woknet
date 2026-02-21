"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const chatRoutes = (controller) => {
    const router = (0, express_1.Router)();
    // All chat routes require authentication
    router.use((req, res, next) => auth_middleware_1.AuthGuard.authenticate(req, res, next));
    router.get("/conversations", (req, res) => controller.getConversations(req, res));
    router.post("/conversations", (req, res) => controller.startConversation(req, res));
    router.get("/conversations/:conversationId/messages", (req, res) => controller.getMessages(req, res));
    router.post("/messages", (req, res) => controller.sendMessage(req, res));
    router.patch("/conversations/:conversationId/read", (req, res) => controller.markRead(req, res));
    return router;
};
exports.chatRoutes = chatRoutes;
//# sourceMappingURL=chat.routes.js.map