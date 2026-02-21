"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesServices = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
const experiences_types_1 = require("./experiences.types");
class ExperiencesServices {
    constructor(experiencesRepository, authRepository, profileRepository, logger) {
        this.experiencesRepository = experiencesRepository;
        this.authRepository = authRepository;
        this.profileRepository = profileRepository;
        this.logger = logger;
    }
    // CREATE EXPERIENCES
    async createExperiencesServices(dto) {
        try {
            // Verifier si le profile existe
            const profileExisting = await this.profileRepository.getProfileByUserId(dto.profile_id);
            if (!profileExisting) {
                throw new custom_errors_1.InternalServerError("Cet profile n'existe pas");
            }
            // Verfier si le profile appartient a l'utilisateur
            const user = await this.authRepository.findById(dto.profile_id);
            if (!user) {
                throw new custom_errors_1.ConflictException("Vous n'etes pas autoriser a creer l'experiences");
            }
            // Création de l'experiences 
            const createdExperience = await this.experiencesRepository.createExperiences({
                ...dto,
                start_date: dto.start_date,
                end_date: dto.end_date,
                type_job: dto.type_job || experiences_types_1.TYPEJOB.FIXED_TERM,
                type_place: dto.type_place || experiences_types_1.TYPEPLACE.FLEXIBLE,
                is_current: dto.is_current ?? false,
            });
            if (!createdExperience) {
                throw new custom_errors_1.InternalServerError("Erreur lors de la création de l'expérience");
            }
            return createdExperience;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error creating experience: ${error}`);
            throw new custom_errors_1.InternalServerError("Error creating experience");
        }
    }
    //  GET EXPERIENCES BY ID
    async getExperiencesById(id) {
        try {
            const experience = await this.experiencesRepository.getExperienceById(id);
            if (!experience) {
                throw new custom_errors_1.InternalServerError("Cette expérience n'existe pas");
            }
            return experience;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error getting experience: ${error}`);
            throw new custom_errors_1.InternalServerError("Error getting experience");
        }
    }
    // UPDATE EXPERIENCES
    async updateExperiencesServices(id, dto) {
        try {
            // Mise à jour de l'expérience
            const updatedExperience = await this.experiencesRepository.updateExperiences(id, dto);
            if (!updatedExperience) {
                throw new custom_errors_1.InternalServerError("Cette expérience n'existe pas ou erreur lors de la mise à jour");
            }
            return updatedExperience;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error updating experience: ${error}`);
            throw new custom_errors_1.InternalServerError("Error updating experience");
        }
    }
    // DELETE EXPERIENCES
    async deleteExperiencesServices(id) {
        try {
            const deletedExperience = await this.experiencesRepository.deleteExperiences(id);
            if (!deletedExperience) {
                throw new custom_errors_1.InternalServerError("Cette expérience n'existe pas ou erreur lors de la suppression");
            }
            return deletedExperience;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error deleting experience: ${error}`);
            throw new custom_errors_1.InternalServerError("Error deleting experience");
        }
    }
    // GET ALL EXPERIENCES BY PROFILE ID
    async getExperiencesByProfileId(profileId) {
        try {
            const experiences = await this.experiencesRepository.getAllExperiences(profileId);
            return experiences;
        }
        catch (error) {
            this.logger.instance.error(`Error getting all experiences for profile ${profileId}: ${error}`);
            throw new custom_errors_1.InternalServerError("Error getting experiences");
        }
    }
}
exports.ExperiencesServices = ExperiencesServices;
//# sourceMappingURL=experiences.services.js.map