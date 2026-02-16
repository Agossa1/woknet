import { Router } from "express";
import { ChatController } from "./chat.controller";
import { AuthGuard, SecureRequest } from "../../infra/middleware/auth.middleware";

export const chatRoutes = (controller: ChatController) => {
    const router = Router();

    // All chat routes require authentication
    router.use((req, res, next) => AuthGuard.authenticate(req as SecureRequest, res, next));

    router.get("/conversations", (req, res) => controller.getConversations(req, res));
    router.post("/conversations", (req, res) => controller.startConversation(req, res));
    router.get("/conversations/:conversationId/messages", (req, res) => controller.getMessages(req, res));
    router.post("/messages", (req, res) => controller.sendMessage(req, res));
    router.patch("/conversations/:conversationId/read", (req, res) => controller.markRead(req, res));

    return router;
};
