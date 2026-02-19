import { IDatabase } from "./certifications.types";
import Logger from "../../infra/logger/winston";
import { CertificationsRepository } from "./certifications.repository";
import { CertificationsService } from "./certifications.service";
import { CertificationsController } from "./certifications.controller";
import { CertificationsRoutes } from "./certifications.routes";
import { Router } from "express";

export class CertificationsModule {
    static init(db: IDatabase, logger: Logger): Router {
        const repository = new CertificationsRepository(db, logger);
        const service = new CertificationsService(repository, logger);
        const controller = new CertificationsController(service, logger);
        return CertificationsRoutes(controller);
    }
}
