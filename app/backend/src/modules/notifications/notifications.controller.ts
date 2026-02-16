import { Request, Response } from "express";
import Logger from "../../infra/logger/winston";
import { NotificationsService } from "./notifications.services";

export class NotificationsController {
    constructor(
        private readonly service: NotificationsService,
        private readonly logger: Logger
    ) { }

    public getMine = async (req: Request, res: Response): Promise<void> => {
        try {
            const profileId = (req as any).user?.id || req.query.profileId;
            if (!profileId) {
                res.status(400).json({ error: "Unauthorized or profileId missing" });
                return;
            }

            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const notifications = await this.service.getNotifications(profileId, limit, offset);
            res.json(notifications);
        } catch (error) {
            this.handleError(res, error, "GET_NOTIFICATIONS_ERROR");
        }
    };

    public getUnreadCount = async (req: Request, res: Response): Promise<void> => {
        try {
            const profileId = (req as any).user?.id || req.query.profileId;
            if (!profileId) {
                res.status(400).json({ error: "Unauthorized or profileId missing" });
                return;
            }

            const count = await this.service.getUnreadCount(profileId);
            res.json({ count });
        } catch (error) {
            this.handleError(res, error, "GET_UNREAD_COUNT_ERROR");
        }
    };

    public markRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            await this.service.markAsRead(id);
            res.json({ success: true });
        } catch (error) {
            this.handleError(res, error, "MARK_READ_ERROR");
        }
    };

    public markAllRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const profileId = (req as any).user?.id || (req.body.profileId as string);
            if (!profileId) {
                res.status(400).json({ error: "Unauthorized or profileId missing" });
                return;
            }

            await this.service.markAllAsRead(profileId);
            res.json({ success: true });
        } catch (error) {
            this.handleError(res, error, "MARK_ALL_READ_ERROR");
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            await this.service.deleteNotification(id);
            res.json({ success: true });
        } catch (error) {
            this.handleError(res, error, "DELETE_NOTIFICATION_ERROR");
        }
    };

    private handleError(res: Response, error: any, context: string) {
        this.logger.instance.error(`[NotificationsController] ${context}: ${error}`);
        res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" });
    }
}
