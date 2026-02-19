import Logger from "../../infra/logger/winston";
import { CertificationsRepository } from "./certifications.repository";
import { CreateCertificationDTO, CertificationDTO, UpdateCertificationDTO } from "./certifications.types";

export class CertificationsService {
    constructor(
        private readonly repository: CertificationsRepository,
        private readonly logger: Logger,
    ) { }

    async add(dto: CreateCertificationDTO): Promise<CertificationDTO | null> {
        return this.repository.create(dto);
    }

    async getByProfile(profileId: string): Promise<CertificationDTO[]> {
        return this.repository.getByProfileId(profileId);
    }

    async update(id: string, dto: UpdateCertificationDTO): Promise<CertificationDTO | null> {
        return this.repository.update(id, dto);
    }

    async remove(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
