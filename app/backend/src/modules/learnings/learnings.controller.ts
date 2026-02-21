import { NextFunction, Request, Response } from 'express';
import { LearningsServices } from "./learnings.services";
import Logger from "../../infra/logger/winston";
import { SecureRequest } from '../../infra/middleware/auth.middleware';

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class LearningsController {
    constructor(
        private readonly learningsService: LearningsServices,
        private readonly logger: Logger
    ) { }

    getCourseCategories = AsyncHandler(async (req: Request, res: Response) => {
        const categories = await this.learningsService.getCourseCategories();
        return res.status(200).json({ success: true, data: categories });
    });

    createCourse = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const courseData = { ...req.body, author_id: req.user?.id };
        const course = await this.learningsService.createCourse(courseData);
        return res.status(201).json({ success: true, data: course });
    });

    getCourseBySlug = AsyncHandler(async (req: Request, res: Response) => {
        const { slug } = req.params;
        const course = await this.learningsService.getCourseBySlug(slug as string);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        return res.status(200).json({ success: true, data: course });
    });

    getCourseById = AsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const course = await this.learningsService.getCourseById(id as string);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        return res.status(200).json({ success: true, data: course });
    });

    updateCourse = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const { id } = req.params;
        const course = await this.learningsService.updateCourse(id as string, req.body);
        return res.status(200).json({ success: true, data: course });
    });

    createChapter = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const chapter = await this.learningsService.createChapter(req.body);
        return res.status(201).json({ success: true, data: chapter });
    });

    getChaptersByCourseId = AsyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const chapters = await this.learningsService.getChaptersByCourseId(courseId as string);
        return res.status(200).json({ success: true, data: chapters });
    });

    createLesson = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const lesson = await this.learningsService.createLesson(req.body);
        return res.status(201).json({ success: true, data: lesson });
    });

    updateLesson = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const { id } = req.params;
        const lesson = await this.learningsService.updateLesson(id as string, req.body);
        return res.status(200).json({ success: true, data: lesson });
    });

    getLessonsByChapterWithProgress = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const { chapterId } = req.params;
        const userId = req.user?.id;
        const lessons = await this.learningsService.getLessonsByChapterWithProgress(chapterId as string, userId!);
        return res.status(200).json({ success: true, data: lessons });
    });

    markAsCompleted = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const { lessonId } = req.params;
        const { courseId } = req.body;
        const userId = req.user?.id;
        await this.learningsService.markAsCompleted(lessonId as string, userId!, courseId);
        return res.status(200).json({ success: true, message: 'Lesson marked as completed' });
    });

    enrollUser = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const data = { ...req.body, user_id: req.user?.id };
        const enrollment = await this.learningsService.enrollUser(data);
        return res.status(201).json({ success: true, data: enrollment });
    });

    getUserDashboard = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const userId = req.user?.id;
        const dashboard = await this.learningsService.getUserDashboard(userId!);
        return res.status(200).json({ success: true, data: dashboard });
    });

    addReview = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const data = { ...req.body, user_id: req.user?.id };
        const review = await this.learningsService.addReview(data);
        return res.status(201).json({ success: true, data: review });
    });

    getCourseReviews = AsyncHandler(async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const reviews = await this.learningsService.getCourseReviews(courseId as string);
        return res.status(200).json({ success: true, data: reviews });
    });

    getMarketplaceCourses = AsyncHandler(async (req: Request, res: Response) => {
        const { category, level } = req.query;
        const courses = await this.learningsService.getMarketplaceCourses({
            category: category as string,
            level: level as string
        });
        return res.status(200).json({ success: true, data: courses });
    });

    getInstructorDashboard = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const authorId = req.user?.id;
        const data = await this.learningsService.getInstructorDashboard(authorId!);
        return res.status(200).json({ success: true, data });
    });

    becomeInstructor = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const userId = req.user?.id;
        const {
            headline,
            bio,
            expertiseTopics,
            courseIdea,
            motivation,
            sampleVideoUrl,
            audienceSize,
            domains,
            languages,
        } = req.body;

        // Build headline from payload or default to user's current headline
        const resolvedHeadline = (headline && headline.trim().length >= 1)
            ? headline.trim()
            : undefined; // COALESCE in SQL will keep the existing value

        // Build bio from expertiseTopics if bio not explicitly set
        const resolvedBio = bio || expertiseTopics || undefined;

        await this.learningsService.becomeInstructor(userId!, {
            headline: resolvedHeadline,
            bio: resolvedBio,
        });

        return res.status(200).json({
            success: true,
            message: 'Félicitations ! Vous êtes maintenant formateur.',
            data: { is_instructor: true }
        });
    });
}
