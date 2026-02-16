import { IDatabase } from "../auth/auth.types";
import Logger from "../../infra/logger/winston";
import { DatabaseQueryError } from "../../errors/custom-errors";
import { Post, CreatePostDTO, UpdatePostDTO } from "./posts.types";

export interface IPostsRepository {
    create(dto: CreatePostDTO): Promise<Post>;
    findById(id: string): Promise<Post | null>;
    findAllByProfileId(profileId: string, currentProfileId?: string): Promise<Post[]>;
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
                    profile_id, content, type, visibility, 
                    media_url, thumbnail_url, tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const params = [
                dto.profile_id,
                dto.content || null,
                dto.type || 'TEXT',
                dto.visibility || 'PUBLIC',
                dto.media_url || null,
                dto.thumbnail_url || null,
                dto.tags || []
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
                    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.profile_id = $2) as "isLiked"
                FROM posts p
                JOIN profiles pr ON p.profile_id = pr.user_id
                JOIN users u ON pr.user_id = u.id
                WHERE p.profile_id = $1 
                ORDER BY p.created_at DESC
            `;
            return await this.db.query<Post>(sql, [profileId, currentProfileId || null]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_POSTS_BY_PROFILE_ERROR", error);
        }
    }

    async findFeed(limit: number = 20, offset: number = 0, currentProfileId?: string): Promise<Post[]> {
        try {
            const sql = `
                WITH user_network AS (
                    -- People the user follows
                    SELECT following_id FROM follows WHERE follower_id = $3
                ),
                user_liked_posts AS (
                    -- Posts the user has liked
                    SELECT post_id FROM likes WHERE profile_id = $3
                ),
                all_content AS (
                    -- 1. Regular Posts
                    SELECT 
                        p.*, 
                        pr.username, pr.display_name, pr.avatar_url, 
                        u.full_name, u.headline,
                        NULL::uuid as share_id,
                        NULL::text as share_caption,
                        NULL::text as sharer_name,
                        NULL::text as sharer_avatar,
                        NULL::uuid as original_author_id,
                        NULL::text as original_author_name,
                        p.created_at as feed_date,
                        p.profile_id as feed_profile_id,
                        p.id as unique_id
                    FROM posts p
                    JOIN profiles pr ON p.profile_id = pr.user_id
                    JOIN users u ON pr.user_id = u.id
                    WHERE p.visibility = 'PUBLIC'

                    UNION ALL

                    -- 2. Shared Posts
                    SELECT 
                        p.*, 
                        pr.username, pr.display_name, pr.avatar_url, 
                        u.full_name, u.headline,
                        s.id as share_id,
                        s.caption as share_caption,
                        sharer_pr.display_name as sharer_name,
                        sharer_pr.avatar_url as sharer_avatar,
                        p.profile_id as original_author_id,
                        u.full_name as original_author_name,
                        s.created_at as feed_date,
                        s.profile_id as feed_profile_id,
                        s.id as unique_id
                    FROM shares s
                    JOIN posts p ON s.post_id = p.id
                    JOIN profiles pr ON p.profile_id = pr.user_id
                    JOIN users u ON pr.user_id = u.id
                    JOIN profiles sharer_pr ON s.profile_id = sharer_pr.user_id
                    WHERE p.visibility = 'PUBLIC'
                ),
                ranked_posts AS (
                    SELECT 
                        c.*,
                        EXISTS(SELECT 1 FROM likes l WHERE l.post_id = c.id AND l.profile_id = $3) as "isLiked",
                        
                        -- Intelligent Ranking Score
                        (
                            -- 1. Recency Score (based on feed_date)
                            (1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - c.feed_date)) / 3600.0)) * 30
                            
                            -- 2. Engagement Score
                            + (COALESCE(c.likes_count, 0) * 2.0)
                            + (COALESCE(c.comments_count, 0) * 3.0)
                            
                            -- 3. Social Proximity Bonus
                            + CASE 
                                WHEN c.feed_profile_id IN (SELECT following_id FROM user_network) THEN 50.0
                                WHEN c.feed_profile_id = $3 THEN 40.0
                                ELSE 0.0
                              END
                            
                            -- 4. User Interest Bonus
                            + CASE 
                                WHEN c.id IN (SELECT post_id FROM user_liked_posts) THEN 100.0
                                ELSE 0.0
                              END
                            
                            + (RANDOM() * 5.0)
                        ) as ranking_score
                    
                    FROM all_content c
                )
                SELECT * FROM ranked_posts
                ORDER BY ranking_score DESC, feed_date DESC
                LIMIT $1 OFFSET $2
            `;
            return await this.db.query<Post>(sql, [limit, offset, currentProfileId || null]);
        } catch (error) {
            throw new DatabaseQueryError("FIND_FEED_ERROR", error);
        }
    }

    async update(id: string, dto: UpdatePostDTO): Promise<Post> {
        try {
            const entries = Object.entries(dto).filter(([key]) => key !== 'id');
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
