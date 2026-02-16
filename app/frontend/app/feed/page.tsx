"use client";

import { useEffect, useState } from "react";
import { ProfileSidebar } from "@/src/components/layout";
import { SuggestionsSidebar } from "@/src/components/layout";
import PostCard from "@/src/components/feed/post-card";
import CreatePost from "@/src/components/feed/create-post";
import CreatePostModal from "@/src/components/feed/create-post-modal";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { selectProfileUser } from "@/src/features/profiles/services/profile-selectors";
import { fetchFeedThunk } from "@/src/features/posts/services/posts-thunks";
import { usePostsRealtime } from "@/src/features/posts/hooks/usePostsRealtime";
import { ProfileSuggestionsCard } from "@/src/components/feed/profile-suggestions-card";
import { TrendingHashtagsCard } from "@/src/components/feed/trending-hashtags-card";

export default function FeedPage() {
  usePostsRealtime();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const profileUser = useAppSelector(selectProfileUser);
  const { feed, loading } = useAppSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeedThunk({}));
  }, [dispatch]);

  return (
    <div className="w-full bg-gray-50 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left Sidebar */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3 space-y-4">
          <ProfileSidebar />
          <TrendingHashtagsCard />
        </div>

        {/* Center Feed */}
        <div className="col-span-1 md:col-span-9 lg:col-span-6 space-y-4">

          <CreatePost
            userAvatar={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
            onClick={() => setIsCreatePostOpen(true)}
          />

          {/* Feed Content */}
          {loading && feed.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : (
            feed.map((post) => (
              <PostCard
                key={post.unique_id || post.id}
                post={post}
              />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <ProfileSuggestionsCard />
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
