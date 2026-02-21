"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningsRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const learnings_middleware_1 = require("./learnings.middleware");
class LearningsRoutes {
    constructor(controller) {
        this.controller = controller;
        this.router = (0, express_1.Router)();
        this.learningsMiddleware = new learnings_middleware_1.LearningsMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/marketplace', this.controller.getMarketplaceCourses);
        this.router.get('/instructor/dashboard', auth_middleware_1.AuthGuard.authenticate, this.learningsMiddleware.isInstructor, this.controller.getInstructorDashboard);
        this.router.post('/courses', auth_middleware_1.AuthGuard.authenticate, this.learningsMiddleware.isInstructor, this.controller.createCourse);
        this.router.get('/courses/:slug', this.controller.getCourseBySlug);
        this.router.post('/chapters', auth_middleware_1.AuthGuard.authenticate, this.learningsMiddleware.isInstructor, this.controller.createChapter);
        this.router.get('/chapters/:courseId', this.controller.getChaptersByCourseId);
        this.router.post('/lessons', auth_middleware_1.AuthGuard.authenticate, this.learningsMiddleware.isInstructor, this.controller.createLesson);
        this.router.get('/chapters/:chapterId/lessons/progress', auth_middleware_1.AuthGuard.authenticate, this.controller.getLessonsByChapterWithProgress);
        this.router.post('/lessons/:lessonId/complete', auth_middleware_1.AuthGuard.authenticate, this.controller.markAsCompleted);
        this.router.post('/enroll', auth_middleware_1.AuthGuard.authenticate, this.controller.enrollUser);
        this.router.get('/dashboard', auth_middleware_1.AuthGuard.authenticate, this.controller.getUserDashboard);
        this.router.post('/reviews', auth_middleware_1.AuthGuard.authenticate, this.controller.addReview);
        this.router.get('/reviews/:courseId', this.controller.getCourseReviews);
    }
    getRouter() {
        return this.router;
    }
}
exports.LearningsRoutes = LearningsRoutes;
//# sourceMappingURL=learnings.routes.js.map