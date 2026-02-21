import { createSlice } from "@reduxjs/toolkit";
import { LearningsState } from "./learnings-types";
import {
    getCategoriesThunk,
    getMarketplaceCoursesThunk,
    getCourseBySlugThunk,
    getCourseByIdThunk,
    getChaptersByCourseIdThunk,
    getCourseReviewsThunk,
    getUserDashboardThunk,
    enrollUserThunk,
    addReviewThunk,
    createCourseThunk,
    updateCourseThunk,
    createChapterThunk,
    createLessonThunk,
    updateLessonThunk,
    markLessonCompletedThunk,
    getInstructorDashboardThunk,
    becomeInstructorThunk,
} from "./learnings-thunks";

const initialState: LearningsState = {
    categories: [],
    marketplaceCourses: [],
    currentCourse: null,
    currentChapters: [],
    currentReviews: [],
    myEnrollments: [],
    instructorCourses: [],
    isLoading: false,
    isEnrolling: false,
    error: null,
};

const learningsSlice = createSlice({
    name: "learnings",
    initialState,
    reducers: {
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
            state.currentChapters = [];
            state.currentReviews = [];
        },
        clearLearningsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ─── Categories ─────────────────────────────────────────────────────────
        builder
            .addCase(getCategoriesThunk.fulfilled, (state, action) => {
                state.categories = action.payload;
            });

        // ─── Marketplace Courses ────────────────────────────────────────────────
        builder
            .addCase(getMarketplaceCoursesThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMarketplaceCoursesThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.marketplaceCourses = action.payload;
            })
            .addCase(getMarketplaceCoursesThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Course By Slug ─────────────────────────────────────────────────────
        builder
            .addCase(getCourseBySlugThunk.pending, (state) => {
                state.isLoading = true;
                state.currentCourse = null;
                state.error = null;
            })
            .addCase(getCourseBySlugThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCourse = action.payload;
            })
            .addCase(getCourseBySlugThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Course By Id ─────────────────────────────────────────────────────
        builder
            .addCase(getCourseByIdThunk.pending, (state) => {
                state.isLoading = true;
                state.currentCourse = null;
                state.error = null;
            })
            .addCase(getCourseByIdThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCourse = action.payload;
            })
            .addCase(getCourseByIdThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Chapters ───────────────────────────────────────────────────────────
        builder
            .addCase(getChaptersByCourseIdThunk.pending, (state) => {
                // Not setting global isLoading=true to avoid flickering if Course is already loaded
                state.error = null;
            })
            .addCase(getChaptersByCourseIdThunk.fulfilled, (state, action) => {
                state.currentChapters = action.payload;
            })
            .addCase(getChaptersByCourseIdThunk.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ─── Reviews ────────────────────────────────────────────────────────────
        builder
            .addCase(getCourseReviewsThunk.fulfilled, (state, action) => {
                state.currentReviews = action.payload;
            })
            .addCase(addReviewThunk.fulfilled, (state, action) => {
                state.currentReviews.unshift(action.payload);
            });

        // ─── User Dashboard ─────────────────────────────────────────────────────
        builder
            .addCase(getUserDashboardThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserDashboardThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myEnrollments = action.payload;
            })
            .addCase(getUserDashboardThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Enroll ─────────────────────────────────────────────────────────────
        builder
            .addCase(enrollUserThunk.pending, (state) => {
                state.isEnrolling = true;
                state.error = null;
            })
            .addCase(enrollUserThunk.fulfilled, (state, action) => {
                state.isEnrolling = false;
                state.myEnrollments.push(action.payload);
            })
            .addCase(enrollUserThunk.rejected, (state, action) => {
                state.isEnrolling = false;
                state.error = action.payload as string;
            });

        // ─── Create Course ──────────────────────────────────────────────────────
        builder
            .addCase(createCourseThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createCourseThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.marketplaceCourses.unshift(action.payload);
            })
            .addCase(createCourseThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Update Course ──────────────────────────────────────────────────────
        builder
            .addCase(updateCourseThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCourseThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCourse = action.payload;
                // Mettre aussi à jour dans la marketplace si présent
                state.marketplaceCourses = state.marketplaceCourses.map(c =>
                    c.id === action.payload.id ? { ...c, ...action.payload } : c
                );
            })
            .addCase(updateCourseThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Create Chapter / Lesson ────────────────────────────────────────────
        builder
            .addCase(createChapterThunk.fulfilled, (state, action) => {
                state.currentChapters.push({ ...action.payload, lessons: [] });
            })
            .addCase(createLessonThunk.fulfilled, (state, action) => {
                state.currentChapters = state.currentChapters.map(chapter => {
                    if (chapter.id === action.payload.chapter_id) {
                        return {
                            ...chapter,
                            lessons: [...(chapter.lessons || []), action.payload]
                        };
                    }
                    return chapter;
                });
            })
            .addCase(updateLessonThunk.fulfilled, (state, action) => {
                state.currentChapters = state.currentChapters.map(chapter => {
                    if (chapter.id === action.payload.chapter_id) {
                        return {
                            ...chapter,
                            lessons: chapter.lessons?.map(lesson =>
                                lesson.id === action.payload.id ? action.payload : lesson
                            )
                        };
                    }
                    return chapter;
                });
            });

        // ─── Mark Lesson Completed ──────────────────────────────────────────────
        builder
            .addCase(markLessonCompletedThunk.fulfilled, (state, action) => {
                state.currentChapters = state.currentChapters.map(chapter => ({
                    ...chapter,
                    lessons: chapter.lessons?.map(lesson =>
                        lesson.id === action.payload
                            ? { ...lesson, is_completed: true }
                            : lesson
                    )
                }));
            });

        // ─── Become Instructor ──────────────────────────────────────────────────
        builder
            .addCase(becomeInstructorThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(becomeInstructorThunk.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(becomeInstructorThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // ─── Instructor Dashboard ───────────────────────────────────────────────
        builder
            .addCase(getInstructorDashboardThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInstructorDashboardThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.instructorCourses = action.payload;
            })
            .addCase(getInstructorDashboardThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentCourse, clearLearningsError } = learningsSlice.actions;
export default learningsSlice.reducer;
