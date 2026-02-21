"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feed_services_1 = require("../../modules/feeds/feed.services");
function assertMaxPerAuthor(posts, maxPerAuthor) {
    const counts = {};
    for (const p of posts) {
        const authorId = p.author_id;
        if (!authorId)
            continue;
        counts[authorId] = (counts[authorId] ?? 0) + 1;
        if (counts[authorId] > maxPerAuthor) {
            throw new Error(`Author ${authorId} appears more than ${maxPerAuthor} times`);
        }
    }
}
function assertNoAdjacentSameAuthor(posts) {
    let lastAuthor = null;
    for (const p of posts) {
        if (lastAuthor && p.author_id === lastAuthor) {
            throw new Error(`Adjacent posts from same author ${lastAuthor}`);
        }
        lastAuthor = p.author_id ?? null;
    }
}
function assertNoDuplicateItems(posts) {
    const ids = new Set();
    for (const p of posts) {
        if (ids.has(p.id)) {
            throw new Error(`Duplicate item id detected: ${p.id}`);
        }
        ids.add(p.id);
    }
}
async function run() {
    process.env.FEED_MAX_PER_AUTHOR = "2";
    const service = new feed_services_1.FeedService({}, {});
    const diversify = service.diversifyFeed.bind(service);
    const scenarios = [
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
//# sourceMappingURL=test-feed-diversify.js.map