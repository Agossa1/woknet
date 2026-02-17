import { Post } from "../posts/posts.types";

export interface SavedPost {
    id: string;
    profile_id: string;
    post_id: string;
    created_at: Date | string;
    post?: Post; // Optionnel, pour quand on récupère avec les détails du post
}

export interface ToggleSavePostDTO {
    profile_id: string;
    post_id: string;
}
