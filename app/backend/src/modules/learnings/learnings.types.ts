// src/features/learnings/types/learnings.types.ts

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ContentType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'DOCUMENT';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED';

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Course {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  level: CourseLevel;
  category_id: string | null;
  category: string | null; // Displays the name after join
  status: CourseStatus;
  created_at: Date | string;
  updated_at: Date | string;
  learning_objectives?: string[];
  requirements?: string[];
  target_audience?: string[];
  long_description?: string | null;

  // Relations optionnelles (chargées via jointures)
  author?: {
    full_name: string;
    avatar_url: string;
  };
  chapters?: CourseChapter[];
  _count?: {
    enrollments: number;
  };
}

export interface CourseChapter {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: CourseLesson[]; // Souvent chargé ensemble
}

export interface CourseLesson {
  id: string;
  chapter_id: string;
  title: string;
  content_type: ContentType;
  video_url: string | null;
  content_text: string | null;
  attachments?: { title: string; url: string; type: string }[] | null;
  duration_minutes: number;
  is_free_preview: boolean;
  sort_order: number;

  // État de progression pour l'utilisateur connecté
  is_completed?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  amount_paid: number;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  progress_percentage: number;
  enrolled_at: Date | string;

  // Jointure pour le dashboard
  course?: Course;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number; // 1 à 5
  comment: string | null;
  created_at: Date | string;
  user_name?: string; // Pour l'affichage
}

// Type utilitaire pour le résumé dans le catalogue (Marketplace)
export type CourseCardData = Pick<Course, 'id' | 'title' | 'slug' | 'thumbnail_url' | 'price' | 'level' | 'category'> & {
  author_name: string;
  rating_avg: number;
  enrollments_count: number;
};

export interface IDatabase {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
}
