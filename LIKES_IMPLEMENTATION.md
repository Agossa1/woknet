# Implementation: Récupérer les Likes avec Infos Utilisateur

## 🎯 Objectif
Ajouter la possibilité de récupérer le `full_name`, `username`, `display_name` et `avatar_url` des utilisateurs qui ont liké un post, **sans casser la logique existante** du toggle like.

## ✅ Implémentation Backend

### 1. Types (`likes.types.ts`)
```typescript
export interface LikeWithUser extends Like {
    full_name: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
}
```

### 2. Repository (`likes.repository.ts`)
Nouvelle méthode avec JOIN sur `profiles` et `users`:
```typescript
async getPostLikesWithUsers(postId: string): Promise<LikeWithUser[]> {
    const sql = `
        SELECT 
            l.profile_id,
            l.post_id,
            l.created_at,
            u.full_name,
            p.username,
            p.display_name,
            p.avatar_url
        FROM likes l
        INNER JOIN profiles p ON l.profile_id = p.user_id
        INNER JOIN users u ON p.user_id = u.id
        WHERE l.post_id = $1
        ORDER BY l.created_at DESC
    `;
    return await this.db.query<LikeWithUser>(sql, [postId]);
}
```

### 3. Service (`likes.services.ts`)
```typescript
async getPostLikesWithUsers(postId: string) {
    return this.repository.getPostLikesWithUsers(postId);
}
```

### 4. Controller (`likes.controller.ts`)
```typescript
public getPostLikes = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.postId as string;
    const likes = await this.service.getPostLikesWithUsers(postId);
    res.json({ likes, count: likes.length });
};
```

### 5. Route (`likes.routes.ts`)
```typescript
this.router.get("/:postId", AuthGuard.authenticate, this.controller.getPostLikes);
```

## ✅ Implémentation Frontend

### 1. Types (`posts-types.ts`)
```typescript
export interface LikeWithUser {
    profile_id: string;
    post_id?: string;
    comment_id?: string;
    created_at: string;
    full_name: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
}

export interface GetPostLikesResponse {
    likes: LikeWithUser[];
    count: number;
}
```

### 2. API Service (`posts-api.ts`)
```typescript
public async getPostLikes(postId: string): Promise<{ likes: any[], count: number }> {
    return this.apiClient.get<{ likes: any[], count: number }>(`/likes/${postId}`);
}
```

## 📋 Utilisation

### Exemple 1: Récupérer les likes d'un post
```typescript
// Dans un composant React
import { postsApi } from '@/features/posts/services/posts-api';

const fetchPostLikes = async (postId: string) => {
    try {
        const response = await postsApi.getPostLikes(postId);
        console.log(`${response.count} personnes ont liké ce post:`);
        response.likes.forEach(like => {
            console.log(`- ${like.full_name} (@${like.username})`);
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
};
```

### Exemple 2: Afficher la liste des likes
```tsx
import { useState, useEffect } from 'react';
import { postsApi } from '@/features/posts/services/posts-api';
import { LikeWithUser } from '@/features/posts/services/posts-types';

const LikesModal = ({ postId }: { postId: string }) => {
    const [likes, setLikes] = useState<LikeWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const response = await postsApi.getPostLikes(postId);
                setLikes(response.likes);
            } catch (error) {
                console.error('Erreur lors du chargement des likes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikes();
    }, [postId]);

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="likes-modal">
            <h3>{likes.length} J'aime</h3>
            <ul>
                {likes.map(like => (
                    <li key={like.profile_id} className="flex items-center gap-3 p-3">
                        <img 
                            src={like.avatar_url || '/default-avatar.png'} 
                            alt={like.full_name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="font-semibold">
                                {like.display_name || like.full_name}
                            </p>
                            <p className="text-sm text-gray-500">@{like.username}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

## 🔥 Endpoint API

**GET** `/api/likes/:postId`

**Headers:**
- `Authorization: Bearer <token>`

**Réponse:**
```json
{
    "likes": [
        {
            "profile_id": "uuid-here",
            "post_id": "post-uuid",
            "created_at": "2026-02-16T14:30:00.000Z",
            "full_name": "Jean Dupont",
            "username": "jeandupont",
            "display_name": "Jean D.",
            "avatar_url": "https://cloudinary.com/avatar.jpg"
        }
    ],
    "count": 1
}
```

## ⚠️ Points Importants

1. **La logique du toggle like reste INTACTE** - Aucun changement sur `/likes/toggle` ou `/likes/check/:postId`
2. **Performance optimisée** - Utilisation de JOIN au lieu de requêtes multiples
3. **Ordre chronologique** - Les likes les plus récents apparaissent en premier (`ORDER BY created_at DESC`)
4. **Sécurité** - Endpoint protégé par `AuthGuard.authenticate`

## 🚀 Prochaines Étapes

- [ ] Créer un composant UI pour afficher la liste des likes
- [ ] Ajouter la pagination si le nombre de likes devient important
- [ ] Implémenter le même système pour les likes de commentaires
- [ ] Ajouter un cache Redis pour les requêtes fréquentes
