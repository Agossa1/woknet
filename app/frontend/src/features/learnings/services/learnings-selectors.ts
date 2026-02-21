import { RootState } from "@/src/store/store";

export const selectCourseCategories = (state: RootState) => state.learnings.categories;
export const selectMarketplaceCourses = (state: RootState) => state.learnings.marketplaceCourses;
export const selectCurrentCourse = (state: RootState) => state.learnings.currentCourse;
export const selectCurrentChapters = (state: RootState) => state.learnings.currentChapters;
export const selectCurrentReviews = (state: RootState) => state.learnings.currentReviews;
export const selectMyEnrollments = (state: RootState) => state.learnings.myEnrollments;
export const selectInstructorCourses = (state: RootState) => state.learnings.instructorCourses;
export const selectLearningsLoading = (state: RootState) => state.learnings.isLoading;
export const selectEnrolling = (state: RootState) => state.learnings.isEnrolling;
export const selectLearningsError = (state: RootState) => state.learnings.error;

// Derived: check if user is enrolled in a specific course
export const selectIsEnrolled = (courseId: string) => (state: RootState) =>
    state.learnings.myEnrollments.some(e => e.course_id === courseId);

// Derived: enrollment for a specific course
export const selectEnrollmentForCourse = (courseId: string) => (state: RootState) =>
    state.learnings.myEnrollments.find(e => e.course_id === courseId) ?? null;
