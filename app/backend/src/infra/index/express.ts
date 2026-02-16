import cookieParser from "cookie-parser";
import express, { Application } from "express"
import helmet from "helmet"





// This is class to configurate the middleware in index.ts 
export default class ConfigureMiddleware {
    constructor(private app: Application) { }

    public apply() {
        this.app.use(helmet());
        this.app.use(express.json({ limit: '3072mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '3072mb' }));
        this.app.use(cookieParser())
        this.app.set("trust proxy", 1);
    }
}

