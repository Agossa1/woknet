import { v2 as cloudinary } from 'cloudinary';
import Logger from '../logger/winston';

export class CloudinaryService {
    constructor(private readonly logger: Logger) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadFile(fileBuffer: Buffer, folder: string = 'worknet/posts'): Promise<string> {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'auto',
                    },
                    (error: any, result: any) => {
                        if (error) {
                            this.logger.instance.error(`[CloudinaryService] Upload error: ${error.message}`);
                            return reject(error);
                        }
                        resolve(result!.secure_url);
                    }
                );
                uploadStream.end(fileBuffer);
            });
        } catch (error) {
            this.logger.instance.error(`[CloudinaryService] unexpected error: ${error}`);
            throw error;
        }
    }

    /**
     * Génère une signature pour l'upload direct depuis le frontend.
     * C'est la méthode la plus rapide pour les fichiers de 1Go car elle évite le transit par le serveur.
     */
    generateSignature(folder: string = 'worknet/posts') {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET!
        );
        return {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        };
    }

    // Keep uploadImage for backward compatibility if needed, but point to uploadFile
    async uploadImage(fileBuffer: Buffer, folder: string = 'worknet/profiles'): Promise<string> {
        return this.uploadFile(fileBuffer, folder);
    }
}
