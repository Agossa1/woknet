"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesServices = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class ProfilesServices {
    constructor(profilesRepository, authRepository, logger) {
        this.profilesRepository = profilesRepository;
        this.authRepository = authRepository;
        this.logger = logger;
    }
    // Récupérer le profil d'un utilisateur par son ID
    async getProfileByUserId(userId) {
        try {
            // Verifer si l'utilisateur existe
            const user = await this.authRepository.findById(userId);
            if (!user) {
                this.logger.instance.info(`[ProfilesServices] User with ID ${userId} not found`);
                return null;
            }
            // Récupérer les données de profil
            const profile = await this.profilesRepository.getProfileByUserId(userId);
            if (!profile) {
                this.logger.instance.info(`[ProfilesServices] Profile for User ID ${userId} not found`);
                return null;
            }
            // Combiner les données de l'utilisateur et du profil
            return {
                ...user,
                ...profile
            };
        }
        catch (error) {
            this.logger.instance.error(`[ProfilesServices] Error fetching profile for User ID ${userId}`, error);
            throw new custom_errors_1.BadRequestError("Failed to fetch profile");
        }
    }
    async updateProfileService(profileData) {
        try {
            // Vérifier si l'utilisateur existe
            const user = await this.authRepository.findById(profileData.user_id);
            if (!user) {
                this.logger.instance.warn(`[ProfilesServices] User with ID ${profileData.user_id} not found`);
                throw new custom_errors_1.ConflictException("User not found");
            }
            // Mettre à jour le profil 
            const updatedProfile = await this.profilesRepository.updateProfile(profileData);
            // Combiner les données de l'utilisateur et du profil mis à jour
            return {
                ...user,
                ...updatedProfile
            };
        }
        catch (error) {
            this.logger.instance.error(`[ProfilesServices] Error updating profile for User ID ${profileData.user_id}`, error);
            throw new custom_errors_1.BadRequestError("Failed to update profile");
        }
    }
    async searchProfilesService(query, limit = 10) {
        try {
            if (!query || query.trim().length === 0)
                return [];
            return await this.profilesRepository.searchProfiles(query, limit);
        }
        catch (error) {
            this.logger.instance.error("[ProfilesServices] Error searching profiles", error);
            throw new custom_errors_1.BadRequestError("Failed to search profiles");
        }
    }
    async getRecommendedProfiles(userId) {
        try {
            return await this.profilesRepository.getRecommendedProfiles(userId);
        }
        catch (error) {
            this.logger.instance.error(`[ProfilesServices] Error fetching recommendations for ${userId}`, error);
            return [];
        }
    }
}
exports.ProfilesServices = ProfilesServices;
//# sourceMappingURL=profiles.services.js.map