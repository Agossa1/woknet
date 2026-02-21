"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsModule = void 0;
const recommendations_routes_1 = require("./recommendations.routes");
class RecommendationsModule {
    constructor() {
        this.router = new recommendations_routes_1.RecommendationsRouter();
    }
    getRouter() {
        return this.router.getRouter();
    }
}
exports.RecommendationsModule = RecommendationsModule;
//# sourceMappingURL=recommendations.module.js.map