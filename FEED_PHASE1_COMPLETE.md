# 🚀 Phase 1: Mise en Place - Cursor & Scoring (COMPLÈTÉE)

## ✅ Étapes Complétées

### 1. **SQL Migration** (31_create_feed_scoring.sql)
```sql
✓ Table feed_content_scoring
  - scoring_id, item_id, user_viewing (composite PK)
  - creativity_score, opportunity_score, talent_showcase_score (0-100)
  - relevance_to_user_skills, final_rank_score
  - Indexes optimisés pour recherche rapide

✓ Table feed_interactions
  - Tracking interactions (VIEW, CLICK, SHARE, SAVE)
  - time_spent_ms pour analytics
  
✓ View feed_items_with_scoring
  - Compatible avec ancien système
  - Scores personnalisés intégrés
```

### 2. **Backend Services** 
```typescript
✓ feed.scoring.service.ts
  - calculateCreativityScore()        // Média + engagement velocity
  - calculateOpportunityScore()       // Jobs + freshness
  - calculateTalentScore()            // Portfolio + reputation
  - calculatePersonalRelevance()      // Following + skill match
  - calculateFinalScore()             // Combined 4 factors

✓ feed.signals.repository.ts
  - Récupère interactions utilisateur (30 jours)
  - buildInteractionProfile()
  - isUserFollowing()

✓ feed.repository.ts
  - getMainFeedWithCursor()           // Nouveau: cursor-based pagination
  - Retourne: { items, hasMore, nextCursor }

✓ feed.services.ts  
  - getPowerFeed()                    // Ancien (offset-based)
  - getPowerFeedWithCursor()          // NOUVEAU (cursor-based + scoring)
  - assembleFeedWithRecommendations()

✓ feed.controller.ts
  - Support deux modes: ?page= (ancien) et ?cursor_timestamp=&cursor_item_id= (nouveau)
  - Métadonnées enrichies dans réponse
```

---

## 📋 Endpoints Testables

### Mode Cursor-Based (Recommandé)
```bash
GET /api/feed?cursor_timestamp=2025-02-19T10:00:00&cursor_item_id=uuid&limit=15
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post-id",
      "content": "...",
      "scoring": {
        "creativity": 75.5,
        "opportunity": 45.0,
        "talent": 82.3,
        "personalRelevance": 2.5,
        "finalScore": 71.2
      }
    }
  ],
  "metadata": {
    "pageSize": 15,
    "hasMore": true,
    "nextCursor": {
      "timestamp": "2025-02-19T09:50:00",
      "itemId": "last-item-id"
    },
    "method": "cursor-based",
    "personalization": {
      "topSkills": ["React", "TypeScript"],
      "topCreators": ["creator-id-1"],
      "topCompanies": ["company-id-1"],
      "topHashtags": ["#hiring", "#remote"],
      "totalInteractions": 42
    }
  }
}
```

### Mode Page-Based (Ancien, Rétrocompatibilité)
```bash
GET /api/feed?page=1
```

---

## 🔧 Configuration & Env

Mettre en `.env`:
```bash
# Optationnel : configuration
FEED_MAX_PER_AUTHOR=2              # Max posts/auteur

# Body parser (Phase 0 - déjà implémenté)
BODY_PARSER_LIMIT=50mb             # Default si non défini
```

---

## 📊 Scoring Formula

```
final_score = 
  (creativity * 0.25) +              # 25% Innovation/originalité
  (opportunity * 0.35) +             # 35% Jobs/collabs (HIGH priorité)
  (talent * 0.25) +                  # 25% Talents showcasing
  (relevance * 0.15)                 # 15% Pertinence perso

Rangé par: final_score DESC, created_at DESC
```

### Détail des Composantes

**Creativity (0-100)**
- Has media: +30
- Video: +15
- Engagement velocity: +25
- Hashtags count: +15

**Opportunity (0-100)**
- Job posting: +50
- Collaboration request: +40
- Project call: +30
- Freshness (24h): +30

**Talent (0-100)**
- Portfolio link: +25
- Case study: +35
- Verified creator: +15
- Follower count (log): +15
- Creator reputation: +20

