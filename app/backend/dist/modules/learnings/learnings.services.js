"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsServices = void 0;
class LearningsServices {
    constructor(learningsRepository, logger) {
        this.learningsRepository = learningsRepository;
        this.logger = logger;
    }
    async createCourse(courseData) {
        return this.learningsRepository.createCourse(courseData);
    }
    async getCourseBySlug(slug) {
        return this.learningsRepository.getCourseBySlug(slug);
    }
    async createChapter(chapter) {
        return this.learningsRepository.createChapter(chapter);
    }
    async getChaptersByCourseId(courseId) {
        return this.learningsRepository.getChaptersByCourseId(courseId);
    }
    async createLesson(lesson) {
        return this.learningsRepository.createLesson(lesson);
    }
    async getLessonsByChapterWithProgress(chapterId, userId) {
        return this.learningsRepository.getLessonsByChapterWithProgress(chapterId, userId);
    }
    async markAsCompleted(lessonId, userId, courseId) {
        await this.learningsRepository.markAsCompleted(lessonId, userId);
        await this.learningsRepository.updateProgress(courseId, userId);
    }
    async enrollUser(data) {
        return this.learningsRepository.enrollUser(data);
    }
    async getUserDashboard(userId) {
        return this.learningsRepository.getUserDashboard(userId);
    }
    async addReview(review) {
        return this.learningsRepository.addReview(review);
    }
    async getCourseReviews(courseId) {
        return this.learningsRepository.getCourseReviews(courseId);
    }
    async getMarketplaceCourses(filters) {
        return this.learningsRepository.getMarketplaceCourses(filters);
    }
    async getInstructorDashboard(authorId) {
        return this.learningsRepository.getInstructorDashboard(authorId);
    }
}
exports.LearningsServices = LearningsServices;
//# sourceMappingURL=learnings.services.js.map