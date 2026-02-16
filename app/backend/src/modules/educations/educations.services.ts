import { BadRequestError, ConflictException, InternalServerError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { EducationsRepository } from "./educations.repository";
import { CreateEducationsDTO, EducationsDTO, DEGREE_LEVEL, UpdateEducationDTO } from "./educations.types";

export class EducationsServices {
    constructor(
        private readonly educationsRepository: EducationsRepository,
        private readonly authRepository: AuthRepository,
        private readonly profileRepository: ProfilesRepository,
        private readonly logger: Logger
    ) { }

    // CREATE EDUCATION
    async createEducationService(dto: CreateEducationsDTO): Promise<EducationsDTO> {
        try {
            // Vérifier si le profil existe
            const profileExisting = await this.profileRepository.getProfileByUserId(dto.profile_id)
            if (!profileExisting) {
                throw new InternalServerError("Ce profil n'existe pas")
            }

            // Vérifier si le profil appartient à l'utilisateur
            const user = await this.authRepository.findById(dto.profile_id)
            if (!user) {
                throw new ConflictException("Vous n'êtes pas autorisé à créer cette éducation")
            }

            // Création de l'éducation
            const createdEducation = await this.educationsRepository.createEducation({
                ...dto,
                start_date: dto.start_date,
                end_date: dto.end_date,
                degree: dto.degree || DEGREE_LEVEL.BACHELOR,
                is_current: dto.is_current ?? false,
            });

            if (!createdEducation) {
                throw new InternalServerError("Erreur lors de la création de l'éducation");
            }

            return createdEducation;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error creating education: ${error}`);
            throw new InternalServerError("Error creating education");
        }
    }

    // GET EDUCATION BY ID
    async getEducationById(id: string): Promise<EducationsDTO> {
        try {
            const education = await this.educationsRepository.getEducationById(id)
            if (!education) {
                throw new InternalServerError("Cette éducation n'existe pas")
            }
            return education
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error getting education: ${error}`);
            throw new InternalServerError("Error getting education");
        }
    }

    // UPDATE EDUCATION
    async updateEducationService(id: string, dto: UpdateEducationDTO): Promise<EducationsDTO> {
        try {
            // Mise à jour de l'éducation
            const updatedEducation = await this.educationsRepository.updateEducation(id, dto);

            if (!updatedEducation) {
                throw new InternalServerError("Cette éducation n'existe pas ou erreur lors de la mise à jour");
            }

            return updatedEducation;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error updating education: ${error}`);
            throw new InternalServerError("Error updating education");
        }
    }

    // DELETE EDUCATION
    async deleteEducationService(id: string): Promise<EducationsDTO | null> {
        try {
            const deletedEducation = await this.educationsRepository.deleteEducation(id);

            if (!deletedEducation) {
                throw new InternalServerError("Cette éducation n'existe pas ou erreur lors de la suppression");
            }

            return deletedEducation;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error deleting education: ${error}`);
            throw new InternalServerError("Error deleting education");
        }
    }

    // GET ALL EDUCATIONS BY PROFILE ID
    async getEducationsByProfileId(profileId: string): Promise<EducationsDTO[]> {
        try {
            const educations = await this.educationsRepository.getAllEducations(profileId);
            return educations;
        } catch (error: any) {
            this.logger.instance.error(`Error getting all educations for profile ${profileId}: ${error}`);
            throw new InternalServerError("Error getting educations");
        }
    }
}