**Personal Relevance (multiplicateur)**
- In following: ×2.5
- Same company: ×2.0
- Skill match (%) : +0-30%
- Location proximity: ×1.3

---

## 🧪 Tests Manuels

### 1. Vérifier les tables
```sql
SELECT * FROM feed_content_scoring LIMIT 5;
SELECT * FROM feed_interactions LIMIT 5;
SELECT * FROM feed_items_with_scoring LIMIT 5;
```

### 2. Tester l'endpoint
```bash
curl -X GET "http://localhost:3000/api/feed" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Vérifier le scoring
```typescript
// Dans un test
const service = new FeedScoringService();
const post = { /* post data */ };
const score = service.calculateFinalScore(post, creator, profile, true);
console.log(score); // Should be 0-100
```

---

## 🎯 Résultats Obtenus Après Phase 1

✅ **Pagination performante**
- Ancienne méthode: OFFSET N → O(N) slow
- Nouvelle méthode: Cursor timestamp + ID → O(log N) fast

✅ **Infrastructure scoring prête**
- Tables créées
- Services implémentés
- 4 facteurs de classement configurés

✅ **Dual-mode API**
- Ancien: `?page=1` (rétrocompatible)
- Nouveau: `?cursor_timestamp=...&cursor_item_id=...` (perf++)

✅ **Backend ready to scale**
- Signatures SQL optimisées
- Cache Redis compatible
- Métadonnées enrichies

---

## 📅 Phase 2: Signal Utilization (À venir)

```
[ ] Enregistrer les interactions en temps réel
[ ] Score based on user_signals (30 jours)
[ ] A/B test scoring weights
[ ] Analytics dashboard
```

---

## 📋 Troubleshooting

### Error: "column does not exist"
- Vérifier que les migrations ont réussi: `npm run migrate`
- Vérifier noms colonnes dans posts

### Cursor pagination returns empty
- Vérifier `nextCursor` format: `{timestamp: ISO8601, itemId: UUID}`
- Vérifier user_id valide

### Scoring always returns 0
- Vérifier `FeedScoringService` instancié correctement
- Vérifier post a `likes_count`, `comments_count`

---

## 📚 Fichiers Modifiés

```
✓ src/infra/sql/31_create_feed_scoring.sql          (NEW)
✓ src/modules/feeds/feed.scoring.service.ts         (NEW)
✓ src/modules/feeds/feed.signals.repository.ts      (NEW)
✓ src/modules/feeds/feed.repository.ts              (UPDATED +70 lines)
✓ src/modules/feeds/feed.services.ts                (UPDATED +80 lines)
✓ src/modules/feeds/feed.controller.ts              (UPDATED)
```

---

## 🚀 Procédure Déploiement

1. ✅ **DB Migration**
   ```bash
   npm run migrate
   ```

2. ✅ **Backend Restart**
   ```bash
   npm run dev
   # ou
   pm2 restart backend
   ```

3. ⏭️ **Test Endpoints** (à faire)
   ```bash
   # Old method
   curl /api/feed?page=1
   
   # New method
   curl /api/feed?cursor_timestamp=...&cursor_item_id=...
   ```

4. ⏭️ **Frontend Update** (Phase 2)
   - Intégrer cursors dans hooks React
   - Implémenter Intersection Observer
   - Afficher scoring metadata

---

## 📊 Metrics & Monitoring

À ajouter (Phase 2):
```
- Latency: GET /api/feed (target: p99 < 200ms)
- Cache hit rate: Redis
- Scoring distribution: {creativity, opportunity, talent, relevance}
- Feed diversity: items per author
- User engagement: CTR by score bucket
```

---

## ✨ Prochaines Étapes

| Phase | Focus | Durée | Status |
|-------|-------|-------|--------|
| **1** | Base + Cursor + Scoring | ✅ Complete | ✅ DONE |
| **2** | Signal Integration + Personalization | TBD | → NEXT |
| **3** | Strategies & Boosts | TBD | Planned |
| **4** | Frontend UI | TBD | Planned |
| **5** | Analytics & A/B Test | TBD | Planned |

---

**Status: Phase 1 COMPLETE ✅**
Ready for Phase 2: Signal-based personalization
