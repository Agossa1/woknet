import { BadRequestError, ConflictException } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { AuthRepository } from "../auth/auth.repository";
import { User } from "../auth/auth.types";
import { ProfilesRepository } from "./profiles.repository";
import { ProfileData, UpdateProfileDTO } from "./profiles.types";





export class ProfilesServices {
    constructor(
        private readonly profilesRepository: ProfilesRepository,
        private readonly authRepository: AuthRepository,
        private readonly logger: Logger
    ) { }

    // Récupérer le profil d'un utilisateur par son ID
    async getProfileByUserId(userId: string): Promise<User | null> {
        try {
            // Verifer si l'utilisateur existe
            const user = await this.authRepository.findById(userId);
            if (!user) {
                this.logger.instance.warn(`[ProfilesServices] User with ID ${userId} not found`);
                throw new ConflictException("User not found");
            }
            // Récupérer les données de profil

            const profile = await this.profilesRepository.getProfileByUserId(userId);
            if (!profile) {
                this.logger.instance.warn(`[ProfilesServices] Profile for User ID ${userId} not found`);
                throw new ConflictException("Profile not found");
            }
            // Combiner les données de l'utilisateur et du profil
            return {
                ...user,
                ...profile
            } as any;
        } catch (error) {
            this.logger.instance.error(`[ProfilesServices] Error fetching profile for User ID ${userId}`, error);
            throw new BadRequestError("Failed to fetch profile");
        }
    }

    async updateProfileService(profileData: UpdateProfileDTO): Promise<User> {
        try {
            // Vérifier si l'utilisateur existe
            const user = await this.authRepository.findById(profileData.user_id);
            if (!user) {
                this.logger.instance.warn(`[ProfilesServices] User with ID ${profileData.user_id} not found`);
                throw new ConflictException("User not found");
            }
            // Mettre à jour le profil 
            const updatedProfile = await this.profilesRepository.updateProfile(profileData);
            // Combiner les données de l'utilisateur et du profil mis à jour
            return {
                ...user,
                ...updatedProfile
            } as any;
        } catch (error) {
            this.logger.instance.error(`[ProfilesServices] Error updating profile for User ID ${profileData.user_id}`, error);
            throw new BadRequestError("Failed to update profile");
        }
    }
}