'use client';

import { ProfileData } from "@/src/features/profiles/services/profile-types";
import { User } from "@/src/features/auth/services/authTypes";
import { Experience } from "@/src/features/experiences/services/experience-types";
import { Education } from "@/src/features/educations/services/education-types";
import { ProfileSkill } from "@/src/features/skills/services/skills-types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Globe, MapPin, Linkedin, Github, Phone } from "lucide-react";

interface TemplateProps {
    user: User;
    profile: ProfileData | null;
    experiences: Experience[];
    educations: Education[];
    skills: ProfileSkill[];
}

export const ClassicTemplate = ({ user, profile, experiences, educations, skills }: TemplateProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMMM yyyy', { locale: fr });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div id="resume-content" className="bg-white text-neutral-900 p-[2cm] w-[210mm] min-h-[297mm] mx-auto relative font-serif">
            {/* Centered Header */}
            <header className="text-center border-b-[3px] border-neutral-900 pb-10 mb-10">
                <h1 className="text-5xl font-bold tracking-tight mb-4 font-serif">
                    {profile?.display_name || user.full_name}
                </h1>
                <p className="text-xl font-medium text-neutral-600 mb-6 uppercase tracking-[0.1em]">
                    {user.headline || "Digital Professional"}
                </p>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[12px] font-bold text-neutral-500 uppercase tracking-widest border-t border-neutral-100 pt-6">
                    {user.email && <div className="flex items-center gap-2"><Mail size={14} /> <span>{user.email}</span></div>}
                    {profile?.location_name && <div className="flex items-center gap-2"><MapPin size={14} /> <span>{profile.location_name}</span></div>}
                    {profile?.website_url && <div className="flex items-center gap-2"><Globe size={14} /> <span>{new URL(profile.website_url).hostname}</span></div>}
                </div>
            </header>

            {/* Content Body */}
            <div className="space-y-12">
                {/* Profile Summary */}
                {profile?.bio && (
                    <section>
                        <h2 className="text-[13px] font-black uppercase tracking-[0.25em] border-b-2 border-neutral-900 pb-1 mb-4">Profil Professionnel</h2>
                        <p className="text-[14px] leading-relaxed text-neutral-700 text-justify">
                            {profile.bio}
                        </p>
                    </section>
                )}

                {/* Experience */}
                <section>
                    <h2 className="text-[13px] font-black uppercase tracking-[0.25em] border-b-2 border-neutral-900 pb-1 mb-6">Expérience Professionnelle</h2>
                    <div className="space-y-8">
                        {experiences.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="font-bold text-[16px] text-neutral-950 uppercase">{exp.title}</h3>
                                    <span className="text-[12px] font-bold italic text-neutral-500">
                                        {formatDate(exp.start_date)} — {exp.is_current ? 'Présent' : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-[14px] font-bold text-neutral-950 mb-3 tracking-wide">{exp.company_name} — {exp.location || profile?.location_name}</p>
                                <p className="text-[14px] text-neutral-700 leading-relaxed indent-4">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section>
                    <h2 className="text-[13px] font-black uppercase tracking-[0.25em] border-b-2 border-neutral-900 pb-1 mb-6">Formation & Cursus</h2>
                    <div className="space-y-6">
                        {educations.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-[15px]">{edu.school_name}</h3>
                                    <p className="text-[14px] text-neutral-600 font-medium italic">{edu.degree} en {edu.field_of_study}</p>
                                </div>
                                <span className="text-[12px] font-bold text-neutral-400">
                                    {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Skills */}
                <section>
                    <h2 className="text-[13px] font-black uppercase tracking-[0.25em] border-b-2 border-neutral-900 pb-1 mb-4">Compétences Clés</h2>
                    <div className="grid grid-cols-4 gap-x-10 gap-y-4">
                        {[...skills].map((skill) => (
                            <div key={skill.skill_id} className="flex flex-col gap-1 border-l-2 border-neutral-100 pl-4 py-1">
                                <span className="text-[13px] font-bold text-neutral-800 uppercase tracking-tighter">{skill.skill_name}</span>
                                <span className="text-[10px] text-neutral-400 font-black uppercase">{skill.level}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <footer className="mt-20 pt-10 border-t border-neutral-100 flex flex-col items-center gap-2">
                <div className="flex gap-4">
                    <Linkedin size={18} className="text-neutral-300" />
                    <Github size={18} className="text-neutral-300" />
                </div>
                <p className="text-[10px] font-bold text-neutral-300 uppercase underline decoration-neutral-100 underline-offset-8">
                    Curriculum Vitae • WorkNet Digital Authority Profile
                </p>
            </footer>
        </div>
    );
};
