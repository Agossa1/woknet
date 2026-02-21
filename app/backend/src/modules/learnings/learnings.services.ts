import { LearningsRepository } from "./learnings.repository";
import Logger from "../../infra/logger/winston";
import { Course, CourseCardData, CourseCategory, CourseChapter, CourseEnrollment, CourseLesson, CourseReview } from "./learnings.types";

export class LearningsServices {
    constructor(
        private readonly learningsRepository: LearningsRepository,
        private readonly logger: Logger
    ) { }

    async getCourseCategories(): Promise<CourseCategory[]> {
        return this.learningsRepository.getCourseCategories();
    }

    async createCourse(courseData: Partial<Course>): Promise<Course | null> {
        return this.learningsRepository.createCourse(courseData);
    }

    async getCourseBySlug(slug: string): Promise<Course | null> {
        return this.learningsRepository.getCourseBySlug(slug);
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.learningsRepository.getCourseById(id);
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
        return this.learningsRepository.updateCourse(id, courseData);
    }

    async createChapter(chapter: Partial<CourseChapter>): Promise<CourseChapter> {
        return this.learningsRepository.createChapter(chapter);
    }

    async getChaptersByCourseId(courseId: string): Promise<CourseChapter[]> {
        return this.learningsRepository.getChaptersByCourseId(courseId);
    }

    async createLesson(lesson: Partial<CourseLesson>): Promise<CourseLesson> {
        return this.learningsRepository.createLesson(lesson);
    }

    async updateLesson(id: string, lessonData: Partial<CourseLesson>): Promise<CourseLesson | null> {
        return this.learningsRepository.updateLesson(id, lessonData);
    }

    async getLessonsByChapterWithProgress(chapterId: string, userId: string): Promise<CourseLesson[]> {
        return this.learningsRepository.getLessonsByChapterWithProgress(chapterId, userId);
    }

    async markAsCompleted(lessonId: string, userId: string, courseId: string): Promise<void> {
        await this.learningsRepository.markAsCompleted(lessonId, userId);
        await this.learningsRepository.updateProgress(courseId, userId);
    }

    async enrollUser(data: Partial<CourseEnrollment>): Promise<CourseEnrollment> {
        return this.learningsRepository.enrollUser(data);
    }

    async getUserDashboard(userId: string): Promise<CourseEnrollment[]> {
        return this.learningsRepository.getUserDashboard(userId);
    }

    async addReview(review: Partial<CourseReview>): Promise<CourseReview> {
        return this.learningsRepository.addReview(review);
    }

    async getCourseReviews(courseId: string): Promise<CourseReview[]> {
        return this.learningsRepository.getCourseReviews(courseId);
    }

    async getMarketplaceCourses(filters: { category?: string; level?: string }): Promise<CourseCardData[]> {
        return this.learningsRepository.getMarketplaceCourses(filters);
    }

    async getInstructorDashboard(authorId: string): Promise<any[]> {
        return this.learningsRepository.getInstructorDashboard(authorId);
    }

    async becomeInstructor(userId: string, data: { headline?: string; bio?: string }): Promise<void> {
        return this.learningsRepository.becomeInstructor(userId, data);
    }
}
