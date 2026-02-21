"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
class CloudinaryService {
    constructor(logger) {
        this.logger = logger;
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadFile(fileBuffer, folder = 'worknet/posts') {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder,
                    resource_type: 'auto',
                }, (error, result) => {
                    if (error) {
                        this.logger.instance.error(`[CloudinaryService] Upload error: ${error.message}`);
                        return reject(error);
                    }
                    resolve(result.secure_url);
                });
                uploadStream.end(fileBuffer);
            });
        }
        catch (error) {
            this.logger.instance.error(`[CloudinaryService] unexpected error: ${error}`);
            throw error;
        }
    }
    /**
     * Génère une signature pour l'upload direct depuis le frontend.
     * C'est la méthode la plus rapide pour les fichiers de 1Go car elle évite le transit par le serveur.
     */
    generateSignature(folder = 'worknet/posts') {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
        return {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        };
    }
    // Keep uploadImage for backward compatibility if needed, but point to uploadFile
    async uploadImage(fileBuffer, folder = 'worknet/profiles') {
        return this.uploadFile(fileBuffer, folder);
    }
}
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map