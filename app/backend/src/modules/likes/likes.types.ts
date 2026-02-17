// Types de réactions disponibles
export enum ReactionType {
    LIKE = 'LIKE',           // 👍 J'aime
    CELEBRATE = 'CELEBRATE', // 🎉 Bravo
    SUPPORT = 'SUPPORT',     // 💪 Soutien
    LOVE = 'LOVE',           // ❤️ J'adore
    INSIGHTFUL = 'INSIGHTFUL', // 💡 Instructif
    FUNNY = 'FUNNY'          // 😂 Amusant
}

export interface Like {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
    reaction_type: ReactionType;
    created_at: Date | string;
}

export interface LikeDTO {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
    reaction_type?: ReactionType; // Optionnel, défaut: LIKE
}

// Interface enrichie avec les infos de l'utilisateur qui a liké
export interface LikeWithUser extends Like {
    full_name: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
}

