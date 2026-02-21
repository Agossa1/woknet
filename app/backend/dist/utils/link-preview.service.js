"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkPreviewService = void 0;
const cheerio = __importStar(require("cheerio"));
class LinkPreviewService {
    static async getMetadata(url) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'WorkNetBot/1.0',
                },
                // timeout: 5000 is not directly supported in fetch without AbortController
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            const $ = cheerio.load(data);
            const metadata = {
                url,
                title: $('meta[property="og:title"]').attr('content') || $('title').text() || undefined,
                description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || undefined,
                image: $('meta[property="og:image"]').attr('content') || undefined,
            };
            return metadata;
        }
        catch (error) {
            console.error(`LinkPreview error for ${url}:`, error);
            return null;
        }
    }
    static extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }
}
exports.LinkPreviewService = LinkPreviewService;
//# sourceMappingURL=link-preview.service.js.map