# 🎯 Analyse Expert du Feed WorkNet - Stratégie de Personnalisation Dynamique

## 📊 État Actuel du Système

### Architecture Existante ✅
```
FeedRepository → FeedService → FeedController → Frontend
     ↓
  (Base Score + Cache Redis)
     ↓
  (Diversification par auteur)
     ↓
  (Injection de recommandations)
```

**Composants clés identifiés:**
- `user_signals` table → Capture les interactions (VIEW, CLICK, LIKE, COMMENT, SHARE, SAVE, DISMISS)
- `recommendation_candidates` → Pré-calcul des candidats par stratégies
- `recommendations` table → Feed final avec scoring
- `base_score` ordering → Classement par pertinence
- Redis cache (5 min TTL) → Performance
- Diversification par auteur (`MAX_PER_AUTHOR` = 2 posts/auteur)

---

## 🚨 Problèmes Critiques à Résoudre

### 1. **Scoring insuffisant / Talents pas mis en avant**
**Problème:** Le système repose sur `base_score` simple, sans distinction entre:
- Créativité de contenu
- Opportunités professionnelles
- Talent / Expertise showcasing

**Impact:** Feed générique, manque de diversité éditoriale.

**Solution:**
```sql
-- AJOUTER une table de scoring multi-facteurs
CREATE TABLE feed_content_scoring (
    item_id UUID NOT NULL,
    user_viewing UUID NOT NULL,
    
    -- Facteurs de pertinence
    creativity_score FLOAT,           -- Innovation, originalité (0-100)
    opportunity_score FLOAT,          -- Jobs, projets, collaborations (0-100)
    talent_showcase_score FLOAT,      -- Démonstration de compétences (0-100)
    viral_potential_score FLOAT,      -- Engagement trend velocity (0-100)
    
    -- Final composite
    final_rank_score FLOAT,           -- Score final personnalisé
    
    --Context utilisateur
    relevance_to_user_skills FLOAT,   -- Match avec compétences de l'utilisateur
    community_boost FLOAT,            -- Contenu d'une personne followée
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    PRIMARY KEY (item_id, user_viewing)
);

CREATE INDEX idx_feed_scoring_rank ON feed_content_scoring 
(user_viewing, final_rank_score DESC) WHERE expires_at > NOW();
```

### 2. **Infinite Scroll mal optimisé**
**Problème:** 
- Pas de cursor-based pagination (pagination par offset = lent)
- Cache invalidation compliquée sur chaque nouvelle page
- Risque de duplicata en cas de nouvel item injecté

**Solution:** Implémenter cursor-based pagination avec timestamp + ID composite:

```typescript
// Backend: feed.repository.ts
async getMainFeedWithCursor(
    userId: string, 
    limit: number = 20, 
    cursor?: { timestamp: string; itemId: string }
) {
    const query = `
        SELECT p.*, f.base_score, f.created_at as feed_created_at
        FROM global_power_feed f
        JOIN posts p ON p.id = f.item_id
        WHERE f.user_view_id = $1
        ${cursor ? 'AND (f.created_at, f.item_id) < ($2, $3)' : ''}
        ORDER BY f.created_at DESC, f.item_id DESC
        LIMIT $${cursor ? '4' : '2'}
    `;
    
    const params = cursor 
        ? [userId, cursor.timestamp, cursor.itemId, limit + 1]
        : [userId, limit + 1];
        
    const results = await this.db.query(query, params);
    
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    
    const nextCursor = hasMore && items.length > 0
        ? { 
            timestamp: items[items.length - 1].feed_created_at,
            itemId: items[items.length - 1].item_id
          }
        : null;
    
    return { items, hasMore, nextCursor };
}
```

### 3. **Pas de véritable recommandation intelligente basée sur interactions**
**Problème:** 
- Les `user_signals` (interactions) ne sont pas utilisées en temps réel pour rankify le feed
- Pas de boosting pour contenu similaire aux interactions passées
- Absence de collaborative filtering

**Solution:** Intégrer les signals dans le scoring

