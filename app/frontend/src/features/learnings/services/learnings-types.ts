// ─── Course Category ──────────────────────────────────────────────────────────
export interface CourseCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
}

// ─── Course (La Formation) ───────────────────────────────────────────────────

export interface Course {
    id: string;
    author_id: string;
    title: string;
    slug: string;
    description?: string | null;
    thumbnail_url?: string | null;
    price: number;
    currency: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category_id?: string | null;
    category?: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    created_at: string;
    updated_at: string;
    learning_objectives?: string[];
    requirements?: string[];
    target_audience?: string[];
    long_description?: string | null;
    // Joined fields
    author_name?: string;
    author_avatar?: string;
    avg_rating?: number;
    review_count?: number;
    enrollment_count?: number;
}

export interface CreateCourseDTO {
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    price?: number;
    currency?: string;
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category_id?: string;
    learning_objectives?: string[];
    requirements?: string[];
    target_audience?: string[];
    long_description?: string;
}

// ─── Chapter (Le Chapitre) ───────────────────────────────────────────────────

export interface Chapter {
    id: string;
    course_id: string;
    title: string;
    sort_order: number;
    created_at: string;
    lessons?: Lesson[];
}

export interface CreateChapterDTO {
    course_id: string;
    title: string;
    sort_order: number;
}

// ─── Lesson (La Leçon) ───────────────────────────────────────────────────────

export interface Lesson {
    id: string;
    chapter_id: string;
    title: string;
    content_type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'DOCUMENT';
    video_url?: string | null;
    content_text?: string | null;
    attachments?: { title: string; url: string; type: string }[] | null;
    duration_minutes: number;
    is_free_preview: boolean;
    sort_order: number;
    created_at: string;
    // Progress (joined)
    is_completed?: boolean;
}

export interface CreateLessonDTO {
    chapter_id: string;
    title: string;
    content_type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'DOCUMENT';
    video_url?: string;
    content_text?: string;
    duration_minutes?: number;
    is_free_preview?: boolean;
    sort_order: number;
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
    id: string;
    course_id: string;
    user_id: string;
    amount_paid: number;
    payment_status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    progress_percentage: number;
    enrolled_at: string;
    // Joined
    course?: Course;
}

export interface EnrollDTO {
    course_id: string;
    amount_paid: number;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
    id: string;
    course_id: string;
    user_id: string;
    rating: number;
    comment?: string | null;
    created_at: string;
    // Joined
    reviewer_name?: string;
    reviewer_avatar?: string;
}

export interface AddReviewDTO {
    course_id: string;
    rating: number;
    comment?: string;
}

// ─── Instructor course with stats ────────────────────────────────────────────
export interface InstructorCourse extends Course {
    total_students: number;
    total_revenue: number;
    avg_rating: number;
    review_count: number;
    chapter_count: number;
}

export interface BecomeInstructorDTO {
    headline?: string;
    bio?: string;
    // Application-specific fields (stored as metadata or ignored by backend if not mapped)
    expertiseTopics?: string;
    courseIdea?: string;
    motivation?: string;
    sampleVideoUrl?: string;
    audienceSize?: string;
    domains?: string[];
    languages?: string[];
}

// ─── Redux State ──────────────────────────────────────────────────────────────

export interface LearningsState {
    // Categories
    categories: CourseCategory[];

    // Marketplace
    marketplaceCourses: Course[];
    currentCourse: Course | null;
    currentChapters: Chapter[];
    currentReviews: Review[];

    // My dashboard (enrolled courses)
    myEnrollments: Enrollment[];

    // Instructor dashboard
    instructorCourses: InstructorCourse[];

    // UI
    isLoading: boolean;
    isEnrolling: boolean;
    error: string | null;
}
