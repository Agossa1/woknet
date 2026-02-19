'use client';

import { ProfileData } from "@/src/features/profiles/services/profile-types";
import { User } from "@/src/features/auth/services/authTypes";
import { Experience } from "@/src/features/experiences/services/experience-types";
import { Education } from "@/src/features/educations/services/education-types";
import { ProfileSkill } from "@/src/features/skills/services/skills-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Globe, MapPin, Linkedin, Github } from "lucide-react";

interface ResumeTemplateProps {
    user: User;
    profile: ProfileData | null;
    experiences: Experience[];
    educations: Education[];
    skills: ProfileSkill[];
}

export const ResumeTemplate = ({ user, profile, experiences, educations, skills }: ResumeTemplateProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMM yyyy', { locale: fr });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div id="resume-content" className="bg-white text-neutral-900 p-[2cm] w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:p-0 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
                <span className="text-[120px] font-black   -rotate-45 whitespace-nowrap">
                    WorkNet Resume
                </span>
            </div>

            {/* Header */}
            <header className="border-b-2 border-neutral-900 pb-8 mb-8">
                <div className="flex justify-between items-start gap-8">
                    <div className="flex items-start gap-6">
                        {profile?.avatar_url && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-neutral-900 flex-shrink-0">
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">
                                {profile?.display_name || user.full_name}
                            </h1>
                            <p className="text-lg font-bold text-neutral-500 tracking-tight">
                                {user.headline || "Expert Professionnel"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right space-y-1 text-[13px] font-medium flex-shrink-0">
                        {user.email && (
                            <div className="flex items-center justify-end gap-2">
                                <span>{user.email}</span>
                                <Mail size={14} />
                            </div>
                        )}
                        {profile?.location_name && (
                            <div className="flex items-center justify-end gap-2">
                                <span>{profile.location_name}</span>
                                <MapPin size={14} />
                            </div>
                        )}
                        {profile?.website_url && (
                            <div className="flex items-center justify-end gap-2">
                                <span>{new URL(profile.website_url).hostname}</span>
                                <Globe size={14} />
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-3 mt-2 text-neutral-400">
                            {profile?.social_linkedin && <Linkedin size={16} />}
                            {profile?.social_github && <Github size={16} />}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="grid grid-cols-12 gap-10">
                {/* Main Column */}
                <div className="col-span-8 space-y-10">
                    {/* Summary */}
                    {profile?.bio && (
                        <section>
                            <h2 className="text-[15px] font-black uppercase tracking-widest border-b border-neutral-200 pb-2 mb-4">Profil</h2>
                            <p className="text-[14px] leading-relaxed text-neutral-700">
                                {profile.bio}
                            </p>
                        </section>
                    )}

                    {/* Experience */}
                    <section>
                        <h2 className="text-[15px] font-black uppercase tracking-widest border-b border-neutral-200 pb-2 mb-6">Expériences</h2>
                        <div className="space-y-8">
                            {experiences.map((exp) => (
                                <div key={exp.id} className="relative pl-4 border-l-2 border-neutral-100">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-[16px]">{exp.title}</h3>
                                        <span className="text-[12px] font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded">
                                            {formatDate(exp.start_date)} — {exp.is_current ? 'Présent' : formatDate(exp.end_date)}
                                        </span>
                                    </div>
                                    <p className="text-[14px] font-bold text-[#0A66C2] mb-2">{exp.company_name}</p>
                                    <p className="text-[13px] text-neutral-600 leading-relaxed whitespace-pre-line">
                                        {exp.description}
                                    </p>
                                    {exp.stack && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {exp.stack.split(',').map((s, i) => (
                                                <span key={i} className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded uppercase">
                                                    {s.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="col-span-4 space-y-10">
                    {/* Education */}
                    <section>
                        <h2 className="text-[15px] font-black uppercase tracking-widest border-b border-neutral-200 pb-2 mb-6">Formation</h2>
                        <div className="space-y-6">
                            {educations.map((edu) => (
                                <div key={edu.id}>
                                    <p className="text-[11px] font-bold text-neutral-400 mb-1">
                                        {formatDate(edu.start_date)} — {edu.is_current ? 'Présent' : formatDate(edu.end_date)}
                                    </p>
                                    <h3 className="font-bold text-[14px] leading-tight mb-1">{edu.degree} en {edu.field_of_study}</h3>
                                    <p className="text-[13px] text-neutral-600">{edu.school_name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-[15px] font-black uppercase tracking-widest border-b border-neutral-200 pb-2 mb-6">Compétences</h2>
                        <div className="space-y-4">
                            {[...skills].sort((a, b) => b.endorsements_count - a.endorsements_count).map((skill) => (
                                <div key={skill.skill_id} className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[13px] font-bold">{skill.skill_name}</span>
                                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                                            {skill.level}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neutral-900"
                                            style={{
                                                width: skill.level === 'EXPERT' ? '100%' :
                                                    skill.level === 'ADVANCED' ? '75%' :
                                                        skill.level === 'INTERMEDIATE' ? '50%' : '25%'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-8 border-t border-neutral-100 text-center">
                <p className="text-[10px] font-bold text-neutral-300 uppercase  ">
                    Généré via WorkNet • Le réseau professionnel nouvelle génération
                </p>
            </footer>
        </div>
    );
};