```typescript
// Backend: feed.services.ts
async getPowerFeedWithPersonalization(userId: string, page: number = 1) {
    const limit = 15;
    const offset = (page - 1) * limit;
    
    // 1. Récupérer les signaux récents de l'utilisateur (30 jours)
    const userSignals = await this.signalsRepository.getRecentSignals(userId);
    
    // 2. Extraire:
    // - Top skills intéressants (CLICK sur posts de Dev)
    // - Top companies (SAVE/LIKE jobs)
    // - Top creators (FOLLOW/VIEW)
    const userInterestProfile = this.buildInterestProfile(userSignals);
    
    // 3. Scorer le feed basé sur ce profil
    const scoredFeed = await this.scoreContentAgainstProfile(
        userId, 
        userInterestProfile, 
        offset, 
        limit
    );
    
    return {
        items: scoredFeed,
        hasMore: scoredFeed.length > limit,
        personalization_factors: userInterestProfile // DEBUG: montrer pourquoi c'est classé comme ça
    };
}

private buildInterestProfile(signals: UserSignal[]) {
    const weights = {
        'LIKE': 3,
        'COMMENT': 5,
        'SHARE': 8,
        'SAVE': 4,
        'VIEW': 1,
        'DISMISS': -2
    };
    
    return {
        topSkills: this.aggregateByTag(signals, 'skills'),
        topCompanies: this.aggregateByTag(signals, 'company_id'),
        topCreators: this.aggregateByTag(signals, 'author_id'),
        topJobRoles: this.aggregateByTag(signals, 'job_title'),
        topLocations: this.aggregateByTag(signals, 'location'),
    };
}
```

### 4. **Absence de Stratégies de Contenu Explicites**
**Problème:** Pas de boosts thématiques pour ("Creatives", "Opportunities", "Talent Showcase")

**Solution:** Créer des stratégies éditorialesen fonction du type de contenu

```typescript
// Stratégies de promotion du feed
const FEED_STRATEGIES = {
    TRENDING_CREATIVITY: {
        // Posts avec haute créativité (design, art, écrit original)
        filters: ['has_media', 'high_engagement_velocity'],
        boost_factor: 1.5,
        target_position: [0, 1, 5, 8], // Positions dans le feed
    },
    
    OPPORTUNITY_FOCUSED: {
        // Jobs + Collaborations + Projets
        filters: ['job_posting', 'collaboration_request', 'project_call'],
        boost_factor: 2.0,
        target_position: [3, 7, 12],
        freshness_weight: 0.8 // Récents = plus importants
    },
    
    TALENT_SHOWCASE: {
        // Creators montrant du travail (portfolios, case studies, achievements)
        filters: ['has_portfolio_link', 'skill_demonstration', 'project_delivery'],
        boost_factor: 1.8,
        target_position: [2, 6, 10],
        reputation_weight: 0.7 // Talent vérifié = boost
    },
    
    NETWORK_PROXIMITY: {
        // Contenu des personnes followées
        filters: ['from_followings'],
        boost_factor: 2.5,
        freshness_weight: 0.6
    },
    
    LOCAL_TRENDING: {
        // Tendances géographiques
        filters: ['location_match'],
        boost_factor: 1.3,
        freshness_weight: 0.9
    }
};
```

---

## 💡 Architecture Recommandée: Scoring Multi-Layer

