import { Response, NextFunction } from 'express';
import { CloudinaryService } from '../../infra/storage/cloudinary.service';
import Logger from '../../infra/logger/winston';
import { SecureRequest } from '../../infra/middleware/auth.middleware';

const AsyncHandler = (fn: Function) => (req: any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export class UploadController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly logger: Logger
    ) { }

    uploadProfileImage = AsyncHandler(async (req: SecureRequest & { file?: any }, res: Response) => {
        this.logger.instance.info(`[UploadController] Received upload request for user: ${req.user?.id}`);
        if (!req.file) {
            this.logger.instance.warn(`[UploadController] Upload request failed: No file provided for user ${req.user?.id}`);
            return res.status(400).json({ success: false, message: "Aucun fichier fourni" });
        }

        try {
            let folder = 'worknet/avatars';
            if (req.body.type === 'banner') folder = 'worknet/banners';
            if (req.body.type === 'project') folder = 'worknet/projects';
            if (req.body.type === 'task') folder = 'worknet/tasks';
            if (req.body.type === 'course') folder = 'worknet/courses';

            this.logger.instance.info(`[UploadController] Uploading file to folder: ${folder} for user ${req.user?.id}`);
            const imageUrl = await this.cloudinaryService.uploadImage(req.file.buffer, folder);

            this.logger.instance.info(`[UploadController] Image uploaded successfully for user ${req.user?.id}. URL: ${imageUrl}`);
            return res.status(200).json({
                success: true,
                message: "Image téléchargée avec succès",
                data: { url: imageUrl }
            });
        } catch (error) {
            this.logger.instance.error(`[UploadController] Upload error for user ${req.user?.id}:`, error);
            return res.status(500).json({ success: false, message: "Erreur lors du téléchargement de l'image" });
        }
    });

    getSignature = AsyncHandler(async (req: SecureRequest, res: Response) => {
        const folder = req.query.folder as string || 'worknet/posts';
        const signatureData = this.cloudinaryService.generateSignature(folder);
        return res.status(200).json(signatureData);
    });
}
