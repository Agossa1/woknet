import { Router } from "express";
import PostgresDatabase from "../config/databases/configDB";
import Logger from "../infra/logger/winston";

// Imports des modules
import { AuthModule } from "../modules/auth/auth.modules";
import { ProfilesModule } from "../modules/profiles/profiles.modules";
import { ExperiencesModule } from "../modules/experiences/experiences.modules";
import { EducationsModule } from "../modules/educations/educations.module";
import uploadRoutes from "../modules/uploads/uploads.routes";
import { SkillsModule } from "../modules/skills/skills.module";
import { ProjectsModule } from "../modules/projects/projects.module";

const router = Router();

// --- 1. Initialisation des services partagés ---
const database = new PostgresDatabase();
const logger = new Logger(); // Instance unique du logger

// --- 2. Instanciation des Modules avec Injection ---

// Notifications (Instantiated early so other modules can use its service)
import { NotificationsModule } from "../modules/notifications/notifications.module";
export const notificationsModule = new NotificationsModule();
router.use('/notifications', notificationsModule.getRouter());

// Auth
const authModule = new AuthModule();
router.use('/auth', authModule.getRouter());

// Profiles
const profilesModules = new ProfilesModule();
router.use('/profiles', profilesModules.getRouter());

// Experiences
const experiencesModule = new ExperiencesModule();
router.use('/experiences', experiencesModule.getRouter());

// Educations
const educationsModule = new EducationsModule();
router.use('/educations', educationsModule.getRouter());

// Uploads
router.use('/uploads', uploadRoutes);

// Skills
const skillsModule = new SkillsModule();
router.use('/skills', skillsModule.getRouter()); // Mounts /api/skills/search

router.use('/profiles', skillsModule.getProfileRouter());

// Projects
const projectsModule = new ProjectsModule();
router.use('/projects', projectsModule.getRouter());

// Posts
import { PostsModule } from "../modules/posts/posts.module";
const postsModule = new PostsModule();
router.use('/posts', postsModule.getRouter());

// Comments
import { CommentsModule } from "../modules/comments/comments.module";
const commentsModule = new CommentsModule();
router.use('/comments', commentsModule.getRouter());

// Likes
import { LikesModule } from "../modules/likes/likes.module";
const likesModule = new LikesModule();
router.use('/likes', likesModule.getRouter());

// Follows
import { FollowsModule } from "../modules/follows/follows.module";
const followsModule = new FollowsModule();
router.use('/follows', followsModule.getRouter());

// Recommendations
import { RecommendationsModule } from "../modules/recommendations/recommendations.module";
const recommendationsModule = new RecommendationsModule();
router.use('/recommendations', recommendationsModule.getRouter());

// Hashtags
import { HashtagsModule } from "../modules/hashtags/hashtags.module";
const hashtagsModule = new HashtagsModule();
router.use('/hashtags', hashtagsModule.getRouter());

// Shares
import { SharesModule } from "../modules/shares/shares.module";
const sharesModule = new SharesModule();
router.use('/shares', sharesModule.getRouter());

// Chat
import { ChatModule } from "../modules/chat/chat.module";
const chatModule = new ChatModule();
router.use('/chat', chatModule.getRouter());

export default router;