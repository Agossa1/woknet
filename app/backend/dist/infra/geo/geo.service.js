"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoService = void 0;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const ua_parser_js_1 = require("ua-parser-js");
const maxmind_1 = __importDefault(require("maxmind"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class GeoService {
    constructor() {
        this.cityReader = null;
        this.dbPath = path_1.default.join(process.cwd(), 'data', 'GeoLite2-City.mmdb');
        this.initMaxMind();
    }
    /**
     * Initialize MaxMind reader if database exists
     */
    async initMaxMind() {
        try {
            if (fs_1.default.existsSync(this.dbPath)) {
                this.cityReader = await maxmind_1.default.open(this.dbPath);
                console.log('[GeoService] MaxMind GeoLite2-City database loaded successfully.');
            }
            else {
                console.warn(`[GeoService] MaxMind database not found at ${this.dbPath}. Using geoip-lite as fallback.`);
            }
        }
        catch (error) {
            console.error('[GeoService] Failed to initialize MaxMind:', error);
        }
    }
    /**
     * Extracts the client IP address from the request.
     */
    getIpFromRequest(req) {
        let ip = req.headers['x-forwarded-for'];
        if (ip && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        if (!ip) {
            ip = req.socket.remoteAddress || '';
        }
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            // Force mock IP for local development unless explicitly in production
            return process.env.NODE_ENV === 'production' ? ip : '41.85.160.0';
        }
        return ip;
    }
    /**
     * Look up Geographic information for an IP address.
     * Uses MaxMind if available, otherwise falls back to geoip-lite.
     */
    async getGeoData(ip) {
        if (!ip || ip === '127.0.0.1')
            return {};
        try {
            // Priority 1: MaxMind (More accurate)
            if (this.cityReader) {
                const geo = this.cityReader.get(ip);
                if (geo) {
                    return {
                        country: geo.country?.iso_code || geo.registered_country?.iso_code,
                        region: geo.subdivisions?.[0]?.names?.en || geo.subdivisions?.[0]?.iso_code,
                        city: geo.city?.names?.en,
                        timezone: geo.location?.time_zone
                    };
                }
            }
            // Priority 2: Fallback to geoip-lite
            const geoLite = geoip_lite_1.default.lookup(ip);
            if (geoLite) {
                return {
                    country: geoLite.country || undefined,
                    region: geoLite.region || undefined,
                    city: geoLite.city || undefined,
                    timezone: geoLite.timezone || undefined
                };
            }
        }
        catch (error) {
            console.error(`[GeoService] Error looking up geo for IP ${ip}:`, error);
        }
        return {};
    }
    /**
     * Parse User Agent string
     */
    parseUserAgent(userAgent) {
        if (!userAgent)
            return {};
        const parser = new ua_parser_js_1.UAParser(userAgent);
        return parser.getResult();
    }
    /**
     * Get comprehensive connection metadata
     */
    async getConnectionMetadata(ip, userAgent) {
        const metadata = {};
        // Extract geo data
        const geo = await this.getGeoData(ip);
        Object.assign(metadata, geo);
        // Parse user agent
        if (userAgent) {
            const ua = this.parseUserAgent(userAgent);
            metadata.user_agent = userAgent;
            metadata.device_type = ua.device?.type || 'desktop';
            metadata.device_vendor = ua.device?.vendor;
            metadata.device_model = ua.device?.model;
            metadata.os_name = ua.os?.name;
            metadata.os_version = ua.os?.version;
            metadata.browser_name = ua.browser?.name;
            metadata.browser_version = ua.browser?.version;
        }
        return metadata;
    }
}
exports.GeoService = GeoService;
exports.default = new GeoService();
//# sourceMappingURL=geo.service.js.map