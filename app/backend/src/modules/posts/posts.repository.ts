import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { Post, CreatePostDTO, UpdatePostDTO } from "./posts.types";

export interface IPostsRepository {
    create(dto: CreatePostDTO): Promise<Post>;
    findById(id: string): Promise<Post | null>;
    findAllByProfileId(profileId: string, currentProfileId?: string): Promise<Post[]>;
    findAllByCompanyId(companyId: string, currentProfileId?: string): Promise<Post[]>;
    findFeed(limit?: number, offset?: number, currentProfileId?: string): Promise<Post[]>;
    update(id: string, dto: UpdatePostDTO): Promise<Post>;
    delete(id: string): Promise<boolean>;
    incrementLikes(id: string): Promise<number>;
    decrementLikes(id: string): Promise<number>;
    incrementComments(id: string): Promise<void>;
    decrementComments(id: string): Promise<void>;
}

export class PostsRepository implements IPostsRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger
    ) { }

    async create(dto: CreatePostDTO): Promise<Post> {
        try {
            const sql = `
                INSERT INTO posts (
                    profile_id, company_id, content, type, visibility, 
                    media_url, media_urls, thumbnail_url, tags, background_color
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;
            const params = [
                dto.profile_id,
                dto.company_id || null,
                dto.content || null,
                dto.type || 'TEXT',
                dto.visibility || 'PUBLIC',
                dto.media_url || null,
                dto.media_urls || [],
                dto.thumbnail_url || null,
                dto.tags || [],
                (dto.background_color && (dto.content?.length || 0) <= 250) ? dto.background_color : null
            ];

            const result = await this.db.query<Post>(sql, params);
            return result[0];
        } catch (error) {
            this.logger.instance.error(`[PostsRepository] Create post error: ${error}`);
            throw new DatabaseQueryError("CREATE_POST_ERROR", error);
        }
    }

    async findById(id: string): Promise<Post | null> {
        try {
            const sql = `SELECT * FROM posts WHERE id = $1`;
            const result = await this.db.query<Post>(sql, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("FIND_POST_BY_ID_ERROR", error);
        }
    }

    async findAllByProfileId(profileId: string, currentProfileId?: string): Promise<Post[]> {
        try {
            const sql = `
                SELECT 
                    p.*, 
                    pr.username, pr.display_name, pr.avatar_url, 
                    u.full_name, u.headline,
                    c.company_type, c.company_size,
                    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.profile_id = $2) as "isLiked",
                    (SELECT reaction_type FROM likes l WHERE l.post_id = p.id AND l.profile_id = $2) as "reactionType",
                    (SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) FROM likes WHERE post_id = p.id) as "reactionTypes",
                    EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.profile_id = $2) as "isSaved"
                FROM posts p
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                LEFT JOIN companies c ON p.company_id = c.id
                WHERE p.profile_id = $1 AND p.company_id IS NULL
                ORDER BY p.created_at DESC
            `;
            return await this.db.query<Post>(sql, [profileId, currentProfileId || null]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_POSTS_BY_PROFILE_ERROR", error);
        }
    }

    async findAllByCompanyId(companyId: string, currentProfileId?: string): Promise<Post[]> {
        try {
            const sql = `
                SELECT 
                    p.*, 
                    c.name as display_name, c.logo_url as avatar_url, 
                    c.description as headline,
                    c.company_type, c.company_size,
                    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.profile_id = $2) as "isLiked",
                    (SELECT reaction_type FROM likes l WHERE l.post_id = p.id AND l.profile_id = $2) as "reactionType",
                    (SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) FROM likes WHERE post_id = p.id) as "reactionTypes",
                    EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.profile_id = $2) as "isSaved"
                FROM posts p
                JOIN companies c ON p.company_id = c.id
                WHERE p.company_id = $1 
                ORDER BY p.created_at DESC
            `;
            return await this.db.query<Post>(sql, [companyId, currentProfileId || null]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_POSTS_BY_COMPANY_ERROR", error);
        }
    }

    async findFeed(limit: number = 20, offset: number = 0, currentProfileId?: string): Promise<Post[]> {
        try {
            // Optimisation : On récupère d'abord les IDs classés, puis on joint les infos lourdes uniquement sur ces IDs.
            const sql = `
                WITH candidate_posts AS (
                    -- Unified list of posts and shares with base ranking info
                    SELECT 
                        id, profile_id, created_at as feed_date, likes_count, comments_count, 
                        NULL::uuid as share_id, NULL::text as share_caption, NULL::uuid as sharer_id
                    FROM posts 
                    WHERE visibility = 'PUBLIC'
                    
                    UNION ALL
                    
                    SELECT 
                        post_id as id, profile_id as original_author_id, created_at as feed_date, 0 as likes_count, 0 as comments_count,
                        id as share_id, caption as share_caption, profile_id as sharer_id
                    FROM shares
                ),
                ranked_candidates AS (
                    SELECT 
                        c.*,
                        (
                            (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - c.feed_date)) / 3600.0)) * 30
                            + (COALESCE(c.likes_count, 0) * 2.0)
                            + (COALESCE(c.comments_count, 0) * 3.0)
                            + CASE WHEN c.profile_id = $3 THEN 40.0 ELSE 0.0 END
                            + (RANDOM() * 5.0)
                        ) as ranking_score
                    FROM candidate_posts c
                    ORDER BY ranking_score DESC
                    LIMIT $1 OFFSET $2
                )
                SELECT 
                    p.*,
                    COALESCE(rc.share_id, rc.id) as unique_id,
                    COALESCE(c.slug, pr.username) as username,
                    COALESCE(c.name, pr.display_name) as display_name,
                    COALESCE(c.logo_url, pr.avatar_url) as avatar_url,
                    COALESCE(c.name, u.full_name) as full_name,
                    COALESCE(c.description, u.headline) as headline,
                    c.company_type, c.company_size,
                    rc.share_id, rc.share_caption, rc.feed_date,
                    sharer_pr.display_name as sharer_name,
                    sharer_pr.avatar_url as sharer_avatar,
                    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.profile_id = $3) as "isLiked",
                    (SELECT reaction_type FROM likes l WHERE l.post_id = p.id AND l.profile_id = $3) as "reactionType",
                    (SELECT COALESCE(array_to_json(array_agg(DISTINCT reaction_type)), '[]'::json) FROM likes WHERE post_id = p.id) as "reactionTypes",
                    EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.profile_id = $3) as "isSaved"
                FROM ranked_candidates rc
                JOIN posts p ON rc.id = p.id
                LEFT JOIN companies c ON p.company_id = c.id
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                LEFT JOIN profiles sharer_pr ON rc.sharer_id = sharer_pr.user_id
                ORDER BY rc.ranking_score DESC;
            `;
            return await this.db.query<Post>(sql, [limit, offset, currentProfileId || null]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_FEED_ERROR", error);
        }
    }

    async update(id: string, dto: UpdatePostDTO): Promise<Post> {
        try {
            const finalDto = { ...dto };
            if (finalDto.background_color && (finalDto.content?.length || 0) > 250) {
                finalDto.background_color = undefined;
            }

            const entries = Object.entries(finalDto).filter(([key]) => key !== 'id' && finalDto[key as keyof UpdatePostDTO] !== undefined);
            const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
            const params = [id, ...entries.map(([, value]) => value)];

            const sql = `
                UPDATE posts 
                SET ${setClause}, updated_at = NOW() 
                WHERE id = $1 
                RETURNING *
            `;
            const result = await this.db.query<Post>(sql, params);
            return result[0];
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_POST_ERROR", error);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const sql = `DELETE FROM posts WHERE id = $1`;
            const result = await this.db.query(sql, [id]);
            return true;
        } catch (error) {
            throw new DatabaseQueryError("DELETE_POST_ERROR", error);
        }
    }

    async incrementLikes(id: string): Promise<number> {
        try {
            const sql = `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count`;
            const result = await this.db.query<{ likes_count: number }>(sql, [id]);
            return result[0].likes_count;
        } catch (error) {
            throw new DatabaseQueryError("INCREMENT_LIKES_ERROR", error);
        }
    }

    async decrementLikes(id: string): Promise<number> {
        try {
            const sql = `UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count`;
            const result = await this.db.query<{ likes_count: number }>(sql, [id]);
            return result[0].likes_count;
        } catch (error) {
            throw new DatabaseQueryError("DECREMENT_LIKES_ERROR", error);
        }
    }

    async incrementComments(id: string): Promise<void> {
        try {
            const sql = `UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1`;
            await this.db.query(sql, [id]);
        } catch (error) {
            throw new DatabaseQueryError("INCREMENT_COMMENTS_ERROR", error);
        }
    }

    async decrementComments(id: string): Promise<void> {
        try {
            const sql = `UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1`;
            await this.db.query(sql, [id]);
        } catch (error) {
            throw new DatabaseQueryError("DECREMENT_COMMENTS_ERROR", error);
        }
    }
}
