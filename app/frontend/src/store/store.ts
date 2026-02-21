import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/services/authSlice";
import profileReducer from "../features/profiles/services/profile-slices";
import experienceReducer from "../features/experiences/services/experience-slice";
import educationReducer from "../features/educations/services/education-slice";
import skillsReducer from "../features/skills/services/skills-slice";
import projectsReducer from "../features/projects/services/projects-slice";
import postsReducer from "../features/posts/services/posts-slice";
import commentsReducer from "../features/comments/services/comments-slice";
import followsReducer from "../features/follows/services/follows-slice";
import recommendationsReducer from "../features/recommendations/services/recommendations-slice";
import hashtagsReducer from '@/src/features/hashtags/services/hashtags-slice';
import sharesReducer from '@/src/features/shares/services/shares-slice';
import notificationsReducer from '@/src/features/notifications/services/notifications-slice';
import { chatReducer } from '../features/chat/services/chat-slice';
import workspacesReducer from "../features/workspaces/services/workspaces-slice";
import companiesReducer from "../features/companies/services/companies-slice";
import languagesReducer from "../features/languages/services/language-slices";
import certificationsReducer from "../features/certifications/services/certification-slices";
import featuredReducer from "../features/featured-content/services/featured-slices";
import learningsReducer from "../features/learnings/services/learnings-slice";

const rootReducer = combineReducers({
    auth: authReducer,
    profile: profileReducer,
    experiences: experienceReducer,
    educations: educationReducer,
    skills: skillsReducer,
    projects: projectsReducer,
    posts: postsReducer,
    comments: commentsReducer,
    follows: followsReducer,
    recommendations: recommendationsReducer,
    hashtags: hashtagsReducer,
    shares: sharesReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    workspaces: workspacesReducer,
    companies: companiesReducer,
    languages: languagesReducer,
    certifications: certificationsReducer,
    featured: featuredReducer,
    learnings: learningsReducer
})



export const store = configureStore({
    reducer: rootReducer,

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        })

})

// 3. Types Fondamentaux exportés

export type RootState = ReturnType<typeof store.getState>;

// 4. AppDispatch: le type de la fonction dispatch (crucial pour les thunks)


export type AppDispatch = typeof store.dispatch;