'use client';

import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  ProfileInfoCard,
  PhotoUploadModal,
  ResumeExportButton
} from "./components";

// Edit Modals
import { ExperienceModal } from "./edit/components/experience-modal";
import { EducationModal } from "./edit/components/education-modal";
import { ProjectModal } from "./edit/components/project-modal";

import { selectProjects, selectProjectsLoading } from "@/src/features/projects/services/projects-selectors";
import { getProjectsThunk, createProjectThunk, updateProjectThunk } from "@/src/features/projects/services/projects-thunks";
import { LanguagesSection } from "@/src/features/languages/components/LanguagesSection";
import { CertificationsSection } from "@/src/features/certifications/components/CertificationsSection";
import { FeaturedContentSection } from "@/src/features/featured-content/components/FeaturedContentSection";

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

  // Add/Edit Modals states
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [isProjModalOpen, setIsProjModalOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2EE] dark:bg-black">
        <div className="w-5 h-5 border border-neutral-300 border-t-[#0A66C2] rounded-full animate-spin" />
      </div>
    );
  }

  const handleEdit = () => router.push('/profile/edit');

  const handleSaveProject = async (data: any) => {
    try {
      if ('id' in data) {
        await dispatch(updateProjectThunk(data)).unwrap();
      } else {
        await dispatch(createProjectThunk(data)).unwrap();
      }
      setIsProjModalOpen(false);
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

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
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans text-neutral-800 antialiased pb-10">

      <div className="max-w-[1120px] mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-neutral-500 hover:text-neutral-900 dark:hover:text-white group"
        >
          <ArrowLeft size={16} strokeWidth={1.25} className="group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'espace pro</span>
        </Link>

        {/* Header Section (Identity Plate Style) */}
        <ProfileHeader
          user={user}
          profile={profile}
          onEdit={handleEdit}
          onOpenPhotoModal={openPhotoModal}
          onOpenFollowers={() => openFollowsModal('followers')}
          onOpenFollowing={() => openFollowsModal('following')}
        />

        {/* Two-Column Layout for Sections and Widgets */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column: Main Identity & Content */}
          <div className="w-full lg:max-w-[760px] space-y-6">

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
              {profile?.user_id && <FeaturedContentSection profileId={profile.user_id} isCurrentUser={true} />}
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <ProfileAbout profile={profile} />
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <ProfileExperience
                experiences={experiences}
                isOwnProfile={true}
                onAdd={() => setIsExpModalOpen(true)}
              />
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <ProfileEducation
                educations={educations}
                isOwnProfile={true}
                onAdd={() => setIsEduModalOpen(true)}
              />
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
              {profile?.user_id && <CertificationsSection profileId={profile.user_id} isCurrentUser={true} />}
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
              {profile?.user_id && <LanguagesSection profileId={profile.user_id} isCurrentUser={true} />}
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <ProfileProjects
                projects={projects}
                isOwnProfile={true}
                onAdd={() => setIsProjModalOpen(true)}
              />
            </section>

          </div>

          {/* Right Column: Widgets & Secondary Info */}
          <aside className="w-full lg:w-[300px] space-y-6 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <h3 className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 mb-4 font-inter">Outil carrière</h3>
              <ResumeExportButton />
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 text-center font-medium">PDF Haute Qualité • Format A4</p>
            </div>

            <ProfileInfoCard user={user} profile={profile} />

            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4 font-inter">Analyses du profil</h3>
              <ProfileStats />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-4 font-inter">Compétences</h3>
              {user?.id && <SkillsSection profileId={user.id} isCurrentUser={true} />}
            </div>

            {/* Premium Card */}
            <div className="bg-[#1C1C1C] dark:bg-neutral-900 rounded-lg p-6 text-white shadow-lg border border-neutral-800">
              <div className="flex items-center gap-2 mb-4 text-[#FFB020]">
                <TrendingUp size={16} strokeWidth={1.25} />
                <span className="text-[10px] font-bold tracking-widest uppercase">Premium</span>
              </div>
              <h3 className="font-semibold text-sm mb-2 font-inter">Passez au niveau supérieur</h3>
              <p className="text-neutral-400 text-[11px] mb-6 leading-relaxed font-medium">Découvrez qui a consulté votre profil au cours des 90 derniers jours.</p>
              <button className="w-full py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors shadow-sm">
                Essayer gratuitement
              </button>
            </div>
          </aside>

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

      {isExpModalOpen && (
        <ExperienceModal
          experience={null}
          onClose={() => setIsExpModalOpen(false)}
        />
      )}

      {isEduModalOpen && (
        <EducationModal
          education={null}
          onClose={() => setIsEduModalOpen(false)}
        />
      )}

      {isProjModalOpen && profile?.user_id && (
        <ProjectModal
          isOpen={isProjModalOpen}
          project={null}
          onClose={() => setIsProjModalOpen(false)}
          onSave={handleSaveProject}
          profileId={profile.user_id}
        />
      )}
    </div>
  );
}
