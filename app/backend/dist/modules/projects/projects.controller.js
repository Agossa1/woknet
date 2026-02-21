"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const projects_schema_1 = require("./projects.schema");
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
class ProjectsController {
    constructor(projectsService) {
        this.createProject = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const validData = projects_schema_1.CreateProjectSchema.safeParse(req.body);
            if (!validData.success) {
                return res.status(400).json({ success: false, message: "Données invalides", errors: validData.error.issues });
            }
            const project = await this.projectsService.createProject(userId, validData.data);
            res.status(201).json({ success: true, data: project });
        });
        this.updateProject = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const projectId = req.params.projectId;
            const validData = projects_schema_1.UpdateProjectSchema.safeParse(req.body);
            if (!validData.success) {
                return res.status(400).json({ success: false, message: "Données invalides", errors: validData.error.issues });
            }
            const project = await this.projectsService.updateProject(userId, projectId, validData.data);
            res.status(200).json({ success: true, data: project });
        });
        this.deleteProject = AsyncHandler(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const projectId = req.params.projectId;
            await this.projectsService.deleteProject(userId, projectId);
            res.status(200).json({ success: true, message: "Projet supprimé avec succès" });
        });
        this.getProjectsByProfile = AsyncHandler(async (req, res) => {
            const profileId = req.params.profileId;
            const projects = await this.projectsService.getProjectsByProfile(profileId);
            res.status(200).json({ success: true, data: projects });
        });
        this.getProjectById = AsyncHandler(async (req, res) => {
            const projectId = req.params.projectId;
            const project = await this.projectsService.getProjectById(projectId);
            res.status(200).json({ success: true, data: project });
        });
        this.projectsService = projectsService;
        this.logger = new winston_1.default();
    }
}
exports.ProjectsController = ProjectsController;
//# sourceMappingURL=projects.controller.js.map