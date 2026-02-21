"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationsServices = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
const educations_types_1 = require("./educations.types");
class EducationsServices {
    constructor(educationsRepository, authRepository, profileRepository, logger) {
        this.educationsRepository = educationsRepository;
        this.authRepository = authRepository;
        this.profileRepository = profileRepository;
        this.logger = logger;
    }
    // CREATE EDUCATION
    async createEducationService(dto) {
        try {
            // Vérifier si le profil existe
            const profileExisting = await this.profileRepository.getProfileByUserId(dto.profile_id);
            if (!profileExisting) {
                throw new custom_errors_1.InternalServerError("Ce profil n'existe pas");
            }
            // Vérifier si le profil appartient à l'utilisateur
            const user = await this.authRepository.findById(dto.profile_id);
            if (!user) {
                throw new custom_errors_1.ConflictException("Vous n'êtes pas autorisé à créer cette éducation");
            }
            // Création de l'éducation
            const createdEducation = await this.educationsRepository.createEducation({
                ...dto,
                start_date: dto.start_date,
                end_date: dto.end_date,
                degree: dto.degree || educations_types_1.DEGREE_LEVEL.BACHELOR,
                is_current: dto.is_current ?? false,
            });
            if (!createdEducation) {
                throw new custom_errors_1.InternalServerError("Erreur lors de la création de l'éducation");
            }
            return createdEducation;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error creating education: ${error}`);
            throw new custom_errors_1.InternalServerError("Error creating education");
        }
    }
    // GET EDUCATION BY ID
    async getEducationById(id) {
        try {
            const education = await this.educationsRepository.getEducationById(id);
            if (!education) {
                throw new custom_errors_1.InternalServerError("Cette éducation n'existe pas");
            }
            return education;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error getting education: ${error}`);
            throw new custom_errors_1.InternalServerError("Error getting education");
        }
    }
    // UPDATE EDUCATION
    async updateEducationService(id, dto) {
        try {
            // Mise à jour de l'éducation
            const updatedEducation = await this.educationsRepository.updateEducation(id, dto);
            if (!updatedEducation) {
                throw new custom_errors_1.InternalServerError("Cette éducation n'existe pas ou erreur lors de la mise à jour");
            }
            return updatedEducation;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error updating education: ${error}`);
            throw new custom_errors_1.InternalServerError("Error updating education");
        }
    }
    // DELETE EDUCATION
    async deleteEducationService(id) {
        try {
            const deletedEducation = await this.educationsRepository.deleteEducation(id);
            if (!deletedEducation) {
                throw new custom_errors_1.InternalServerError("Cette éducation n'existe pas ou erreur lors de la suppression");
            }
            return deletedEducation;
        }
        catch (error) {
            if (error.statusCode) {
                throw error;
            }
            this.logger.instance.error(`Error deleting education: ${error}`);
            throw new custom_errors_1.InternalServerError("Error deleting education");
        }
    }
    // GET ALL EDUCATIONS BY PROFILE ID
    async getEducationsByProfileId(profileId) {
        try {
            const educations = await this.educationsRepository.getAllEducations(profileId);
            return educations;
        }
        catch (error) {
            this.logger.instance.error(`Error getting all educations for profile ${profileId}: ${error}`);
            throw new custom_errors_1.InternalServerError("Error getting educations");
        }
    }
}
exports.EducationsServices = EducationsServices;
//# sourceMappingURL=educations.services.js.map