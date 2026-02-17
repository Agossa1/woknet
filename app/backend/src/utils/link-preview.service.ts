import * as cheerio from 'cheerio';

export interface LinkMetadata {
    title?: string;
    description?: string;
    image?: string;
    url: string;
}

export class LinkPreviewService {
    public static async getMetadata(url: string): Promise<LinkMetadata | null> {
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
            const metadata: LinkMetadata = {
                url,
                title: $('meta[property="og:title"]').attr('content') || $('title').text() || undefined,
                description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || undefined,
                image: $('meta[property="og:image"]').attr('content') || undefined,
            };

            return metadata;
        } catch (error) {
            console.error(`LinkPreview error for ${url}:`, error);
            return null;
        }
    }

    public static extractUrls(text: string): string[] {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }
}
