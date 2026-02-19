import PostgresDatabase from "../../config/databases/configDB";
import Logger from "../../infra/logger/winston";
import { MentionsRepository } from "./mentions.repository";
import { MentionsService } from "./mentions.services";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { NotificationsModule } from "../notifications/notifications.module";

export class MentionsModule {
    private static serviceInstance: MentionsService | null = null;

    static getService(): MentionsService {
        if (!this.serviceInstance) {
            const db = new PostgresDatabase() as any;
            const logger = new Logger();
            const repository = new MentionsRepository(db, logger);
            const profilesRepository = new ProfilesRepository(db, logger);

            // Get notification service from NotificationsModule
            const notificationsModule = new NotificationsModule();
            const notificationsService = notificationsModule.getService();

            this.serviceInstance = new MentionsService(
                repository,
                profilesRepository,
                notificationsService,
                logger
            );
        }
        return this.serviceInstance;
    }
}
