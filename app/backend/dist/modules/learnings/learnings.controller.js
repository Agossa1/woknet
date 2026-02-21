"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsController = void 0;
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
class LearningsController {
    constructor(learningsService, logger) {
        this.learningsService = learningsService;
        this.logger = logger;
        this.createCourse = AsyncHandler(async (req, res) => {
            const courseData = { ...req.body, author_id: req.user?.id };
            const course = await this.learningsService.createCourse(courseData);
            return res.status(201).json({ success: true, data: course });
        });
        this.getCourseBySlug = AsyncHandler(async (req, res) => {
            const { slug } = req.params;
            const course = await this.learningsService.getCourseBySlug(slug);
            if (!course)
                return res.status(404).json({ success: false, message: 'Course not found' });
            return res.status(200).json({ success: true, data: course });
        });
        this.createChapter = AsyncHandler(async (req, res) => {
            const chapter = await this.learningsService.createChapter(req.body);
            return res.status(201).json({ success: true, data: chapter });
        });
        this.getChaptersByCourseId = AsyncHandler(async (req, res) => {
            const { courseId } = req.params;
            const chapters = await this.learningsService.getChaptersByCourseId(courseId);
            return res.status(200).json({ success: true, data: chapters });
        });
        this.createLesson = AsyncHandler(async (req, res) => {
            const lesson = await this.learningsService.createLesson(req.body);
            return res.status(201).json({ success: true, data: lesson });
        });
        this.getLessonsByChapterWithProgress = AsyncHandler(async (req, res) => {
            const { chapterId } = req.params;
            const userId = req.user?.id;
            const lessons = await this.learningsService.getLessonsByChapterWithProgress(chapterId, userId);
            return res.status(200).json({ success: true, data: lessons });
        });
        this.markAsCompleted = AsyncHandler(async (req, res) => {
            const { lessonId } = req.params;
            const { courseId } = req.body;
            const userId = req.user?.id;
            await this.learningsService.markAsCompleted(lessonId, userId, courseId);
            return res.status(200).json({ success: true, message: 'Lesson marked as completed' });
        });
        this.enrollUser = AsyncHandler(async (req, res) => {
            const data = { ...req.body, user_id: req.user?.id };
            const enrollment = await this.learningsService.enrollUser(data);
            return res.status(201).json({ success: true, data: enrollment });
        });
        this.getUserDashboard = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            const dashboard = await this.learningsService.getUserDashboard(userId);
            return res.status(200).json({ success: true, data: dashboard });
        });
        this.addReview = AsyncHandler(async (req, res) => {
            const data = { ...req.body, user_id: req.user?.id };
            const review = await this.learningsService.addReview(data);
            return res.status(201).json({ success: true, data: review });
        });
        this.getCourseReviews = AsyncHandler(async (req, res) => {
            const { courseId } = req.params;
            const reviews = await this.learningsService.getCourseReviews(courseId);
            return res.status(200).json({ success: true, data: reviews });
        });
        this.getMarketplaceCourses = AsyncHandler(async (req, res) => {
            const { category, level } = req.query;
            const courses = await this.learningsService.getMarketplaceCourses({
                category: category,
                level: level
            });
            return res.status(200).json({ success: true, data: courses });
        });
        this.getInstructorDashboard = AsyncHandler(async (req, res) => {
            const authorId = req.user?.id;
            const data = await this.learningsService.getInstructorDashboard(authorId);
            return res.status(200).json({ success: true, data });
        });
    }
}
exports.LearningsController = LearningsController;
//# sourceMappingURL=learnings.controller.js.map