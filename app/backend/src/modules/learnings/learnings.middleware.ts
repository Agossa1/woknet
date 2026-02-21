import { Response, NextFunction } from 'express';
import { SecureRequest } from '../../infra/middleware/auth.middleware';
import { LearningsRepository } from './learnings.repository';

export class LearningsMiddleware {
    constructor(private readonly learningsRepository: LearningsRepository) { }

    isInstructor = async (req: SecureRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const isInstructor = await this.learningsRepository.isInstructor(userId);

            if (!isInstructor) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé. Vous devez être inscrit comme formateur pour accéder à cet espace.'
                });
            }

            next();
        } catch (error) {
            console.error('Instructor check failed', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    };
}