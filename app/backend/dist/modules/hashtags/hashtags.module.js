"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagsModule = void 0;
const hashtags_routes_1 = require("./hashtags.routes");
class HashtagsModule {
    constructor() {
        this.routes = new hashtags_routes_1.HashtagsRoutes();
    }
    getRouter() {
        return this.routes.getRouter();
    }
}
exports.HashtagsModule = HashtagsModule;
//# sourceMappingURL=hashtags.module.js.map