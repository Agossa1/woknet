import { Request } from 'express';
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import maxmind, { Reader, CityResponse } from 'maxmind';
import path from 'path';
import fs from 'fs';

export interface ConnectionMetadata {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    device_type?: string;
    device_vendor?: string;
    device_model?: string;
    os_name?: string;
    os_version?: string;
    browser_name?: string;
    browser_version?: string;
    user_agent?: string;
}

export class GeoService {
    private cityReader: Reader<CityResponse> | null = null;
    private dbPath = path.join(process.cwd(), 'data', 'GeoLite2-City.mmdb');

    constructor() {
        this.initMaxMind();
    }

    /**
     * Initialize MaxMind reader if database exists
     */
    private async initMaxMind() {
        try {
            if (fs.existsSync(this.dbPath)) {
                this.cityReader = await maxmind.open<CityResponse>(this.dbPath);
                console.log('[GeoService] MaxMind GeoLite2-City database loaded successfully.');
            } else {
                console.warn(`[GeoService] MaxMind database not found at ${this.dbPath}. Using geoip-lite as fallback.`);
            }
        } catch (error) {
            console.error('[GeoService] Failed to initialize MaxMind:', error);
        }
    }

    /**
     * Extracts the client IP address from the request.
     */
    public getIpFromRequest(req: Request): string {
        let ip = req.headers['x-forwarded-for'] as string;

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
    public async getGeoData(ip: string): Promise<Partial<ConnectionMetadata>> {
        if (!ip || ip === '127.0.0.1') return {};

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
            const geoLite = geoip.lookup(ip);
            if (geoLite) {
                return {
                    country: geoLite.country || undefined,
                    region: geoLite.region || undefined,
                    city: geoLite.city || undefined,
                    timezone: geoLite.timezone || undefined
                };
            }
        } catch (error) {
            console.error(`[GeoService] Error looking up geo for IP ${ip}:`, error);
        }

        return {};
    }

    /**
     * Parse User Agent string
     */
    public parseUserAgent(userAgent: string): UAParser.IResult {
        if (!userAgent) return {} as UAParser.IResult;
        const parser = new UAParser(userAgent);
        return parser.getResult();
    }

    /**
     * Get comprehensive connection metadata
     */
    public async getConnectionMetadata(ip: string, userAgent?: string): Promise<ConnectionMetadata> {
        const metadata: ConnectionMetadata = {};

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

export default new GeoService();
