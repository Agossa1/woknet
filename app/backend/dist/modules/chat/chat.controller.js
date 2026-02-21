"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
class ChatController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
    }
    async getConversations(req, res) {
        try {
            const profileId = req.user?.id;
            const conversations = await this.service.getMyConversations(profileId);
            return res.json(conversations);
        }
        catch (error) {
            this.logger.instance.error("[ChatController] GET_CONVERSATIONS_ERROR", error);
            return res.status(500).json({ error: "Failed to fetch conversations" });
        }
    }
    async getMessages(req, res) {
        try {
            const profileId = req.user?.id;
            const { conversationId } = req.params;
            const { limit, offset } = req.query;
            const messages = await this.service.getMessages(conversationId, profileId, limit ? parseInt(String(limit)) : 50, offset ? parseInt(String(offset)) : 0);
            return res.json(messages);
        }
        catch (error) {
            this.logger.instance.error("[ChatController] GET_MESSAGES_ERROR", error);
            return res.status(500).json({ error: "Failed to fetch messages" });
        }
    }
    async sendMessage(req, res) {
        try {
            const profileId = req.user?.id;
            const { conversationId, content, type, metadata } = req.body;
            if (!content) {
                return res.status(400).json({ error: "Content is required" });
            }
            const message = await this.service.sendMessage({
                conversation_id: conversationId,
                sender_id: profileId,
                content,
                type,
                metadata
            });
            return res.status(201).json(message);
        }
        catch (error) {
            this.logger.instance.error("[ChatController] SEND_MESSAGE_ERROR", error);
            return res.status(500).json({ error: "Failed to send message" });
        }
    }
    async startConversation(req, res) {
        try {
            const profileId = req.user?.id;
            const { targetProfileId } = req.body;
            if (!targetProfileId) {
                return res.status(400).json({ error: "Target profile ID is required" });
            }
            const conversation = await this.service.startConversation(profileId, targetProfileId);
            return res.status(201).json(conversation);
        }
        catch (error) {
            this.logger.instance.error("[ChatController] START_CONVERSATION_ERROR", error);
            return res.status(500).json({ error: "Failed to start conversation" });
        }
    }
    async markRead(req, res) {
        try {
            const profileId = req.user?.id;
            const { conversationId } = req.params;
            await this.service.markRead(conversationId, profileId);
            return res.json({ success: true });
        }
        catch (error) {
            this.logger.instance.error("[ChatController] MARK_READ_ERROR", error);
            return res.status(500).json({ error: "Failed to mark as read" });
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map