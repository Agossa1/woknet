import { FeedService } from "../../modules/feeds/feed.services";

type MinimalPost = {
    id: string;
    author_id?: string;
    profile_id?: string;
    company_id?: string;
    created_at?: Date;
    base_score?: number;
};

function assertMaxPerAuthor(posts: MinimalPost[], maxPerAuthor: number) {
    const counts: Record<string, number> = {};
    for (const p of posts) {
        const authorId = p.author_id;
        if (!authorId) continue;
        counts[authorId] = (counts[authorId] ?? 0) + 1;
        if (counts[authorId] > maxPerAuthor) {
            throw new Error(`Author ${authorId} appears more than ${maxPerAuthor} times`);
        }
    }
}

function assertNoAdjacentSameAuthor(posts: MinimalPost[]) {
    let lastAuthor: string | null = null;
    for (const p of posts) {
        if (lastAuthor && p.author_id === lastAuthor) {
            throw new Error(`Adjacent posts from same author ${lastAuthor}`);
        }
        lastAuthor = p.author_id ?? null;
    }
}

function assertNoDuplicateItems(posts: MinimalPost[]) {
    const ids = new Set<string>();
    for (const p of posts) {
        if (ids.has(p.id)) {
            throw new Error(`Duplicate item id detected: ${p.id}`);
        }
        ids.add(p.id);
    }
}

async function run() {
    (process as any).env.FEED_MAX_PER_AUTHOR = "2";
    const service = new FeedService({} as any, {} as any);
    const diversify = (service as any).diversifyFeed.bind(service) as (posts: MinimalPost[]) => MinimalPost[];

    const scenarios: { name: string; posts: MinimalPost[] }[] = [
        {
            name: "Auteur unique",
            posts: Array.from({ length: 5 }).map((_, i) => ({
                id: `A-${i}`,
                author_id: "A"
            }))
        },
        {
            name: "Auteur dominant avec autres auteurs",
            posts: [
                { id: "1", author_id: "A" },
                { id: "2", author_id: "A" },
                { id: "3", author_id: "A" },
                { id: "4", author_id: "B" },
                { id: "5", author_id: "C" },
                { id: "6", author_id: "A" },
                { id: "7", author_id: "D" }
            ]
        },
        {
            name: "Plusieurs auteurs équilibrés",
            posts: [
                { id: "1", author_id: "A" },
                { id: "2", author_id: "B" },
                { id: "3", author_id: "C" },
                { id: "4", author_id: "A" },
                { id: "5", author_id: "B" },
                { id: "6", author_id: "C" }
            ]
        },
        {
            name: "Doublons potentiels",
            posts: [
                { id: "1", author_id: "A" },
                { id: "1", author_id: "A" },
                { id: "2", author_id: "B" },
                { id: "2", author_id: "B" }
            ]
        },
        {
            name: "Auteur via profile_id uniquement",
            posts: [
                { id: "1", profile_id: "P1" },
                { id: "2", profile_id: "P1" },
                { id: "3", profile_id: "P1" },
                { id: "4", profile_id: "P2" }
            ]
        }
    ];

    for (const scenario of scenarios) {
        const diversified = diversify(scenario.posts);
        assertNoDuplicateItems(diversified);
        assertMaxPerAuthor(diversified, 2);
        if (diversified.length > 1 && new Set(diversified.map(p => p.author_id)).size > 1) {
            assertNoAdjacentSameAuthor(diversified);
        }
        console.log(`Scenario "${scenario.name}" ok. Input=${scenario.posts.length}, Output=${diversified.length}`);
    }

    console.log("All diversification scenarios passed");
}

run().catch(err => {
    console.error("Diversification tests failed", err);
    process.exit(1);
});
