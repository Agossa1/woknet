import { createAsyncThunk } from "@reduxjs/toolkit";
import { learningsApi } from "./learnings-api";
import { AddReviewDTO, BecomeInstructorDTO, Chapter, Course, CourseCategory, CreateChapterDTO, CreateCourseDTO, CreateLessonDTO, EnrollDTO } from "./learnings-types";

// ─── Categories ──────────────────────────────────────────────────────────────

export const getCategoriesThunk = createAsyncThunk(
    "learnings/getCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getCategories();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération des catégories");
        }
    }
);

// ─── Marketplace ─────────────────────────────────────────────────────────────

export const getMarketplaceCoursesThunk = createAsyncThunk(
    "learnings/getMarketplaceCourses",
    async (params: { category?: string; level?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getMarketplaceCourses(params);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération des formations");
        }
    }
);

export const getCourseBySlugThunk = createAsyncThunk(
    "learnings/getCourseBySlug",
    async (slug: string, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getCourseBySlug(slug);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Formation introuvable");
        }
    }
);

export const getCourseByIdThunk = createAsyncThunk(
    "learnings/getCourseById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getCourseById(id);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Formation introuvable");
        }
    }
);

export const getChaptersByCourseIdThunk = createAsyncThunk(
    "learnings/getChaptersByCourseId",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getChaptersByCourseId(courseId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération des chapitres");
        }
    }
);

export const getCourseReviewsThunk = createAsyncThunk(
    "learnings/getCourseReviews",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getCourseReviews(courseId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération des avis");
        }
    }
);

// ─── My Dashboard ─────────────────────────────────────────────────────────────

export const getUserDashboardThunk = createAsyncThunk(
    "learnings/getUserDashboard",
    async (_, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getUserDashboard();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération du tableau de bord");
        }
    }
);

// ─── Enrollment ────────────────────────────────────────────────────────────────

export const enrollUserThunk = createAsyncThunk(
    "learnings/enrollUser",
    async (dto: EnrollDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.enrollUser(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de l'inscription");
        }
    }
);

// ─── Review ───────────────────────────────────────────────────────────────────

export const addReviewThunk = createAsyncThunk(
    "learnings/addReview",
    async (dto: AddReviewDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.addReview(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de l'ajout de l'avis");
        }
    }
);

// ─── Instructor ───────────────────────────────────────────────────────────────

export const createCourseThunk = createAsyncThunk(
    "learnings/createCourse",
    async (dto: CreateCourseDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.createCourse(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la création de la formation");
        }
    }
);

export const updateCourseThunk = createAsyncThunk(
    "learnings/updateCourse",
    async ({ id, dto }: { id: string, dto: Partial<Course> }, { rejectWithValue }) => {
        try {
            const response = await learningsApi.updateCourse(id, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la mise à jour de la formation");
        }
    }
);

export const createChapterThunk = createAsyncThunk(
    "learnings/createChapter",
    async (dto: CreateChapterDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.createChapter(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la création du chapitre");
        }
    }
);

export const createLessonThunk = createAsyncThunk(
    "learnings/createLesson",
    async (dto: CreateLessonDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.createLesson(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la création de la leçon");
        }
    }
);

export const updateLessonThunk = createAsyncThunk(
    "learnings/updateLesson",
    async ({ id, dto }: { id: string, dto: any }, { rejectWithValue }) => {
        try {
            const response = await learningsApi.updateLesson(id, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la mise à jour de la leçon");
        }
    }
);

// ─── Progress ─────────────────────────────────────────────────────────────────

export const markLessonCompletedThunk = createAsyncThunk(
    "learnings/markLessonCompleted",
    async ({ lessonId, courseId }: { lessonId: string; courseId: string }, { rejectWithValue }) => {
        try {
            await learningsApi.markLessonCompleted(lessonId, courseId);
            return lessonId;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la mise à jour de la progression");
        }
    }
);

export const becomeInstructorThunk = createAsyncThunk(
    "learnings/becomeInstructor",
    async (dto: BecomeInstructorDTO, { rejectWithValue }) => {
        try {
            const response = await learningsApi.becomeInstructor(dto);
            return { message: response.message, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de l'inscription formateur");
        }
    }
);

export const getInstructorDashboardThunk = createAsyncThunk(
    "learnings/getInstructorDashboard",
    async (_, { rejectWithValue }) => {
        try {
            const response = await learningsApi.getInstructorDashboard();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors du chargement du tableau de bord formateur");
        }
    }
);
