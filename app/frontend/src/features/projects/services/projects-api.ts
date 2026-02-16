import { ApiClient, api } from "../../api/apiClients";
import { CreateProjectDTO, Project, UpdateProjectDTO } from "./projects-types";

export class ProjectsServices {
    private readonly BASE_PATH = "/projects";

    constructor(private apiClient: ApiClient) { }

    // Get all projects for a specific profile
    public async getProjectsByProfileId(profileId: string) {
        const response = await this.apiClient.get<{ success: boolean; data: Project[] }>(
            `${this.BASE_PATH}/profile/${profileId}`
        );
        return response.data;
    }

    // Create a new project
    public async createProject(data: CreateProjectDTO) {
        const response = await this.apiClient.post<{ success: boolean; data: Project }>(
            this.BASE_PATH,
            data
        );
        return response.data;
    }

    // Update an existing project
    public async updateProject(data: UpdateProjectDTO) {
        const { id, ...updateData } = data;
        const response = await this.apiClient.put<{ success: boolean; data: Project }>(
            `${this.BASE_PATH}/${id}`,
            updateData
        );
        return response.data;
    }

    // Delete a project
    public async deleteProject(id: string) {
        await this.apiClient.delete(
            `${this.BASE_PATH}/${id}`
        );
    }

    public async uploadProjectThumbnail(file: File) {
        const formData = new FormData();
        formData.append('type', 'project');
        formData.append('file', file);

        return this.apiClient.post<{ success: boolean; data: { url: string } }>(
            `/uploads/profile-image`,
            formData
        );
    }
}

export const projectsApi = new ProjectsServices(api);
