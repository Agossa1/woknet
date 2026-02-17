import { api } from "../../api/apiClients";
import { Job, CreateJobDTO, UpdateJobDTO, GenerateDescriptionDTO, GeneratedJobDescription } from "./jobs-types";

export interface JobResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const jobsApi = {
    getAllJobs: (filters?: { status?: string; is_remote?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.is_remote !== undefined) params.append('is_remote', String(filters.is_remote));

        const queryString = params.toString();
        return api.get<JobResponse<Job[]>>(`/jobs${queryString ? '?' + queryString : ''}`);
    },

    getJobById: (id: string) =>
        api.get<JobResponse<Job>>(`/jobs/${id}`),

    getJobBySlug: (slug: string) =>
        api.get<JobResponse<Job>>(`/jobs/slug/${slug}`),

    getJobsByCompany: (companyId: string) =>
        api.get<JobResponse<Job[]>>(`/jobs/company/${companyId}`),

    createJob: (dto: CreateJobDTO) =>
        api.post<JobResponse<Job>>("/jobs", dto),

    updateJob: (id: string, dto: UpdateJobDTO) =>
        api.put<JobResponse<Job>>(`/jobs/${id}`, dto),

    deleteJob: (id: string) =>
        api.delete<JobResponse<void>>(`/jobs/${id}`),

    generateDescription: (dto: GenerateDescriptionDTO) =>
        api.post<JobResponse<GeneratedJobDescription>>("/jobs/generate/description", dto),
};