### Architecture proposée:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Infini Scroll)                  │
│  ✓ Cursor-based pagination (timestamp + ID)                 │
│  ✓ Intersection Observer pour lazy load                      │
│  ✓ Afficher raison du classement en tooltip                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              FEED CONTROLLER (page + cursor)                 │
│  ✓ Décode le cursor                                          │
│  ✓ Appelle le service de personnalisation                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         FEED SERVICE (Orchestration de scoring)              │
│                                                              │
│  1. Récupère user_signals (30 derniers jours)              │
│  2. Construit le profil d'intérêt                           │
│  3. Fetch candidates du cache (~500 items)                  │
│  4. Score chaque item selon stratégies                      │
│  5. Diversifie par type + auteur                            │
│  6. Injecte recommandations (jobs, profils)                 │
│  7. Retourne avec cursor pour prochain fetch                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         SCORING ENGINE (TypeScript / Python Worker)          │
│                                                              │
│  ┌─ Creativity Score                                        │
│  │  - has_media (images/videos) → +30                       │
│  │  - engagement_velocity → +20                             │
│  │  - unique_hashtags → +10                                 │
│  │                                                          │
│  ├─ Opportunity Score                                       │
│  │  - is_job_posting → +50                                  │
│  │  - is_collaboration_request → +40                        │
│  │  - match_user_skills → +30                               │
│  │                                                          │
│  ├─ Talent Score                                            │
│  │  - portfolio_link → +25                                  │
│  │  - case_study → +35                                      │
│  │  - creator_reputation → +20                              │
│  │  - skill_match_% → +variable                             │
│  │                                                          │
│  └─ Personal Relevance (Boost)                              │
│     - creator_in_following → ×2.5                           │
│     - skill_match_% → linear                                │
│     - location_proximity → ×1.3                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│          FEED_CONTENT_SCORING (Caching Layer)                │
│                                                              │
│  Résultats de scoring pré-calculés (TTL: 1 heure)           │
│  ✓ Indexed par (item_id, user_viewing)                      │
│  ✓ Index partiel: expires_at > NOW()                        │
│  ✓ Invalidation granulaire par user/item                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         RANKING & DEDUPLICATION                              │
│                                                              │
│  1. Appliquer stratégies d'injection                         │
│  2. Regrouper par type (Creativity, Opportunity, Talent)   │
│  3. Éviter duplicates                                       │
│  4. Respecter dismissed items (user_signals)                │
│  5. Return items + nextCursor                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│           GLOBAL_POWER_FEED VIEW                             │
│                                                              │
│  SELECT p.*, f.base_score, scoring.creativity_score, ...    │
│  FROM posts p                                                │
│  JOIN recommendations f ON f.item_id = p.id                 │
│  LEFT JOIN feed_content_scoring scoring ON ...              │
│  WHERE f.user_id = $1 AND f.status = 'active'              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implémentation Step-by-Step

### Phase 1: Base (2-3 jours)
- [ ] Créer table `feed_content_scoring`
- [ ] Implémenter cursor-based pagination dans `FeedRepository`
- [ ] Ajouter `nextCursor` dans la réponse du contrôleur

### Phase 2: Signals & Personalization (3-4 jours)
- [ ] Créer `SignalsRepository` pour récupérer user_signals
- [ ] Implémenter `buildInterestProfile()`
- [ ] Intégrer scoring multi-facteurs dans le service

### Phase 3: Stratégies & Boosts (3-4 jours)
- [ ] Créer table `feed_strategies`
- [ ] Implémenter stratégies de contenu (Creativity, Opportunity, Talent)
- [ ] Ajouter position-based injection (splicing)

### Phase 4: Frontend Enhancement (2-3 jours)
- [ ] Implémenter Intersection Observer pour infinite scroll
- [ ] Afficher cursors & métadonnées d'interaction
- [ ] Skeleton loaders + optimistic updates
- [ ] Afficher badges "Trending", "Perfect Match", "New Opportunity"

### Phase 5: Analytics & Monitoring (1-2 jours)
- [ ] Logger scoring decisions
- [ ] Dashboard temps réel du feed performance
- [ ] A/B test différentes stratégies de boost

---

## 📁 Fichiers à Créer / Modifier

### Backend

#### 1. `src/infra/sql/31_create_feed_scoring.sql`
```sql
-- Scoring multi-facteurs pour le feed
CREATE TABLE feed_content_scoring (
    scoring_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    user_viewing UUID NOT NULL,
    
    -- Facteurs de contenu
    creativity_score FLOAT DEFAULT 0,
    opportunity_score FLOAT DEFAULT 0,
    talent_showcase_score FLOAT DEFAULT 0,
    viral_potential_score FLOAT DEFAULT 0,
    relevance_to_user_skills FLOAT DEFAULT 0,
    
    -- Contexte utilisateur
    community_boost_factor FLOAT DEFAULT 1.0,
    location_boost_factor FLOAT DEFAULT 1.0,
    
    -- Score final
    final_rank_score FLOAT NOT NULL,
    
    -- Meta
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    PRIMARY KEY (item_id, user_viewing),
    CONSTRAINT fk_item FOREIGN KEY (item_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_feed_scoring_rank ON feed_content_scoring 
(user_viewing, final_rank_score DESC) WHERE expires_at > NOW();

-- View pour l'adhérence au schéma existant
CREATE OR REPLACE VIEW global_power_feed AS
SELECT 
    p.id as item_id,
    p.profile_id as author_id,
    'POST' as content_type,
    COALESCE(fcs.final_rank_score, p.hot_score) as base_score,
    p.created_at,
    -- ... autres colonnes ...
FROM posts p
LEFT JOIN feed_content_scoring fcs ON fcs.item_id = p.id
WHERE p.deleted_at IS NULL
ORDER BY base_score DESC, p.created_at DESC;
```

