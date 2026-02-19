import Logger from "../../infra/logger/winston";
import { FeaturedContentRepository } from "./featured-content.repository";
import { CreateFeaturedContentDTO, FeaturedContentDTO, UpdateFeaturedContentDTO } from "./featured-content.types";

export class FeaturedContentService {
    constructor(
        private readonly repository: FeaturedContentRepository,
        private readonly logger: Logger,
    ) { }

    async add(dto: CreateFeaturedContentDTO): Promise<FeaturedContentDTO | null> {
        return this.repository.create(dto);
    }

    async getByProfile(profileId: string): Promise<FeaturedContentDTO[]> {
        return this.repository.getByProfileId(profileId);
    }

    async update(id: string, dto: UpdateFeaturedContentDTO): Promise<FeaturedContentDTO | null> {
        return this.repository.update(id, dto);
    }

    async remove(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
