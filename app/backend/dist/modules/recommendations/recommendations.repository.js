"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsRepository = void 0;
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
class RecommendationsRepository {
    constructor() {
        // Simple buffer en mémoire pour les signaux (pour éviter de spammer la DB)
        this.signalBuffer = [];
        this.BATCH_SIZE = 50;
        this.FLUSH_INTERVAL = 5000; // 5 secondes
        this.db = new configDB_1.default();
        // Démarrer le vidage automatique du buffer
        setInterval(() => this.flushSignals(), this.FLUSH_INTERVAL);
    }
    // ==========================================
    // 1. GESTION DES SIGNAUX (USER BEHAVIOR)
    // ==========================================
    async saveSignal(signal) {
        // Validation de sécurité : Si pas d'ID, on ignore pour éviter de faire planter le buffer
        if (!signal.item_id) {
            console.warn("[Recs] Ignored signal: missing item_id", signal);
            return;
        }
        let weight = signal.weight;
        if (!weight) {
            const weights = {
                'VIEW': 0.1, 'CLICK': 1.0, 'LIKE': 2.0,
                'COMMENT': 3.0, 'SHARE': 5.0, 'APPLY': 15.0,
                'CONNECT': 5.0, 'DISMISS': -10.0
            };
            weight = weights[signal.action_type] || 1.0;
        }
        // Normalisation explicite
        this.signalBuffer.push({
            user_id: signal.user_id,
            item_id: signal.item_id,
            item_type: signal.item_type,
            action_type: signal.action_type,
            metadata: JSON.stringify(signal.metadata || {}),
            weight: weight,
            created_at: new Date()
        });
        if (this.signalBuffer.length >= this.BATCH_SIZE) {
            await this.flushSignals();
        }
    }
    async flushSignals() {
        if (this.signalBuffer.length === 0)
            return;
        const signalsToSave = [...this.signalBuffer];
        this.signalBuffer = [];
        const values = signalsToSave.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(',');
        const flatParams = signalsToSave.flatMap(s => [
            s.user_id, s.item_id, s.item_type, s.action_type, s.metadata, s.weight
        ]);
        const query = `
            INSERT INTO public.user_signals 
            (user_id, item_id, item_type, action_type, metadata, weight)
            VALUES ${values}
        `;
        try {
            await this.db.query(query, flatParams);
        }
        catch (e) {
            console.error("[Recs] Database error during flush:", e);
        }
    }
    // ==========================================
    // 2. MOTEUR DE RECOMMANDATION (SCORING)
    // ==========================================
    /**
     * Recommandation de profils (Mix Réseau, Tendance, et Sérendipité)
     */
    async getProfileRecommendations(userId, limit = 10) {
        const query = `
            WITH candidates AS (
                -- 1. Réseau (Utilise la Vue Matérialisée)
                SELECT suggested_id as user_id, mutual_count * 5 as score, 'network' as reason
                FROM mat_view_mutual_follows
                WHERE user_id = $1
                
                UNION ALL
                
                -- 2. Créateurs "Trending" (Derniers 7 jours)
                SELECT l.profile_id as user_id, COUNT(*) * 0.5 as score, 'trending_creator' as reason
                FROM likes l
                WHERE l.created_at > NOW() - INTERVAL '7 days'
                AND l.profile_id != $1
                GROUP BY l.profile_id
                
                UNION ALL
                
                -- 3. "Wildcard" (Sérendipité)
                (SELECT user_id, (RANDOM() * 5) as score, 'discovery' as reason
                FROM profiles
                WHERE user_id != $1
                ORDER BY RANDOM()
                LIMIT 10)
            )
            SELECT 
                p.user_id as id, -- Frontend FIX
                u.full_name,
                p.avatar_url,
                p.bio,
                COALESCE(SUM(c.score), 0) as total_score,
                array_agg(DISTINCT c.reason) as reasons
            FROM candidates c
            JOIN profiles p ON p.user_id = c.user_id
            JOIN users u ON u.id = p.user_id
            WHERE p.user_id NOT IN (
                SELECT following_id FROM follows WHERE follower_id = $1
            )
            AND p.user_id != $1 
            GROUP BY p.user_id, u.full_name, p.avatar_url, p.bio
            ORDER BY total_score DESC
            LIMIT $2;
        `;
        return this.db.query(query, [userId, limit]);
    }
    /**
     * Recommandation de Jobs (Full Text Search + Signaux)
     */
    async getJobRecommendations(userId, limit = 10) {
        const query = `
            WITH user_context AS (
                SELECT 
                    p.location_name,
                    string_agg(s.name, ' ') as skills_text
                FROM profiles p
                LEFT JOIN profile_skills ps ON ps.profile_id = p.user_id
                LEFT JOIN skills s ON s.id = ps.skill_id
                WHERE p.user_id = $1
                GROUP BY p.location_name
            )
            SELECT 
                j.id,
                j.title,
                c.name as company_name,
                (
                    -- Pertinence sémantique
                    ts_rank(j.search_vector, to_tsquery('english', replace(COALESCE(uc.skills_text, ''), ' ', ' | '))) * 10
                    +
                    -- Localisation
                    (CASE WHEN j.location = uc.location_name THEN 20 ELSE 0 END)
                    +
                    -- Historique utilisateur
                    COALESCE((
                        SELECT SUM(weight) 
                        FROM user_signals us
                        WHERE us.user_id = $1 AND us.item_type = 'JOB' 
                        AND (us.metadata->>'category')::text = j.category
                    ), 0) * 0.5
                ) as match_score,
                ts_headline('english', j.description, to_tsquery('english', replace(COALESCE(uc.skills_text, ''), ' ', ' | '))) as highlight
            FROM jobs j
            CROSS JOIN user_context uc
            JOIN companies c ON c.id = j.company_id
            WHERE j.status = 'published'
            AND NOT EXISTS (
                SELECT 1 FROM user_signals us 
                WHERE us.user_id = $1 AND us.item_id = j.id AND us.action_type = 'APPLY'
            )
            ORDER BY match_score DESC
            LIMIT $2;
        `;
        return this.db.query(query, [userId, limit]);
    }
    // ==========================================
    // 3. NOUVEAUX SCORES D'AFFINITÉ (EXPÉRIENCES & POSTS)
    // ==========================================
    /**
     * Calcule l'affinité basée sur les entreprises communes.
     * Utile pour créer un bloc "Anciens collègues potentiels".
     */
    async getExperienceMatching(userId, limit = 5) {
        const query = `
            SELECT 
                p.user_id as id,
                u.full_name,
                e2.company_name,
                COUNT(*) OVER(PARTITION BY e2.company_name) as mutual_colleagues
            FROM experiences e1
            JOIN experiences e2 ON e1.company_name = e2.company_name 
            JOIN profiles p ON p.user_id = e2.profile_id
            JOIN users u ON u.id = p.user_id
            WHERE e1.profile_id = $1 
            AND e2.profile_id != $1
            AND p.user_id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
            ORDER BY mutual_colleagues DESC, e2.end_date DESC NULLS FIRST
            LIMIT $2;
        `;
        return this.db.query(query, [userId, limit]);
    }
    /**
     * Calcule quels créateurs intéressent le plus l'utilisateur
     * basé sur ses likes et commentaires sur les posts.
     */
    async getInterestBasedProfiles(userId, limit = 5) {
        const query = `
            SELECT 
                target_p.user_id as id,
                u.full_name,
                SUM(us.weight) as interaction_score
            FROM user_signals us
            JOIN posts po ON po.id = us.item_id
            JOIN profiles target_p ON target_p.user_id = po.author_id
            JOIN users u ON u.id = target_p.user_id
            WHERE us.user_id = $1 
            AND us.item_type = 'POST'
            AND us.action_type IN ('LIKE', 'COMMENT', 'SHARE')
            AND target_p.user_id != $1
            AND target_p.user_id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
            GROUP BY target_p.user_id, u.full_name
            ORDER BY interaction_score DESC
            LIMIT $2;
        `;
        return this.db.query(query, [userId, limit]);
    }
}
exports.RecommendationsRepository = RecommendationsRepository;
//# sourceMappingURL=recommendations.repository.js.map