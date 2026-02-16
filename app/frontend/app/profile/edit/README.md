# Profile Edit Page - Architecture modulaire

## 📁 Structure

```
app/profile/edit/
├── page.tsx                    # Page principale (orchestrateur)
└── components/
    ├── index.ts                # Exports centralisés
    ├── basic-info-section.tsx  # Informations de base
    ├── social-links-section.tsx # Réseaux sociaux
    ├── experiences-section.tsx # Liste des expériences
    ├── skills-edit-section.tsx # Liste des compétences
    ├── experience-modal.tsx    # Modal d'ajout/modification d'expérience
    └── skill-search-modal.tsx  # Modal de recherche/ajout de compétence
```

## 🎨 Design Minimaliste

### Principes appliqués

1. **Espacement cohérent** : Utilisation de `space-y-6` et `space-y-8` pour un rythme vertical régulier
2. **Bordures subtiles** : `border-gray-200 dark:border-gray-700` pour une séparation douce
3. **Typography claire** : Hiérarchie visuelle avec labels en uppercase tracking-widest
4. **Interactions douces** : Transitions smooth sur tous les éléments interactifs
5. **Layout responsive** : Grid adaptatif avec `grid-cols-1 md:grid-cols-2`

### Palette de couleurs

- **Primary Action**: `bg-gray-900 dark:bg-white` (boutons principaux)
- **Secondary Action**: `bg-gray-100 dark:bg-gray-800` (boutons secondaires)
- **Borders**: `border-gray-200 dark:border-gray-700`
- **Backgrounds**: `bg-gray-50 dark:bg-gray-900`
- **Accents**: `text-blue-600 dark:text-blue-400` (focus states)

## 🔧 Composants

### BasicInfoSection
- **Props**: `formData`, `onChange`
- **Fonction**: Gère username, display_name, bio, location, website
- **Design**: Grille responsive avec labels uppercase

### SocialLinksSection
- **Props**: `formData`, `visibleSocials`, `onAddSocial`, `onRemoveSocial`, `onChange`
- **Fonction**: Gestion dynamique des liens de réseaux sociaux
- **Features**: Dropdown de sélection, suppression au hover

### ExperiencesSection
- **Props**: `experiences`, `isLoading`, `onAdd`, `onEdit`, `onDelete`
- **Fonction**: Affiche la liste des expériences professionnelles
- **Features**: Actions au hover (éditer/supprimer), état vide élégant

### SkillsEditSection
- **Props**: `skills`, `isLoading`, `onAdd`, `onRemove`
- **Fonction**: Affiche les compétences avec badges d'endorsements
- **Features**: Suppression au hover, design compact

### ExperienceModal
- **Props**: `experience`, `onClose`
- **Fonction**: Modal complet pour créer/modifier une expérience
- **Features**: Validation, gestion du stack technique avec tags

### SkillSearchModal
- **Props**: `profileId`, `onClose`
- **Fonction**: Recherche et ajout de compétences
- **Features**: Autocomplete, création de nouvelles compétences

## 🚀 Avantages de cette architecture

### Scalabilité
- Chaque composant peut évoluer indépendamment
- Facile d'ajouter de nouvelles sections
- Tests unitaires simplifiés

### Maintenabilité
- Code DRY (Don't Repeat Yourself)
- Responsabilités séparées
- Imports centralisés via `index.ts`

### Performance
- Composants légers et focalisés
- Re-renders optimisés par section
- Lazy loading possible pour les modaux

### Developer Experience
- Structure claire et prévisible
- Auto-complétion TypeScript optimale
- Documentation intégrée via props types

## 🔄 Flux de données

```
page.tsx (State global)
    │
    ├─→ BasicInfoSection (lecture/écriture formData)
    ├─→ SocialLinksSection (lecture/écriture formData + visibleSocials)
    ├─→ ExperiencesSection (lecture experiences + callbacks)
    ├─→ SkillsEditSection (lecture skills + callbacks)
    ├─→ ExperienceModal (Redux dispatches)
    └─→ SkillSearchModal (Redux dispatches)
```

## 📝 Utilisation

```tsx
import { 
  BasicInfoSection, 
  SocialLinksSection,
  ExperiencesSection,
  SkillsEditSection,
  ExperienceModal,
  SkillSearchModal 
} from './components';

// Dans votre page
<BasicInfoSection formData={formData} onChange={handleChange} />
```

## 🎯 Prochaines améliorations possibles

1. **Validation** : Ajouter une bibliothèque comme Zod ou Yup
2. **Animations** : Framer Motion pour les transitions
3. **Feedback visuel** : Toast notifications pour les succès/erreurs
4. **Upload d'images** : Drag & drop pour avatar/banner
5. **Preview mode** : Prévisualiser le profil avant de sauvegarder
