"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
// This is class to configurate the middleware in index.ts 
class ConfigureMiddleware {
    constructor(app) {
        this.app = app;
    }
    apply() {
        this.app.use((0, helmet_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.set("trust proxy", 1);
    }
}
exports.default = ConfigureMiddleware;
//# sourceMappingURL=express.js.map