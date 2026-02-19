import { Request, Response, NextFunction } from "express";
import { FeaturedContentService } from "./featured-content.service";
import Logger from "../../infra/logger/winston";
import { CreateFeaturedContentSchema, UpdateFeaturedContentSchema } from "./featured-content.schema";

const AsyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
}

export class FeaturedContentController {
    constructor(
        private readonly service: FeaturedContentService,
        private readonly logger: Logger
    ) { }

    add = AsyncHandler(async (req: Request, res: Response) => {
        const validatedData = CreateFeaturedContentSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({ success: false, errors: validatedData.error.issues });
        }
        const created = await this.service.add(validatedData.data as any);
        return res.status(201).json({ success: true, data: created });
    })

    list = AsyncHandler(async (req: Request, res: Response) => {
        const profileId = req.params.profileId as string;
        const result = await this.service.getByProfile(profileId);
        return res.json({ success: true, data: result });
    })

    update = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const validatedData = UpdateFeaturedContentSchema.safeParse(req.body);
        if (!validatedData.success) {
            return res.status(400).json({ success: false, errors: validatedData.error.issues });
        }
        const updated = await this.service.update(id, validatedData.data as any);
        return res.json({ success: true, data: updated });
    })

    delete = AsyncHandler(async (req: Request, res: Response) => {
        const id = req.params.id as string;
        await this.service.remove(id);
        return res.json({ success: true, message: "Featured content deleted" });
    })
}
