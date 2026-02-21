"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ProfileSidebar, SuggestionsSidebar } from "@/src/components/layout";
import PostCard from "@/src/components/feed/post-card";
import CreatePost from "@/src/components/feed/create-post";
import CreatePostModal from "@/src/components/feed/create-post-modal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { RefreshCcw } from "lucide-react";

import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { selectProfileUser } from "@/src/features/profiles/services/profile-selectors";
import { fetchPowerFeedThunk } from "@/src/features/feeds/services/feed-thunks";
import { usePostsRealtime } from "@/src/features/posts/hooks/usePostsRealtime";
import { ProfileSuggestionsCard } from "@/src/components/feed/profile-suggestions-card";
import { TrendingHashtagsCard } from "@/src/components/feed/trending-hashtags-card";
import { JobRecommendationsCard } from "@/src/components/feed/job-recommendations-card";

const getAuthorKey = (item: any): string | null => {
  return item.author_id ?? item.profile_id ?? item.company_id ?? null;
};

const diversifyClientFeed = (items: any[]): any[] => {
  if (!items || items.length <= 1) return items;

  const pool = [...items];
  const result: any[] = [];
  let lastAuthorId: string | null = null;

  while (pool.length > 0) {
    let nextIndex = pool.findIndex(p => {
      const authorId = getAuthorKey(p);
      return authorId !== null && authorId !== lastAuthorId;
    });

    if (nextIndex === -1) {
      nextIndex = 0;
    }

    const next = pool.splice(nextIndex, 1)[0];
    result.push(next);
    lastAuthorId = getAuthorKey(next);
  }

  return result;
};

export default function FeedPage() {
  usePostsRealtime();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useAppDispatch();
  const observerTarget = useRef<HTMLDivElement>(null);

  const authUser = useAppSelector(selectAuthUser);
  const profileUser = useAppSelector(selectProfileUser);

  const { feed, loading, error, feedPage, hasMoreFeed } = useAppSelector((state: any) => state.posts);

  const sortedAndDedupedFeed = useMemo(() => {
    if (!feed || feed.length === 0) return [];

    const seen = new Set<string>();
    const deduped: any[] = [];

    // On préserve l'ordre fourni par le backend / Redux
    // et on retire simplement les doublons par id / item_id / unique_id.
    for (const item of feed) {
      if (item.content_type === "RECOMMENDATION_PROFILES" || item.content_type === "RECOMMENDATION_JOBS") {
        deduped.push(item);
        continue;
      }

      const id = (item as any).id ?? (item as any).item_id ?? (item as any).unique_id;
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);
      deduped.push(item);
    }

    return deduped;
  }, [feed]);

  const diversifiedFeed = useMemo(
    () => diversifyClientFeed(sortedAndDedupedFeed),
    [sortedAndDedupedFeed]
  );

  const handleRefresh = async () => {
    if (typeof window === "undefined" || isRefreshing) return;

    const currentFeed = feed || [];
    const wasAtTop = window.scrollY < 100;
    const previousIds = new Set(
      currentFeed.map((item: any) => item.id ?? item.item_id ?? item.unique_id)
    );

    setIsRefreshing(true);

    try {
      const action: any = await dispatch(fetchPowerFeedThunk({ page: 1 } as any));

      if (fetchPowerFeedThunk.fulfilled.match(action)) {
        const payload = action.payload as any;
        const items = (payload?.items ?? []) as any[];

        const newItems = items.filter((item: any) => {
          const id = item.id ?? item.item_id ?? item.unique_id;
          if (!id) return false; // Filter out if no ID
          return !previousIds.has(id);
        });

        if (newItems.length > 0 && wasAtTop) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    dispatch(fetchPowerFeedThunk({ page: 1 } as any));
  }, [dispatch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMoreFeed) {
          dispatch(fetchPowerFeedThunk({ page: feedPage + 1 } as any));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMoreFeed, feedPage, dispatch]);

  return (
    <div className="w-full bg-gray-50 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Sidebar Gauche */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3 space-y-4">
          <ProfileSidebar />
          <TrendingHashtagsCard />
        </div>

        {/* Flux Central */}
        <div className="col-span-1 md:col-span-9 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {(loading || isRefreshing) && (
                <span className="inline-block h-3 w-3 rounded-full border-b-2 border-primary dark:border-white animate-spin" />
              )}
              <RefreshCcw size={14} />
              <span>Actualiser le flux</span>
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-2">
              {error}
            </div>
          )}

          <CreatePost
            userAvatar={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
            onClick={() => setIsCreatePostOpen(true)}
          />

          {loading && feed?.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white" />
            </div>
          ) : diversifiedFeed.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center shadow-sm">
              <p className="text-neutral-500 dark:text-neutral-400 font-medium">Aucun post dans votre fil pour le moment.</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Actualisez le flux ou publiez le premier post.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diversifiedFeed.map((item: any, index: number) => {
                const keyBase = item.item_id ?? item.id ?? `idx-${index}`;
                const key = `feed-${keyBase}-${index}`;

                if (item.content_type === "RECOMMENDATION_PROFILES") {
                  return (
                    <div key={key} className="space-y-4">
                      <ProfileSuggestionsCard />
                    </div>
                  );
                }

                if (item.content_type === "RECOMMENDATION_JOBS") {
                  return (
                    <div key={key} className="space-y-4">
                      <JobRecommendationsCard />
                    </div>
                  );
                }

                return (
                  <div key={key} className="space-y-4">
                    <PostCard post={item} />
                  </div>
                );
              })}

              {hasMoreFeed && (
                <div ref={observerTarget} className="flex justify-center py-6">
                  {loading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white" />
                  )}
                </div>
              )}

              {!hasMoreFeed && diversifiedFeed.length > 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  Vous avez tout vu ! 🚀
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Droite */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <JobRecommendationsCard />

          <SuggestionsSidebar />
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        userAvatar={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
        userName={authUser?.full_name}
      />
    </div>
  );
}
