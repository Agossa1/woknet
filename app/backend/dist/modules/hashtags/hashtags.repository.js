"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagsRepository = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
class HashtagsRepository {
    constructor() {
        this.db = new configDB_1.default();
    }
    /**
     * Extract hashtags from text content
     */
    extractHashtags(content) {
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        if (!matches)
            return [];
        // Remove # and convert to lowercase, remove duplicates
        return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
    }
    /**
     * Process hashtags for a post
     * Creates new hashtags if they don't exist and links them to the post
     */
    async processPostHashtags(postId, content) {
        const hashtags = this.extractHashtags(content);
        if (hashtags.length === 0)
            return;
        for (const tagName of hashtags) {
            // Insert or update hashtag
            const [hashtag] = await this.db.query(`
                INSERT INTO hashtags (name, usage_count, last_used_at)
                VALUES ($1, 1, NOW())
                ON CONFLICT (name) DO UPDATE SET
                    usage_count = hashtags.usage_count + 1,
                    last_used_at = NOW(),
                    updated_at = NOW()
                RETURNING id
            `, [tagName]);
            // Link hashtag to post
            if (hashtag) {
                await this.db.query(`
                    INSERT INTO post_hashtags (post_id, hashtag_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [postId, hashtag.id]);
            }
        }
    }
    /**
     * Get trending hashtags
     */
    async getTrending(limit = 10) {
        return this.db.query(`
            SELECT * FROM trending_hashtags LIMIT $1
        `, [limit]);
    }
    /**
     * Search hashtags by name
     */
    async search(query, limit = 20) {
        return this.db.query(`
            SELECT * FROM hashtags
            WHERE name ILIKE $1
            ORDER BY usage_count DESC, name ASC
            LIMIT $2
        `, [`%${query}%`, limit]);
    }
    /**
     * Get posts by hashtag
     */
    async getPostsByHashtag(hashtagName, limit = 20, offset = 0, currentProfileId) {
        return this.db.query(`
            SELECT 
                p.*,
                pr.username, pr.display_name, pr.avatar_url,
                u.full_name,
                EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.profile_id = $4) as "isLiked"
            FROM post_hashtags ph
            JOIN hashtags h ON ph.hashtag_id = h.id
            JOIN posts p ON ph.post_id = p.id
            JOIN profiles pr ON p.profile_id = pr.user_id
            JOIN users u ON pr.user_id = u.id
            WHERE h.name = $1 AND p.visibility = 'PUBLIC'
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `, [hashtagName.toLowerCase(), limit, offset, currentProfileId || null]);
    }
    /**
     * Get hashtag details with stats
     */
    async getHashtagDetails(name) {
        const [result] = await this.db.query(`
            SELECT 
                h.*,
                COUNT(DISTINCT ph.post_id) as post_count,
                COUNT(DISTINCT ph.post_id) FILTER (WHERE ph.created_at > NOW() - INTERVAL '7 days') as posts_last_week
            FROM hashtags h
            LEFT JOIN post_hashtags ph ON h.id = ph.hashtag_id
            WHERE h.name = $1
            GROUP BY h.id
        `, [name.toLowerCase()]);
        return result;
    }
}
exports.HashtagsRepository = HashtagsRepository;
//# sourceMappingURL=hashtags.repository.js.map