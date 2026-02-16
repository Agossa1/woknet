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
    chat: chatReducer
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