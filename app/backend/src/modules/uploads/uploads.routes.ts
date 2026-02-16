import { Router } from 'express';
import multer from 'multer';
import { UploadController } from './uploads.controller';
import { CloudinaryService } from '../../infra/storage/cloudinary.service';
import Logger from '../../infra/logger/winston';
import { AuthGuard } from '../../infra/middleware/auth.middleware';

const router = Router();
const logger = new Logger();
const cloudinaryService = new CloudinaryService(logger);
const uploadController = new UploadController(cloudinaryService, logger);

// Configuration de Multer (stockage en mémoire)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

router.post(
    '/profile-image',
    AuthGuard.authenticate as any,
    upload.single('file'),
    uploadController.uploadProfileImage
);

router.get(
    '/signature',
    AuthGuard.authenticate as any,
    uploadController.getSignature
);

export default router;
