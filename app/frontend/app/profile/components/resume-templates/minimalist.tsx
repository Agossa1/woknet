'use client';

import { ProfileData } from "@/src/features/profiles/services/profile-types";
import { User } from "@/src/features/auth/services/authTypes";
import { Experience } from "@/src/features/experiences/services/experience-types";
import { Education } from "@/src/features/educations/services/education-types";
import { ProfileSkill } from "@/src/features/skills/services/skills-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Globe, MapPin, Linkedin, Github } from "lucide-react";

interface TemplateProps {
    user: User;
    profile: ProfileData | null;
    experiences: Experience[];
    educations: Education[];
    skills: ProfileSkill[];
}

export const MinimalistTemplate = ({ user, profile, experiences, educations, skills }: TemplateProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMM yyyy', { locale: fr });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div id="resume-content" className="bg-white text-neutral-900 p-[1.5cm] w-[210mm] min-h-[297mm] mx-auto relative overflow-hidden font-sans">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
                <span className="text-[120px] font-black -rotate-45 whitespace-nowrap uppercase tracking-widest">
                    WorkNet Resume
                </span>
            </div>

            {/* Header */}
            <header className="border-b-2 border-neutral-900 pb-8 mb-8 relative z-10">
                <div className="flex justify-between items-start gap-8">
                    <div className="flex items-start gap-6">
                        {profile?.avatar_url && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-neutral-900 flex-shrink-0 bg-neutral-100">
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase mb-1 leading-none">
                                {profile?.display_name || user.full_name}
                            </h1>
                            <p className="text-lg font-bold text-neutral-400 tracking-tight">
                                {user.headline || "Expert Professionnel"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right space-y-1 text-[11px] font-bold uppercase tracking-tight">
                        {user.email && <div className="flex items-center justify-end gap-2"><span>{user.email}</span><Mail size={12} /></div>}
                        {profile?.location_name && <div className="flex items-center justify-end gap-2"><span>{profile.location_name}</span><MapPin size={12} /></div>}
                        {profile?.website_url && <div className="flex items-center justify-end gap-2"><span>{new URL(profile.website_url).hostname}</span><Globe size={12} /></div>}
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <div className="grid grid-cols-12 gap-10 relative z-10">
                {/* Main Column */}
                <div className="col-span-8 space-y-10">
                    {profile?.bio && (
                        <section>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] border-b border-neutral-100 pb-2 mb-4">Profil</h2>
                            <p className="text-[13px] leading-relaxed text-neutral-600">
                                {profile.bio}
                            </p>
                        </section>
                    )}

                    <section>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] border-b border-neutral-100 pb-2 mb-6">Expériences</h2>
                        <div className="space-y-8">
                            {experiences.map((exp) => (
                                <div key={exp.id} className="relative">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-black text-[15px] uppercase tracking-tight">{exp.title}</h3>
                                        <span className="text-[10px] font-black text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded uppercase">
                                            {formatDate(exp.start_date)} — {exp.is_current ? 'Présent' : formatDate(exp.end_date)}
                                        </span>
                                    </div>
                                    <p className="text-[12px] font-bold text-neutral-900 mb-2 uppercase tracking-wide">{exp.company_name}</p>
                                    <p className="text-[12px] text-neutral-500 leading-relaxed">
                                        {exp.description}
                                    </p>
                                    {exp.stack && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {exp.stack.split(',').map((s, i) => (
                                                <span key={i} className="text-[9px] font-bold border border-neutral-200 text-neutral-400 px-1.5 py-0.5 rounded uppercase">
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
                    <section>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] border-b border-neutral-100 pb-2 mb-6">Formation</h2>
                        <div className="space-y-6">
                            {educations.map((edu) => (
                                <div key={edu.id}>
                                    <p className="text-[10px] font-black text-neutral-300 mb-1 uppercase">
                                        {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                                    </p>
                                    <h3 className="font-bold text-[13px] leading-tight mb-1">{edu.degree}</h3>
                                    <p className="text-[12px] text-neutral-500 font-medium">{edu.field_of_study}</p>
                                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tighter mt-1">{edu.school_name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] border-b border-neutral-100 pb-2 mb-6">Skills</h2>
                        <div className="space-y-2">
                            {[...skills].sort((a, b) => b.endorsements_count - a.endorsements_count).map((skill) => (
                                <div key={skill.skill_id} className="flex justify-between items-center py-1.5 border-b border-dashed border-neutral-100 last:border-0">
                                    <span className="text-[12px] font-bold text-neutral-700">{skill.skill_name}</span>
                                    <span className="text-[9px] text-neutral-400 font-black uppercase">{skill.level}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <footer className="mt-auto pt-16 text-center">
                <p className="text-[9px] font-bold text-neutral-200 uppercase tracking-[0.3em]">
                    WorkNet Certified Resume Part of professional ecosystem
                </p>
            </footer>
        </div>
    );
};
