import  Logger  from "../../infra/logger/winston";
import { CreateProjectDTO, ProjectDTO, UpdateProjectDTO } from "./projects.types";
import { ProjectsRepository } from "./projects.repository";
import { ProfilesRepository } from "../profiles/profiles.repository";
import { NotFoundError, ForbiddenError, InternalServerError } from "../../errors/custom-errors";

export class ProjectsService {
    private logger: Logger;
    private repository: ProjectsRepository;
    private profileRepository: ProfilesRepository;

    constructor(repository: ProjectsRepository, profileRepository: ProfilesRepository) {
        this.logger = new Logger();
        this.repository = repository;
        this.profileRepository = profileRepository;
    }

    async createProject(userId: string, dto: CreateProjectDTO): Promise<ProjectDTO> {
        try {
            // Validation user vs profile
            if (userId !== dto.profile_id) {
                this.logger.instance.warn(`User ${userId} attempted to create project for profile ${dto.profile_id}`);
                throw new ForbiddenError("Vous n'êtes pas autorisé à ajouter un projet à ce profil");
            }

            // Vérifier existence du profil
            const profile = await this.profileRepository.getProfileByUserId(dto.profile_id);
            if (!profile) {
                throw new NotFoundError("Profil introuvable");
            }

            const project = await this.repository.createProject(dto);
            if (!project) {
                throw new InternalServerError("Échec de la création du projet");
            }
            return project;
        } catch (error) {
            if (error instanceof ForbiddenError || error instanceof NotFoundError) throw error;
            this.logger.instance.error(`Error creating project: ${error}`);
            throw new InternalServerError("Erreur lors de la création du projet");
        }
    }

    async updateProject(userId: string, projectId: string, dto: UpdateProjectDTO): Promise<ProjectDTO> {
        try {
            const existingProject = await this.repository.getProjectById(projectId);
            if (!existingProject) {
                throw new NotFoundError("Projet introuvable");
            }

            if (existingProject.profile_id !== userId) {
                throw new ForbiddenError("Vous n'êtes pas autorisé à modifier ce projet");
            }

            const updatedProject = await this.repository.updateProject(projectId, dto);
            if (!updatedProject) {
                throw new InternalServerError("Échec de la mise à jour du projet");
            }
            return updatedProject;
        } catch (error) {
            if (error instanceof ForbiddenError || error instanceof NotFoundError) throw error;
            this.logger.instance.error(`Error updating project ${projectId}: ${error}`);
            throw new InternalServerError("Erreur lors de la mise à jour du projet");
        }
    }

    async deleteProject(userId: string, projectId: string): Promise<boolean> {
        try {
            const existingProject = await this.repository.getProjectById(projectId);
            if (!existingProject) {
                throw new NotFoundError("Projet introuvable");
            }

            if (existingProject.profile_id !== userId) {
                throw new ForbiddenError("Vous n'êtes pas autorisé à supprimer ce projet");
            }

            return await this.repository.deleteProject(projectId);
        } catch (error) {
            if (error instanceof ForbiddenError || error instanceof NotFoundError) throw error;
            this.logger.instance.error(`Error deleting project ${projectId}: ${error}`);
            throw new InternalServerError("Erreur lors de la suppression du projet");
        }
    }

    async getProjectsByProfile(profileId: string): Promise<ProjectDTO[]> {
        return this.repository.getProjectsByProfileId(profileId);
    }

    async getProjectById(projectId: string): Promise<ProjectDTO> {
        const project = await this.repository.getProjectById(projectId);
        if (!project) {
            throw new NotFoundError("Projet introuvable");
        }
        return project;
    }
}
