'use client';

import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Redux Selectors & Thunks
import { selectProfileUser, selectProfileLoading } from "@/src/features/profiles/services/profile-selectors";
import { getProfileThunk, updateProfileThunk } from "@/src/features/profiles/services/profile-thunks";
import { selectExperiences, selectExperiencesLoading } from "@/src/features/experiences/services/experience-selectors";
import { selectEducations, selectEducationsLoading } from "@/src/features/educations/services/education-selectors";
import { getProfileSkillsThunk } from "@/src/features/skills/services/skills-thunks";
import { getExperiencesByProfileIdThunk } from "@/src/features/experiences/services/experience-thunks";
import { getEducationsByProfileIdThunk } from "@/src/features/educations/services/education-thunks";

// Follows
import { FollowsListModal } from "@/src/features/follows/components/follows-list-modal";

// API services
import { profileServices } from "@/src/features/profiles/services/profile-api";

// Components
import { SkillsSection } from "@/src/features/skills/components/skills-section";
import {
  ProfileHeader,
  ProfileAbout,
  ProfileExperience,
  ProfileEducation,
  ProfileStats,
  ProfileProjects,
  PhotoUploadModal
} from "./components";
import { selectProjects, selectProjectsLoading } from "@/src/features/projects/services/projects-selectors";
import { getProjectsThunk } from "@/src/features/projects/services/projects-thunks";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const profile = useAppSelector(selectProfileUser);
  const experiences = useAppSelector(selectExperiences);
  const educations = useAppSelector(selectEducations);
  const projects = useAppSelector(selectProjects);
  const isLoadingProfile = useAppSelector(selectProfileLoading);
  const isLoadingExperiences = useAppSelector(selectExperiencesLoading);
  const isLoadingEducations = useAppSelector(selectEducationsLoading);
  const isLoadingProjects = useAppSelector(selectProjectsLoading);

  // Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoType, setPhotoType] = useState<'avatar' | 'banner' | null>(null);

  const [isFollowsModalOpen, setIsFollowsModalOpen] = useState(false);
  const [followsModalType, setFollowsModalType] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    if (user && !user.has_onboarded) {
      router.push('/onboarding');
    }
    if (user?.id) {
      dispatch(getProfileThunk(user.id));
      dispatch(getExperiencesByProfileIdThunk(user.id));
      dispatch(getEducationsByProfileIdThunk(user.id));
      dispatch(getProfileSkillsThunk(user.id));
      dispatch(getProjectsThunk(user.id));
    }
  }, [user, router, dispatch]);

  if (!user || (isLoadingProfile && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="ml-3 text-sm font-medium text-gray-400">Chargement du profil...</p>
      </div>
    );
  }

  const handleEdit = () => router.push('/profile/edit');

  const openPhotoModal = (type: 'avatar' | 'banner') => {
    setPhotoType(type);
    setIsPhotoModalOpen(true);
  };

  const openFollowsModal = (type: 'followers' | 'following') => {
    setFollowsModalType(type);
    setIsFollowsModalOpen(true);
  };

  const handleUploadPhoto = async (file: File) => {
    if (!photoType || !profile) return;

    try {
      const uploadResult = await profileServices.uploadProfileImage(file, photoType);

      if (uploadResult && uploadResult.success) {
        const newUrl = uploadResult.data.url;
        const updatedData = {
          ...profile,
          [photoType === 'avatar' ? 'avatar_url' : 'banner_url']: newUrl
        };

        const result = await dispatch(updateProfileThunk(updatedData));
        if (updateProfileThunk.fulfilled.match(result)) {
          // Success handled by reducer updating state
        } else {
          throw new Error("Erreur lors de la mise à jour du profil");
        }
      } else {
        throw new Error("Le serveur n'a pas confirmé le succès de l'upload.");
      }
    } catch (error: any) {
      alert(`Erreur d'upload: ${error.message || "Erreur inconnue"}`);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">

      {/* Header Section (Banner + Avatar + Basic Info + Contact Bar) */}
      <ProfileHeader
        user={user}
        profile={profile}
        onEdit={handleEdit}
        onOpenPhotoModal={openPhotoModal}
        onOpenFollowers={() => openFollowsModal('followers')}
        onOpenFollowing={() => openFollowsModal('following')}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-12 space-y-8 md:space-y-12">

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content (Left Column on large screens) */}
          <div className="lg:col-span-8 space-y-12">

            <ProfileAbout profile={profile} />

            <ProfileExperience experiences={experiences} />

            <ProfileEducation educations={educations} />

            <ProfileProjects projects={projects} />


          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-4 space-y-10 h-fit lg:sticky lg:top-24">

            <ProfileStats />

            {/* Skills - Dynamic Component */}
            {user?.id && <SkillsSection profileId={user.id} isCurrentUser={true} />}

          </div>
        </div>
      </div>

      {/* Modals */}
      {photoType && (
        <PhotoUploadModal
          isOpen={isPhotoModalOpen}
          type={photoType}
          currentImageUrl={photoType === 'avatar' ? profile?.avatar_url : profile?.banner_url}
          onClose={() => setIsPhotoModalOpen(false)}
          onUpload={handleUploadPhoto}
        />
      )}

      {isFollowsModalOpen && user?.id && (
        <FollowsListModal
          isOpen={isFollowsModalOpen}
          onClose={() => setIsFollowsModalOpen(false)}
          profileId={user.id}
          type={followsModalType}
          title={followsModalType === 'followers' ? "Abonnés" : "Abonnements"}
        />
      )}
    </div>
  );
}
