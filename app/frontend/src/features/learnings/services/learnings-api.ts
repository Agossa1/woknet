import { api } from "../../api/apiClients";
import { AddReviewDTO, BecomeInstructorDTO, Chapter, Course, CourseCategory, CreateChapterDTO, CreateCourseDTO, CreateLessonDTO, Enrollment, EnrollDTO, Lesson, Review } from "./learnings-types";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const learningsApi = {
    // ─── Categories ─────────────────────────────────────────────────────────────
    getCategories: () =>
        api.get<ApiResponse<CourseCategory[]>>(`/learnings/categories`),

    // ─── Marketplace ────────────────────────────────────────────────────────────
    getMarketplaceCourses: (params?: { category?: string; level?: string }) => {
        const query = new URLSearchParams();
        if (params?.category) query.append('category', params.category);
        if (params?.level) query.append('level', params.level);
        const qs = query.toString() ? `?${query.toString()}` : '';
        return api.get<ApiResponse<Course[]>>(`/learnings/marketplace${qs}`);
    },

    getCourseBySlug: (slug: string) =>
        api.get<ApiResponse<Course>>(`/learnings/courses/${slug}`),

    getCourseById: (id: string) =>
        api.get<ApiResponse<Course>>(`/learnings/courses/id/${id}`),

    getChaptersByCourseId: (courseId: string) =>
        api.get<ApiResponse<Chapter[]>>(`/learnings/chapters/${courseId}`),

    getCourseReviews: (courseId: string) =>
        api.get<ApiResponse<Review[]>>(`/learnings/reviews/${courseId}`),

    // ─── My Dashboard ────────────────────────────────────────────────────────────
    getUserDashboard: () =>
        api.get<ApiResponse<Enrollment[]>>(`/learnings/dashboard`),

    // ─── Enrollment ──────────────────────────────────────────────────────────────
    enrollUser: (dto: EnrollDTO) =>
        api.post<ApiResponse<Enrollment>>(`/learnings/enroll`, dto),

    // ─── Review ──────────────────────────────────────────────────────────────────
    addReview: (dto: AddReviewDTO) =>
        api.post<ApiResponse<Review>>(`/learnings/reviews`, dto),

    // ─── Instructor ──────────────────────────────────────────────────────────────
    createCourse: (dto: CreateCourseDTO) =>
        api.post<ApiResponse<Course>>(`/learnings/courses`, dto),

    updateCourse: (id: string, dto: Partial<Course>) =>
        api.put<ApiResponse<Course>>(`/learnings/courses/${id}`, dto),

    createChapter: (dto: CreateChapterDTO) =>
        api.post<ApiResponse<Chapter>>(`/learnings/chapters`, dto),

    createLesson: (dto: CreateLessonDTO) =>
        api.post<ApiResponse<Lesson>>(`/learnings/lessons`, dto),

    updateLesson: (id: string, dto: Partial<Lesson>) =>
        api.put<ApiResponse<Lesson>>(`/learnings/lessons/${id}`, dto),

    becomeInstructor: (data: BecomeInstructorDTO) =>
        api.post<ApiResponse<{ is_instructor: boolean }>>(`/learnings/instructor/become`, data),

    getInstructorDashboard: () =>
        api.get<ApiResponse<any[]>>(`/learnings/instructor/dashboard`),

    // ─── Progress ────────────────────────────────────────────────────────────────
    markLessonCompleted: (lessonId: string, courseId: string) =>
        api.post<ApiResponse<void>>(`/learnings/lessons/${lessonId}/complete`, { courseId }),

    getLessonsWithProgress: (chapterId: string) =>
        api.get<ApiResponse<Lesson[]>>(`/learnings/lessons/${chapterId}`),

    getUploadSignature: (folder: string = 'worknet/courses') =>
        api.get<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }>(`/uploads/signature?folder=${folder}`),

    uploadThumbnail: async (file: File) => {
        const formData = new FormData();
        formData.append('type', 'course');
        formData.append('file', file);
        return api.post<ApiResponse<{ url: string }>>('/uploads/profile-image', formData);
    },
};
