"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
require("./config/env");
const index_1 = __importDefault(require("./index"));
const http_1 = require("http");
const PORT = process.env.PORT || 4000;
const server = (0, http_1.createServer)(index_1.default);
exports.server = server;
server.listen(PORT, () => {
    console.log(`My server running on address : http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map