#### 2. `src/modules/feeds/feed.scoring.service.ts` (NEW)
```typescript
import { Injectable } from '@nestjs/common';
import Logger from '../../infra/logger/winston';

@Injectable()
export class FeedScoringService {
    constructor(private logger: Logger) {}

    calculateCreativityScore(post: any): number {
        let score = 0;
        
        // Média présent
        if (post.has_media) score += 30;
        if (post.media_type === 'VIDEO') score += 15;
        
        // Engagement velocity
        const hoursOld = (Date.now() - post.created_at) / 3600000;
        const velocity = (post.likes_count + post.comments_count * 2) / (hoursOld + 1);
        score += Math.min(velocity * 5, 25);
        
        // Hashtags uniques (signal de réussite)
        score += Math.min(post.hashtags_count || 0 * 2, 15);
        
        return Math.min(score, 100);
    }

    calculateOpportunityScore(post: any): number {
        let score = 0;
        
        if (post.content_type === 'JOB') score += 50;
        else if (post.content_type === 'PROJECT_CALL') score += 40;
        else if (post.content_type === 'COLLABORATION_REQUEST') score += 40;
        
        // Freshness bonus
        const hoursOld = (Date.now() - post.created_at) / 3600000;
        score += Math.max(30 - hoursOld / 2, 0);
        
        return Math.min(score, 100);
    }

    calculateTalentScore(post: any, creator: any): number {
        let score = 0;
        
        // Portfolio
        if (post.has_portfolio_link) score += 25;
        if (post.is_case_study) score += 35;
        
        // Creator reputation
        score += Math.min((creator.reputation_score / 200) * 20, 20);
        
        // Verified badge
        if (creator.is_verified) score += 15;
        
        return Math.min(score, 100);
    }

    calculatePersonalRelevance(
        post: any,
        creator: any,
        userProfile: any,
        userSignals: any[]
    ): number {
        let boost = 1.0;
        
        // Is in following
        if (userSignals.some(s => s.action_type === 'FOLLOW' && s.item_id === creator.id)) {
            boost *= 2.5;
        }
        
        // Skill match
        const skillOverlap = this.calculateSkillOverlap(post.detected_skills, userProfile.skills);
        boost *= (1 + skillOverlap * 0.3);
        
        // Location proximity
        if (post.location && userProfile.location) {
            boost *= this.calculateLocationProximity(
                post.location,
                userProfile.location
            ) ? 1.3 : 1.0;
        }
        
        return boost;
    }

    private calculateSkillOverlap(postSkills: string[], userSkills: string[]): number {
        if (!postSkills?.length || !userSkills?.length) return 0;
        const overlap = postSkills.filter(s => userSkills.includes(s)).length;
        return overlap / Math.max(postSkills.length, userSkills.length);
    }

    private calculateLocationProximity(loc1: any, loc2: any): boolean {
        // Implémentation simple (city match) - à remplacer par ST_Distance si nécessaire
        return loc1?.city === loc2?.city;
    }
}
```

#### 3. `src/modules/feeds/feed.signals.repository.ts` (NEW)
```typescript
import PostgresDatabase from '../../config/databases/configDB';

export class FeedSignalsRepository {
    constructor(private readonly db = new PostgresDatabase()) {}

    async getRecentSignals(userId: string, days: number = 30) {
        const query = `
            SELECT 
                user_id, item_id, item_type, action_type, weight, 
                metadata, created_at
            FROM user_signals
            WHERE user_id = $1
            AND created_at > NOW() - INTERVAL '${days} days'
            ORDER BY created_at DESC
            LIMIT 1000
        `;
        
        return this.db.query(query, [userId]);
    }

    async getInteractionProfile(userId: string) {
        return {
            topSkills: await this.getTopAggregates(userId, 'skills'),
            topCompanies: await this.getTopAggregates(userId, 'company_id'),
            topCreators: await this.getTopAggregates(userId, 'author_id'),
            jobInterests: await this.getTopAggregates(userId, 'job_title'),
        };
    }

    private async getTopAggregates(userId: string, field: string) {
        // Agréger par champ
        const query = `
            SELECT metadata->>'${field}' as value, COUNT(*) as count
            FROM user_signals
            WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY metadata->>'${field}'
            ORDER BY count DESC
            LIMIT 10
        `;
        return this.db.query(query, [userId]);
    }
}
```

