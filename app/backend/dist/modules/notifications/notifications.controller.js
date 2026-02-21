"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
class NotificationsController {
    constructor(service, logger) {
        this.service = service;
        this.logger = logger;
        this.getMine = async (req, res) => {
            try {
                const profileId = req.user?.id || req.query.profileId;
                if (!profileId) {
                    res.status(400).json({ error: "Unauthorized or profileId missing" });
                    return;
                }
                const limit = parseInt(req.query.limit) || 20;
                const offset = parseInt(req.query.offset) || 0;
                const notifications = await this.service.getNotifications(profileId, limit, offset);
                res.json(notifications);
            }
            catch (error) {
                this.handleError(res, error, "GET_NOTIFICATIONS_ERROR");
            }
        };
        this.getUnreadCount = async (req, res) => {
            try {
                const profileId = req.user?.id || req.query.profileId;
                if (!profileId) {
                    res.status(400).json({ error: "Unauthorized or profileId missing" });
                    return;
                }
                const count = await this.service.getUnreadCount(profileId);
                res.json({ count });
            }
            catch (error) {
                this.handleError(res, error, "GET_UNREAD_COUNT_ERROR");
            }
        };
        this.markRead = async (req, res) => {
            try {
                const id = req.params.id;
                await this.service.markAsRead(id);
                res.json({ success: true });
            }
            catch (error) {
                this.handleError(res, error, "MARK_READ_ERROR");
            }
        };
        this.markAllRead = async (req, res) => {
            try {
                const profileId = req.user?.id || req.body.profileId;
                if (!profileId) {
                    res.status(400).json({ error: "Unauthorized or profileId missing" });
                    return;
                }
                await this.service.markAllAsRead(profileId);
                res.json({ success: true });
            }
            catch (error) {
                this.handleError(res, error, "MARK_ALL_READ_ERROR");
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = req.params.id;
                await this.service.deleteNotification(id);
                res.json({ success: true });
            }
            catch (error) {
                this.handleError(res, error, "DELETE_NOTIFICATION_ERROR");
            }
        };
    }
    handleError(res, error, context) {
        this.logger.instance.error(`[NotificationsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
exports.NotificationsController = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map