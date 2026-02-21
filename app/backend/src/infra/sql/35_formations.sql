-- 1. LA FORMATION (Le produit principal)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL, -- Lien vers ta table users (le formateur)
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    
    -- Monétisation
    price DECIMAL(10, 2) DEFAULT 0.00, -- 0.00 = Gratuit
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Métadonnées
    level VARCHAR(50) DEFAULT 'BEGINNER', -- BEGINNER, INTERMEDIATE, ADVANCED
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. LES CHAPITRES (Pour structurer la formation)
CREATE TABLE course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL, -- Pour ordonner les chapitres (1, 2, 3...)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LES LEÇONS (Le vrai contenu)
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    
    -- Type de contenu
    content_type VARCHAR(50) DEFAULT 'VIDEO', -- VIDEO, TEXT, QUIZ
    video_url VARCHAR(500), -- Lien Mux, YouTube, AWS S3, etc.
    content_text TEXT, -- Si c'est un article ou des notes complémentaires
    duration_minutes INT DEFAULT 0,
    
    -- Marketing
    is_free_preview BOOLEAN DEFAULT FALSE, -- Super important : permet de voir la vidéo 1 gratuitement pour donner envie d'acheter
    
    sort_order INT NOT NULL, -- Ordre de la leçon dans le chapitre
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. LES INSCRIPTIONS / ACHATS (Qui a acheté quoi)
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    user_id UUID NOT NULL, -- L'étudiant (celui qui achète)
    
    -- Données de paiement (Essentiel pour Stripe)
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, REFUNDED
    stripe_session_id VARCHAR(255) UNIQUE, -- Pour lier la transaction au paiement
    
    progress_percentage INT DEFAULT 0, -- De 0 à 100
    
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id) -- Un utilisateur ne peut acheter qu'une seule fois la même formation
);

-- 5. LA PROGRESSION DÉTAILLÉE (Pour cocher les leçons terminées)
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    
    is_completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, lesson_id)
);

-- 6. LES AVIS (Le nerf de la guerre pour vendre)
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- L'étudiant qui donne son avis
    
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL, -- De 1 à 5 étoiles
    comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id) -- Un seul avis par utilisateur pour un cours donné
);