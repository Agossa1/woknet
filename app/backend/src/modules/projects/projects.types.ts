export enum ProjectLinkType {
    GITHUB = 'GITHUB',
    GITLAB = 'GITLAB',
    BITBUCKET = 'BITBUCKET',
    BEHANCE = 'BEHANCE',
    DRIBBBLE = 'DRIBBBLE',
    LINKEDIN = 'LINKEDIN',
    YOUTUBE = 'YOUTUBE',
    VIMEO = 'VIMEO',
    WEBSITE = 'WEBSITE',
    OTHER = 'OTHER'
}

export interface ProjectDTO {
    id: string;
    profile_id: string;
    category_id?: string | null;
    title: string;
    description?: string;
    presentation_url: string;
    link_platform: ProjectLinkType;
    repository_url?: string;
    thumbnail_url?: string;
    is_ongoing: boolean;
    start_date?: string | Date;
    completion_date?: string | Date | null;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export interface CreateProjectDTO {
    profile_id: string;
    category_id?: string | null;
    title: string;
    description?: string;
    presentation_url: string;
    link_platform?: ProjectLinkType; // Default 'OTHER'
    repository_url?: string | null;
    thumbnail_url?: string | null;
    is_ongoing?: boolean; // Default false
    start_date?: string | Date | null;
    completion_date?: string | Date | null;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> { }

export interface ProjectState {
    projects: ProjectDTO[];
    isLoading: boolean;
    error: string | null;
}
