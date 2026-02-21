"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsModule = void 0;
const express_1 = require("express");
const configDB_1 = __importDefault(require("../config/databases/configDB"));
const winston_1 = __importDefault(require("../infra/logger/winston"));
// Imports des modules
const auth_modules_1 = require("../modules/auth/auth.modules");
const profiles_modules_1 = require("../modules/profiles/profiles.modules");
const experiences_modules_1 = require("../modules/experiences/experiences.modules");
const educations_module_1 = require("../modules/educations/educations.module");
const uploads_routes_1 = __importDefault(require("../modules/uploads/uploads.routes"));
const skills_module_1 = require("../modules/skills/skills.module");
const projects_module_1 = require("../modules/projects/projects.module");
const workspaces_modules_1 = require("../modules/workspaces/workspaces.modules");
const companies_modules_1 = require("../modules/companies/companies.modules");
const languages_module_1 = require("../modules/languages/languages.module");
const certifications_module_1 = require("../modules/certifications/certifications.module");
const featured_content_module_1 = require("../modules/featured-content/featured-content.module");
const user_recommendations_modules_1 = require("../modules/user-recommendations/user-recommendations.modules");
const feed_modules_1 = require("../modules/feeds/feed.modules");
const router = (0, express_1.Router)();
// --- 1. Initialisation des services partagés ---
const database = new configDB_1.default();
const logger = new winston_1.default(); // Instance unique du logger
// --- 2. Instanciation des Modules avec Injection ---
// Notifications (Instantiated early so other modules can use its service)
const notifications_module_1 = require("../modules/notifications/notifications.module");
exports.notificationsModule = new notifications_module_1.NotificationsModule();
router.use('/notifications', exports.notificationsModule.getRouter());
// Auth
const authModule = new auth_modules_1.AuthModule();
router.use('/auth', authModule.getRouter());
// Profiles
const profilesModules = new profiles_modules_1.ProfilesModule();
router.use('/profiles', profilesModules.getRouter());
// Experiences
const experiencesModule = new experiences_modules_1.ExperiencesModule();
router.use('/experiences', experiencesModule.getRouter());
// Educations
const educationsModule = new educations_module_1.EducationsModule();
router.use('/educations', educationsModule.getRouter());
// Uploads
router.use('/uploads', uploads_routes_1.default);
// Skills
const skillsModule = new skills_module_1.SkillsModule();
router.use('/skills', skillsModule.getRouter()); // Mounts /api/skills/search
router.use('/profiles', skillsModule.getProfileRouter());
// Projects
const projectsModule = new projects_module_1.ProjectsModule();
router.use('/projects', projectsModule.getRouter());
// Posts
const posts_module_1 = require("../modules/posts/posts.module");
const postsModule = new posts_module_1.PostsModule();
router.use('/posts', postsModule.getRouter());
// Comments
const comments_module_1 = require("../modules/comments/comments.module");
const commentsModule = new comments_module_1.CommentsModule();
router.use('/comments', commentsModule.getRouter());
// Likes
const likes_module_1 = require("../modules/likes/likes.module");
const likesModule = new likes_module_1.LikesModule();
router.use('/likes', likesModule.getRouter());
// Follows
const follows_module_1 = require("../modules/follows/follows.module");
const followsModule = new follows_module_1.FollowsModule();
router.use('/follows', followsModule.getRouter());
// Recommendations
const recommendations_module_1 = require("../modules/recommendations/recommendations.module");
const recommendationsModule = new recommendations_module_1.RecommendationsModule();
router.use('/recommendations', recommendationsModule.getRouter());
// Hashtags
const hashtags_module_1 = require("../modules/hashtags/hashtags.module");
const hashtagsModule = new hashtags_module_1.HashtagsModule();
router.use('/hashtags', hashtagsModule.getRouter());
// Shares
const shares_module_1 = require("../modules/shares/shares.module");
const sharesModule = new shares_module_1.SharesModule();
router.use('/shares', sharesModule.getRouter());
// Chat
const chat_module_1 = require("../modules/chat/chat.module");
const chatModule = new chat_module_1.ChatModule();
router.use('/chat', chatModule.getRouter());
// Saved Posts
const saved_posts_1 = require("../modules/saved-posts");
const savedPostsModule = (0, saved_posts_1.createSavedPostsModule)(database, logger);
router.use('/saved-posts', savedPostsModule.router);
// Workspaces
const workspacesModule = new workspaces_modules_1.WorkspacesModule();
router.use('/workspaces', workspacesModule.getRouter());
// Companies
const companiesModule = new companies_modules_1.CompaniesModule();
router.use('/companies', companiesModule.getRouter());
// Jobs
const jobs_modules_1 = require("../modules/jobs/jobs.modules");
const jobsModule = new jobs_modules_1.JobsModule();
router.use('/jobs', jobsModule.getRouter());
// Languages
router.use('/languages', languages_module_1.LanguagesModule.init(database, logger));
// Certifications
router.use('/certifications', certifications_module_1.CertificationsModule.init(database, logger));
// Featured Content
router.use('/featured-content', featured_content_module_1.FeaturedContentModule.init(database, logger));
// User Recommendations (Testimonials)
const userRecommendationsModule = new user_recommendations_modules_1.UserRecommendationsModule();
router.use('/user-recommendations', userRecommendationsModule.getRouter());
// Feed
router.use('/feed', feed_modules_1.FeedModule.getInstance().getRouter());
// Learnings (Formations)
const learnings_modules_1 = require("../modules/learnings/learnings.modules");
const learningsModule = new learnings_modules_1.LearningsModule();
router.use('/learnings', learningsModule.getRouter());
// Debug endpoint
const debug_routes_1 = __importDefault(require("../modules/debug/debug.routes"));
router.use('/debug', debug_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map