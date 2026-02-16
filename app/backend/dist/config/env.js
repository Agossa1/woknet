"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env';
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
// Optionally export parsed env for other modules
exports.default = process.env;
//# sourceMappingURL=env.js.map