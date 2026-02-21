"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const custom_errors_1 = require("../../errors/custom-errors");
class ProjectsService {
    constructor(repository, profileRepository) {
        this.logger = new winston_1.default();
        this.repository = repository;
        this.profileRepository = profileRepository;
    }
    async createProject(userId, dto) {
        try {
            // Validation user vs profile
            if (userId !== dto.profile_id) {
                this.logger.instance.warn(`User ${userId} attempted to create project for profile ${dto.profile_id}`);
                throw new custom_errors_1.ForbiddenError("Vous n'êtes pas autorisé à ajouter un projet à ce profil");
            }
            // Vérifier existence du profil
            const profile = await this.profileRepository.getProfileByUserId(dto.profile_id);
            if (!profile) {
                throw new custom_errors_1.NotFoundError("Profil introuvable");
            }
            const project = await this.repository.createProject(dto);
            if (!project) {
                throw new custom_errors_1.InternalServerError("Échec de la création du projet");
            }
            return project;
        }
        catch (error) {
            if (error instanceof custom_errors_1.ForbiddenError || error instanceof custom_errors_1.NotFoundError)
                throw error;
            this.logger.instance.error(`Error creating project: ${error}`);
            throw new custom_errors_1.InternalServerError("Erreur lors de la création du projet");
        }
    }
    async updateProject(userId, projectId, dto) {
        try {
            const existingProject = await this.repository.getProjectById(projectId);
            if (!existingProject) {
                throw new custom_errors_1.NotFoundError("Projet introuvable");
            }
            if (existingProject.profile_id !== userId) {
                throw new custom_errors_1.ForbiddenError("Vous n'êtes pas autorisé à modifier ce projet");
            }
            const updatedProject = await this.repository.updateProject(projectId, dto);
            if (!updatedProject) {
                throw new custom_errors_1.InternalServerError("Échec de la mise à jour du projet");
            }
            return updatedProject;
        }
        catch (error) {
            if (error instanceof custom_errors_1.ForbiddenError || error instanceof custom_errors_1.NotFoundError)
                throw error;
            this.logger.instance.error(`Error updating project ${projectId}: ${error}`);
            throw new custom_errors_1.InternalServerError("Erreur lors de la mise à jour du projet");
        }
    }
    async deleteProject(userId, projectId) {
        try {
            const existingProject = await this.repository.getProjectById(projectId);
            if (!existingProject) {
                throw new custom_errors_1.NotFoundError("Projet introuvable");
            }
            if (existingProject.profile_id !== userId) {
                throw new custom_errors_1.ForbiddenError("Vous n'êtes pas autorisé à supprimer ce projet");
            }
            return await this.repository.deleteProject(projectId);
        }
        catch (error) {
            if (error instanceof custom_errors_1.ForbiddenError || error instanceof custom_errors_1.NotFoundError)
                throw error;
            this.logger.instance.error(`Error deleting project ${projectId}: ${error}`);
            throw new custom_errors_1.InternalServerError("Erreur lors de la suppression du projet");
        }
    }
    async getProjectsByProfile(profileId) {
        return this.repository.getProjectsByProfileId(profileId);
    }
    async getProjectById(projectId) {
        const project = await this.repository.getProjectById(projectId);
        if (!project) {
            throw new custom_errors_1.NotFoundError("Projet introuvable");
        }
        return project;
    }
}
exports.ProjectsService = ProjectsService;
//# sourceMappingURL=projects.services.js.map