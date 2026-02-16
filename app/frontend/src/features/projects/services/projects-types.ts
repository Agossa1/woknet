export enum ProjectLinkType {
    GITHUB = 'GITHUB',
    GITLAB = 'GITLAB',
    BITBUCKET = 'BITBUCKET',
    BEHANCE = 'BEHANCE',
    DRIBBBLE = 'DRIBBBLE',
    LINKEDIN = 'LINKEDIN',
    YOUTUBE = 'YOUTUBE',
    VIMEO = 'VIMEO',
    FIGMA = 'FIGMA',
    CANVA = 'CANVA',
    NOTION = 'NOTION',
    MEDIUM = 'MEDIUM',
    WEBSITE = 'WEBSITE',
    OTHER = 'OTHER'
}

export const LINK_PLATFORM_LABELS: Record<ProjectLinkType, string> = {
    [ProjectLinkType.GITHUB]: 'GitHub',
    [ProjectLinkType.GITLAB]: 'GitLab',
    [ProjectLinkType.BITBUCKET]: 'Bitbucket',
    [ProjectLinkType.BEHANCE]: 'Behance',
    [ProjectLinkType.DRIBBBLE]: 'Dribbble',
    [ProjectLinkType.FIGMA]: 'Figma',
    [ProjectLinkType.CANVA]: 'Canva',
    [ProjectLinkType.NOTION]: 'Notion',
    [ProjectLinkType.MEDIUM]: 'Medium',
    [ProjectLinkType.LINKEDIN]: 'LinkedIn',
    [ProjectLinkType.YOUTUBE]: 'YouTube',
    [ProjectLinkType.VIMEO]: 'Vimeo',
    [ProjectLinkType.WEBSITE]: 'Site Web',
    [ProjectLinkType.OTHER]: 'Autre',
};

export interface Project {
    id: string;
    profile_id: string;
    category_id?: string | null;
    title: string;
    description?: string;
    presentation_url: string;
    link_platform?: ProjectLinkType;
    repository_url?: string;
    thumbnail_url?: string;
    is_ongoing?: boolean;
    start_date?: string | Date;
    completion_date?: string | Date | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreateProjectDTO {
    title: string;
    description?: string;
    presentation_url: string;
    link_platform?: ProjectLinkType;
    repository_url?: string;
    thumbnail_url?: string;
    is_ongoing?: boolean;
    start_date?: string;
    completion_date?: string;
    profile_id: string;
}

export interface UpdateProjectDTO extends Partial<Omit<CreateProjectDTO, 'profile_id'>> {
    id: string;
}
