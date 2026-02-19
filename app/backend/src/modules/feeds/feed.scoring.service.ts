import Logger from "../../infra/logger/winston";

export class FeedScoringService {
    private logger = new Logger();

    /**
     * Calcule le score de créativité basé sur:
     * - Présence de média (images/vidéos)
     * - Vitesse d'engagement (likes + comments par heure)
     * - Originalité du contenu
     */
    calculateCreativityScore(post: any): number {
        let score = 0;

        // Bonus média (Augmenté pour privilégier le visuel)
        if (post.media_url) {
            score += 50; // Augmenté de 30 à 50 pour tout média
            // Correction: utilisation de 'type' (colonne DB) en plus de 'media_type'
            if (post.type === 'VIDEO' || post.media_type === 'VIDEO') score += 25; // Augmenté de 15 à 25 pour les vidéos
        }

        // Engagement velocity (likes + comments par heure depuis création)
        if (post.created_at) {
            const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
            const engagementCount = (post.likes_count || 0) + (post.comments_count || 0) * 2;
            const velocity = engagementCount / Math.max(hoursOld, 1);
            const velocityScore = Math.min(velocity * 2, 25); // Max 25 points
            score += velocityScore;
        }

        // Contenu avec hashtags = plus de recherche = plus créatif
        const hashtagMatch = (post.content || '').match(/#\w+/g);
        const hashtagCount = hashtagMatch ? hashtagMatch.length : 0;
        score += Math.min(hashtagCount * 2, 15);

        return Math.min(score, 100);
    }

    /**
     * Calcule le score d'opportunité basé sur:
     * - Type de contenu (job, collaboration, projet)
     * - Fraîcheur du post
     * - Pertinence aux compétences
     */
    calculateOpportunityScore(post: any): number {
        let score = 0;

        // Type de contenu
        if (post.content_type === 'JOB' || post.is_job_posting) score += 50;
        else if (post.content_type === 'PROJECT_CALL' || post.is_collaboration_request) score += 40;
        else if (post.is_project_showcase) score += 30;

        // Fraîcheur bonus (posts récents = plus pertinents)
        if (post.created_at) {
            const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
            const freshnessBonus = Math.max(30 - hoursOld / 2, 0);
            score += freshnessBonus;
        }

        // Application interest (si le post évoque un intérêt)
        if (post.mentions_skills_count) {
            score += Math.min(post.mentions_skills_count * 5, 20);
        }

        return Math.min(score, 100);
    }

    /**
     * Calcule le score de mise en avant du talent basé sur:
     * - Portfolio/case studies
     * - Réputation du créateur
     * - Vérification du compte
     */
    calculateTalentScore(post: any, creator: any): number {
        let score = 0;

        // Portfolio showcase
        if (post.has_portfolio_link) score += 25;
        if (post.is_case_study) score += 35;
        if (post.is_achievement_post) score += 20;

        // Creator reputation
        if (creator?.reputation_score) {
            const repScore = Math.min((creator.reputation_score / 200) * 20, 20);
            score += repScore;
        }

        // Verified creator
        if (creator?.is_verified) score += 15;

        // Follower count (signal de credibilité)
        if (creator?.follower_count) {
            const followerBonus = Math.min(Math.log(creator.follower_count + 1) * 5, 15);
            score += followerBonus;
        }

        return Math.min(score, 100);
    }

    /**
     * Calcule le score de pertinence personnelle basé sur:
     * - Follow du créateur
     * - Match de compétences
     * - Proximité géographique
     */
    calculatePersonalRelevance(
        post: any,
        creator: any,
        userProfile: any,
        isFollowing: boolean
    ): number {
        let boost = 1.0;

        // In following = priorité maximale
        if (isFollowing) {
            boost *= 2.5;
        }

        // Skill match percentage
        if (creator.skills && userProfile.skills) { // Utiliser les compétences du créateur
            const skillOverlap = this.calculateSkillOverlap(creator.skills, userProfile.skills);
            boost *= 1 + skillOverlap * 0.3; // Max +30% boost
        }

        // Location proximity
        if (creator.location && userProfile.location) { // Utiliser la localisation du créateur
            const sameLocation = creator.location.city === userProfile.location.city;
            if (sameLocation) {
                boost *= 1.3;
            } else if (post.location.country === userProfile.location.country) {
                boost *= 1.1;
            }
        }

        // Same company
        if (creator?.company_id === userProfile.company_id && creator?.company_id) {
            boost *= 2.0;
        }

        return boost;
    }

    /**
     * Calcule le score viral/trending
     */
    calculateViralScore(post: any): number {
        let score = 0;

        // Engagement rate
        const totalEngagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
        score += Math.min(totalEngagement / 10, 40); // Max 40 points

        // Share velocity (shares sont importants)
        score += Math.min((post.shares_count || 0) * 3, 30);

        // Comment ratio (commentaires = discussion active)
        const commentRatio = (post.comments_count || 0) / Math.max(post.likes_count || 1, 1);
        score += Math.min(commentRatio * 10, 30);

        return Math.min(score, 100);
    }

    /**
     * Combine tous les scores pour générer le score final personnalisé
     */
    calculateFinalScore(
        post: any,
        creator: any,
        userProfile: any,
        isFollowing: boolean,
        weights: { creativity: number; opportunity: number; talent: number; relevance: number } = {
            creativity: 0.40, // Augmenté de 0.25 à 0.40 pour donner la priorité au contenu visuel
            opportunity: 0.25, // Réduit de 0.35 à 0.25
            talent: 0.20, // Réduit de 0.25 à 0.20
            relevance: 0.15,
        }
    ): number {
        const creativity = this.calculateCreativityScore(post);
        const opportunity = this.calculateOpportunityScore(post);
        const talent = this.calculateTalentScore(post, creator);
        const relevance = this.calculatePersonalRelevance(post, creator, userProfile, isFollowing);

        const weighted =
            creativity * weights.creativity +
            opportunity * weights.opportunity +
            talent * weights.talent +
            relevance * weights.relevance;

        return Math.round(weighted * 100) / 100; // 2 decimal places
    }

    /**
     * Helper : calcule le chevauchement de compétences
     */
    private calculateSkillOverlap(postSkills: string[], userSkills: string[]): number {
        if (!postSkills?.length || !userSkills?.length) return 0;

        const postSkillsLower = postSkills.map((s) => s.toLowerCase());
        const overlap = userSkills.filter((s) => postSkillsLower.includes(s.toLowerCase())).length;

        return overlap / Math.max(postSkills.length, userSkills.length);
    }

    /**
     * Helper : extrait les compétences du contenu du post
     */
    extractSkillsFromContent(content: string, hashtags?: string[]): string[] {
        const skills: string[] = [];

        // Extraire hashtags
        if (hashtags) {
            skills.push(...hashtags.map((h) => h.replace("#", "")));
        }

        // Recherche simple de keywords
        const commonSkills = [
            "javascript",
            "typescript",
            "react",
            "nodeJs",
            "python",
            "sql",
            "postgresql",
            "mongodb",
            "docker",
            "kubernetes",
            "aws",
            "gcp",
            "figma",
            "ui",
            "ux",
            "design",
            "marketing",
            "seo",
            "devops",
        ];

        const lowerContent = content.toLowerCase();
        commonSkills.forEach((skill) => {
            if (lowerContent.includes(skill.toLowerCase()) && !skills.includes(skill)) {
                skills.push(skill);
            }
        });

        return skills;
    }
}
