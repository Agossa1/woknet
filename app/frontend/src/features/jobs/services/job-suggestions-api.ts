import { api } from "../../api/apiClients";

export interface JobTitleSuggestion {
    id: number;
    title: string;
    category: string;
    popularity: number;
}

export interface WorkLocationSuggestion {
    id: number;
    city: string;
    region: string;
    country: string;
    country_code: string;
    full_location: string;
    popularity: number;
}

export interface SuggestionResponse<T> {
    success: boolean;
    data: T[];
}

export const jobSuggestionsApi = {
    getTitles: (search: string, limit: number = 10) =>
        api.get<SuggestionResponse<JobTitleSuggestion>>(`/jobs/suggestions/titles?search=${encodeURIComponent(search)}&limit=${limit}`),

    getLocations: (search: string, limit: number = 10) =>
        api.get<SuggestionResponse<WorkLocationSuggestion>>(`/jobs/suggestions/locations?search=${encodeURIComponent(search)}&limit=${limit}`),

    getCategories: () =>
        api.get<SuggestionResponse<{ category: string; count: number }>>('/jobs/suggestions/categories'),
};
