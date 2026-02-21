"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploads_controller_1 = require("./uploads.controller");
const cloudinary_service_1 = require("../../infra/storage/cloudinary.service");
const winston_1 = __importDefault(require("../../infra/logger/winston"));
const auth_middleware_1 = require("../../infra/middleware/auth.middleware");
const router = (0, express_1.Router)();
const logger = new winston_1.default();
const cloudinaryService = new cloudinary_service_1.CloudinaryService(logger);
const uploadController = new uploads_controller_1.UploadController(cloudinaryService, logger);
// Configuration de Multer (stockage en mémoire)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
router.post('/profile-image', auth_middleware_1.AuthGuard.authenticate, upload.single('file'), uploadController.uploadProfileImage);
router.post('/task-attachment', auth_middleware_1.AuthGuard.authenticate, upload.single('file'), uploadController.uploadProfileImage // Reusing the same logic
);
router.get('/signature', auth_middleware_1.AuthGuard.authenticate, uploadController.getSignature);
exports.default = router;
//# sourceMappingURL=uploads.routes.js.map