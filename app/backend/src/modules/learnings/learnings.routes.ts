import { Router } from 'express';
import { AuthGuard } from '../../infra/middleware/auth.middleware';
import { LearningsController } from './learnings.controller';
import { LearningsMiddleware } from './learnings.middleware';

export class LearningsRoutes {
    private readonly router: Router;

    constructor(
        private readonly controller: LearningsController,
        private readonly learningsMiddleware: LearningsMiddleware
    ) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/categories', this.controller.getCourseCategories);
        this.router.get('/marketplace', this.controller.getMarketplaceCourses);

        // Route pour devenir formateur
        this.router.post('/instructor/become', AuthGuard.authenticate, this.controller.becomeInstructor);

        // Routes protégées par le statut formateur
        this.router.get(
            '/instructor/dashboard',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.getInstructorDashboard
        );
        this.router.post(
            '/courses',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.createCourse
        );
        this.router.get('/courses/:slug', this.controller.getCourseBySlug);
        this.router.get('/courses/id/:id', AuthGuard.authenticate, this.controller.getCourseById);
        this.router.put(
            '/courses/:id',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.updateCourse
        );

        this.router.post(
            '/chapters',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.createChapter
        );
        this.router.get('/chapters/:courseId', this.controller.getChaptersByCourseId);

        this.router.post(
            '/lessons',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.createLesson
        );
        this.router.put(
            '/lessons/:id',
            AuthGuard.authenticate,
            this.learningsMiddleware.isInstructor,
            this.controller.updateLesson
        );
        this.router.get('/chapters/:chapterId/lessons/progress', AuthGuard.authenticate, this.controller.getLessonsByChapterWithProgress);
        this.router.post('/lessons/:lessonId/complete', AuthGuard.authenticate, this.controller.markAsCompleted);

        this.router.post('/enroll', AuthGuard.authenticate, this.controller.enrollUser);
        this.router.get('/dashboard', AuthGuard.authenticate, this.controller.getUserDashboard);

        this.router.post('/reviews', AuthGuard.authenticate, this.controller.addReview);
        this.router.get('/reviews/:courseId', this.controller.getCourseReviews);
    }

    public getRouter(): Router {
        return this.router;
    }
}
