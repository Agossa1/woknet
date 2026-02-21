"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionsModule = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const mentions_repository_1 = require("./mentions.repository");
const mentions_services_1 = require("./mentions.services");
const profiles_repository_1 = require("../profiles/profiles.repository");
const notifications_module_1 = require("../notifications/notifications.module");
class MentionsModule {
    static getService() {
        if (!this.serviceInstance) {
            const db = new configDB_1.default();
            const logger = new winston_1.default();
            const repository = new mentions_repository_1.MentionsRepository(db, logger);
            const profilesRepository = new profiles_repository_1.ProfilesRepository(db, logger);
            // Get notification service from NotificationsModule
            const notificationsModule = new notifications_module_1.NotificationsModule();
            const notificationsService = notificationsModule.getService();
            this.serviceInstance = new mentions_services_1.MentionsService(repository, profilesRepository, notificationsService, logger);
        }
        return this.serviceInstance;
    }
}
exports.MentionsModule = MentionsModule;
MentionsModule.serviceInstance = null;
//# sourceMappingURL=mentions.module.js.map