#### 4. Mettre à jour `src/modules/feeds/feed.services.ts`
```typescript
// Ajouter injection du ScoringService et SignalsRepository
async getPowerFeedWithPersonalization(
    userId: string,
    limit: number = 15,
    cursor?: { timestamp: string; itemId: string }
) {
    // 1. Fetchraw content
    const { items, hasMore, nextCursor } = await this.feedRepo
        .getMainFeedWithCursor(userId, limit + 1, cursor);
    
    // 2. Fetch user interaction profile
    const userInterestProfile = await this.signalsRepo
        .getInteractionProfile(userId);
    
    // 3. Score each item
    const scored = await Promise.all(
        items.map(async item => ({
            ...item,
            scoring: {
                creativity: this.scoringService.calculateCreativityScore(item),
                opportunity: this.scoringService.calculateOpportunityScore(item),
                talent: this.scoringService.calculateTalentScore(item, item.creator),
                personalRelevance: this.scoringService.calculatePersonalRelevance(
                    item, item.creator, userProfile, userSignals
                )
            }
        }))
    );
    
    // 4. Final ranking
    const ranked = scored
        .sort((a, b) => 
            (b.scoring.creativity * 0.25 +
             b.scoring.opportunity * 0.35 +
             b.scoring.talent * 0.25 +
             b.scoring.personalRelevance * 0.15)
            -
            (a.scoring.creativity * 0.25 +
             a.scoring.opportunity * 0.35 +
             a.scoring.talent * 0.25 +
             a.scoring.personalRelevance * 0.15)
        )
        .slice(0, limit);
    
    // 5. Diversify & inject recommendations
    const diversified = this.diversifyFeed(ranked);
    const final = this.assembleFeed(diversified, [], [], 1);
    
    return {
        items: final,
        hasMore,
        nextCursor,
        personalization: {
            topInterests: userInterestProfile,
            scoringMethod: 'multi-factor-personalized'
        }
    };
}
```

### Frontend

#### 1. `src/features/feeds/hooks/useFeedInfiniteScroll.ts` (NEW)
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedAPI } from '../services/feed.api';

export function useFeedInfiniteScroll() {
    return useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: async ({ pageParam }) => {
            const response = await feedAPI.getPersonalizedFeed({
                cursor: pageParam?.cursor,
                limit: 15
            });
            
            return {
                items: response.data.items,
                nextCursor: response.data.nextCursor,
                hasMore: response.data.hasMore
            };
        },
        getNextPageParam: (lastPage) => 
            lastPage.hasMore ? { cursor: lastPage.nextCursor } : null,
        initialPageParam: undefined
    });
}
```

#### 2. `src/features/feeds/components/FeedWithInfiniteScroll.tsx` (NEW)
```typescript
import { useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useFeedInfiniteScroll } from '../hooks/useFeedInfiniteScroll';
import FeedCard from './FeedCard';

