import { Router } from "express";
import { HashtagsRoutes } from "./hashtags.routes";

export class HashtagsModule {
    private routes: HashtagsRoutes;

    constructor() {
        this.routes = new HashtagsRoutes();
    }

    getRouter(): Router {
        return this.routes.getRouter();
    }
}
