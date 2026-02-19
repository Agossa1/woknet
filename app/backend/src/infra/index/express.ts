import cookieParser from "cookie-parser";
import express, { Application } from "express"
import helmet from "helmet"
import dotenv from 'dotenv';

dotenv.config();





// This is class to configurate the middleware in index.ts 
export default class ConfigureMiddleware {
    constructor(private app: Application) { }

    public apply() {
        this.app.use(helmet());
        this.app.disable('x-powered-by');
        const bodyLimit = process.env.BODY_PARSER_LIMIT || '50mb';
        this.app.use(express.json({ limit: bodyLimit }));
        this.app.set("trust proxy", 1);
        this.app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
        this.app.use(cookieParser(process.env.COOKIE_SECRET));
        this.app.set("trust proxy", 1);
    }
}