export function FeedWithInfiniteScroll() {
    const { data, hasNextPage, fetchNextPage, isLoading } = useFeedInfiniteScroll();
    const { setTarget, isVisible } = useIntersectionObserver();

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage, isLoading]);

    // IntersectionObserver when last item is visible
    useEffect(() => {
        if (isVisible && hasNextPage && !isLoading) {
            handleLoadMore();
        }
    }, [isVisible, hasNextPage, isLoading, handleLoadMore]);

    return (
        <div className="feed-container">
            {data?.pages.map((page) =>
                page.items.map((item) => (
                    <FeedCard 
                        key={item.item_id} 
                        item={item}
                        // Afficher pourquoi c'est classé comme ça
                        metadata={{
                            creativity: item.scoring?.creativity,
                            opportunity: item.scoring?.opportunity,
                            talent: item.scoring?.talent,
                            personalRelevance: item.scoring?.personalRelevance
                        }}
                    />
                ))
            )}
            
            {/* Intersection Observer target */}
            <div ref={setTarget} className="load-more-trigger">
                {isLoading && <SkeletonLoader count={3} />}
            </div>
        </div>
    );
}
```

---

## 📊 Résultats Attendus

### Avant (Actuel)
- ❌ Feed générique → même pour tous les utilisateurs
- ❌ Pas de distinction talent/créativité/opportunité
- ❌ Pagination par offset → lent à scale
- ❌ Cache problems avec les nouvelles items

### Après (Optimisé)
- ✅ Feed personnalisé basé sur les interactions
- ✅ Mélange équilibré: 35% opportunités, 25% créativité, 25% talents, 15% pertinence perso
- ✅ Cursor-based pagination → O(1) + O(log n)
- ✅ Caching granulaire par (user, item)
- ✅ Transparence: badge "Why this post" affichant le score

---

## 🚀 Checklist de Déploiement

```
Phase 1: Migration DB & Infrastructure
- [ ] Créer table feed_content_scoring
- [ ] Créer index optimisés
- [ ] Backfill data existants (posts -> scoring)
- [ ] Test performance avec 100k+ items
- [ ] Redis invalidation strategy

Phase 2: Backend Service Update
- [ ] FeedScoringService (calcul scores)
- [ ] FeedSignalsRepository (interactions)
- [ ] Intégration dans FeedService
- [ ] Tests: creativity, opportunity, talent scores
- [ ] API: /api/feed?cursor=... (staging)

Phase 3: Frontend Integration
- [ ] Hook useFeedInfiniteScroll
- [ ] Composant FeedWithInfiniteScroll
- [ ] Afficher metadata de scoring
- [ ] Infinite scroll (Intersection Observer)
- [ ] Client-side deduplication

Phase 4: Monitoring & Analytics
- [ ] Logger toutes les décisions de scoring
- [ ] Metrique: CTR* par type (creativity/opp/talent)
- [ ] Metrique: % de feed scrollé avant abandon
- [ ] Metrique: diversité des sources

Phase 5: Rollout Graduel
- [ ] 10% utilisateurs (feature flag)
- [ ] 50% utilisateurs
- [ ] 100% (full deployment)
```

---

## 🎨 Wireframe du Feed Futur

```
┌─────────────────────────────────┐
│  🔥 TRENDING CREATIVITY          │
│  ┌───────────────────────────┐   │
│  │ @designer shared portfolio  │   │
│  │ [Image: Award winning design] │
│  │ ⭐ 3.2k likes | 💬 456 comments │
│  │ WHY: Your skills match 95%  │   │
│  └───────────────────────────┘   │
│                                   │
│  📌 NEW OPPORTUNITY               │
│  ┌───────────────────────────┐   │
│  │ [Job] Senior Fullstack Dev  │   │
│  │ Paris · €50-70k · Remote ok  │   │
│  │ WHY: Matches your profile   │   │
│  ├─ React, Node, PostgreSQL   ├─  │
│  └───────────────────────────┘   │
│                                   │
│  ⭐ RISING TALENT TO FOLLOW       │
│  ┌───────────────────────────┐   │
│  │ @dev_ninja · Fullstack Dev  │   │
│  │ 234 followers · Verified ✓  │   │
│  │ [3 recent projects]         │   │
│  │ WHY: 50 shared connections  │   │
│  └───────────────────────────┘   │
│                                   │
│  ↓ [Load more...]                 │
└─────────────────────────────────┘
```

---

## Questions pour Affiner la Stratégie

1. **Quelle est ta métrique de succès?** (DAU, engagement time, CTR spécifique?)
2. **Quels types de posts dominent?** (Mostly jobs, creativity, networking?)
3. **Avez-vous des données d'engagement historiques?** (Pour entraîner les poids)
4. **Budget serveur / latency target?** (p99 < 200ms?)
5. **A/B test prêt ou déploiement direct?**

---

**Prochaines Actions:**
1. ✅ Créer les tables SQL
2. ✅ Implémenter FeedScoringService
3. ✅ Tester scoring sur 10k posts
4. ✅ Implémenter cursor pagination
5. ✅ Rollout progressif
