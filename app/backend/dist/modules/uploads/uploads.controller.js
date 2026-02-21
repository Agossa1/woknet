"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
class UploadController {
    constructor(cloudinaryService, logger) {
        this.cloudinaryService = cloudinaryService;
        this.logger = logger;
        this.uploadProfileImage = AsyncHandler(async (req, res) => {
            this.logger.instance.info(`[UploadController] Received upload request for user: ${req.user?.id}`);
            if (!req.file) {
                this.logger.instance.warn(`[UploadController] Upload request failed: No file provided for user ${req.user?.id}`);
                return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
            }
            try {
                let folder = 'worknet/avatars';
                if (req.body.type === 'banner')
                    folder = 'worknet/banners';
                if (req.body.type === 'project')
                    folder = 'worknet/projects';
                if (req.body.type === 'task')
                    folder = 'worknet/tasks';
                this.logger.instance.info(`[UploadController] Uploading file to folder: ${folder} for user ${req.user?.id}`);
                const imageUrl = await this.cloudinaryService.uploadImage(req.file.buffer, folder);
                this.logger.instance.info(`[UploadController] Image uploaded successfully for user ${req.user?.id}. URL: ${imageUrl}`);
                return res.status(200).json({
                    success: true,
                    message: "Image téléchargée avec succès",
                    data: { url: imageUrl }
                });
            }
            catch (error) {
                this.logger.instance.error(`[UploadController] Upload error for user ${req.user?.id}:`, error);
                return res.status(500).json({ success: false, message: "Erreur lors du téléchargement de l'image" });
            }
        });
        this.getSignature = AsyncHandler(async (req, res) => {
            const folder = req.query.folder || 'worknet/posts';
            const signatureData = this.cloudinaryService.generateSignature(folder);
            return res.status(200).json(signatureData);
        });
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=uploads.controller.js.map