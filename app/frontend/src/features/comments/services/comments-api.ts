import { api } from "../../api/apiClients";
import { Comment, CreateCommentDTO, UpdateCommentDTO } from "./comments-types";

export const commentsApi = {
    createComment: async (dto: CreateCommentDTO): Promise<Comment> => {
        return await api.post<Comment>("/comments", dto);
    },

    getPostComments: async (postId: string): Promise<Comment[]> => {
        return await api.get<Comment[]>(`/comments/post/${postId}`);
    },

    getReplies: async (parentId: string): Promise<Comment[]> => {
        return await api.get<Comment[]>(`/comments/replies/${parentId}`);
    },

    updateComment: async (id: string, dto: UpdateCommentDTO): Promise<Comment> => {
        return await api.put<Comment>(`/comments/${id}`, dto);
    },

    deleteComment: async (id: string): Promise<void> => {
        return await api.delete<void>(`/comments/${id}`);
    },

    toggleCommentLike: async (commentId: string, profileId: string): Promise<{ liked: boolean }> => {
        return await api.post<{ liked: boolean }>("/likes/toggle", { comment_id: commentId, profile_id: profileId });
    }
};
