"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configDB_1 = __importDefault(require("../config/databases/configDB"));
const winston_1 = __importDefault(require("../infra/logger/winston")); // Assure-toi du chemin
// Imports des modules
const auth_modules_1 = require("../modules/auth/auth.modules");
const router = (0, express_1.Router)();
// --- 1. Initialisation des services partagés ---
const database = new configDB_1.default();
const logger = new winston_1.default(); // Instance unique du logger
// --- 2. Instanciation des Modules avec Injection ---
// Auth
const authModule = new auth_modules_1.AuthModule();
router.use('/auth', authModule.getRouter());
exports.default = router;
//# sourceMappingURL=index.js.map