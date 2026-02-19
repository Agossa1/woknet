import Logger from "../../infra/logger/winston";
import { LanguagesRepository } from "./languages.repository";
import { CreateLanguageDTO, LanguageDTO, UpdateLanguageDTO } from "./languages.types";

export class LanguagesService {
    constructor(
        private readonly repository: LanguagesRepository,
        private readonly logger: Logger,
    ) { }

    async addLanguage(dto: CreateLanguageDTO): Promise<LanguageDTO | null> {
        return this.repository.createLanguage(dto);
    }

    async getProfileLanguages(profileId: string): Promise<LanguageDTO[]> {
        return this.repository.getLanguagesByProfileId(profileId);
    }

    async updateLanguage(id: string, dto: UpdateLanguageDTO): Promise<LanguageDTO | null> {
        return this.repository.updateLanguage(id, dto);
    }

    async removeLanguage(id: string): Promise<boolean> {
        return this.repository.deleteLanguage(id);
    }
}
