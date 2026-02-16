import { BadRequestError, ConflictException, InternalServerError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import { User } from "../auth/auth.types";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { ExperiencesRepository } from "./experiences.repository";
import { CreateExperiencesDTO, ExperiencesDTO, TYPEJOB, TYPEPLACE, UpdateExperienceDTO } from "./experiences.types";

export class ExperiencesServices {
    constructor(
        private readonly experiencesRepository: ExperiencesRepository,
        private readonly authRepository: AuthRepository,
        private readonly profileRepository: ProfilesRepository,
        private readonly logger: Logger
    ) { }

    // CREATE EXPERIENCES
    async createExperiencesServices(dto: CreateExperiencesDTO): Promise<ExperiencesDTO> {
        try {
            // Verifier si le profile existe
            const profileExisting = await this.profileRepository.getProfileByUserId(dto.profile_id)
            if (!profileExisting) {
                throw new InternalServerError("Cet profile n'existe pas")
            }

            // Verfier si le profile appartient a l'utilisateur
            const user = await this.authRepository.findById(dto.profile_id)
            if (!user) {
                throw new ConflictException("Vous n'etes pas autoriser a creer l'experiences")
            }
            // Création de l'experiences 
            const createdExperience = await this.experiencesRepository.createExperiences({
                ...dto,
                start_date: dto.start_date,
                end_date: dto.end_date,
                type_job: dto.type_job || TYPEJOB.FIXED_TERM,
                type_place: dto.type_place || TYPEPLACE.FLEXIBLE,
                is_current: dto.is_current ?? false,
            });

            if (!createdExperience) {
                throw new InternalServerError("Erreur lors de la création de l'expérience");
            }

            return createdExperience;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error creating experience: ${error}`);
            throw new InternalServerError("Error creating experience");
        }
    }


    //  GET EXPERIENCES BY ID
    async getExperiencesById(id: string): Promise<ExperiencesDTO> {
        try {
            const experience = await this.experiencesRepository.getExperienceById(id)
            if (!experience) {
                throw new InternalServerError("Cette expérience n'existe pas")
            }
            return experience
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error getting experience: ${error}`);
            throw new InternalServerError("Error getting experience");
        }
    }

    // UPDATE EXPERIENCES
    async updateExperiencesServices(id: string, dto: UpdateExperienceDTO): Promise<ExperiencesDTO> {
        try {
            // Mise à jour de l'expérience
            const updatedExperience = await this.experiencesRepository.updateExperiences(id, dto);

            if (!updatedExperience) {
                throw new InternalServerError("Cette expérience n'existe pas ou erreur lors de la mise à jour");
            }

            return updatedExperience;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error updating experience: ${error}`);
            throw new InternalServerError("Error updating experience");
        }
    }

    // DELETE EXPERIENCES
    async deleteExperiencesServices(id: string): Promise<ExperiencesDTO | null> {
        try {
            const deletedExperience = await this.experiencesRepository.deleteExperiences(id);

            if (!deletedExperience) {
                throw new InternalServerError("Cette expérience n'existe pas ou erreur lors de la suppression");
            }

            return deletedExperience;
        } catch (error: any) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error deleting experience: ${error}`);
            throw new InternalServerError("Error deleting experience");
        }
    }

    // GET ALL EXPERIENCES BY PROFILE ID
    async getExperiencesByProfileId(profileId: string): Promise<ExperiencesDTO[]> {
        try {
            const experiences = await this.experiencesRepository.getAllExperiences(profileId);
            return experiences;
        } catch (error: any) {
            this.logger.instance.error(`Error getting all experiences for profile ${profileId}: ${error}`);
            throw new InternalServerError("Error getting experiences");
        }
    }
}