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

export const ModernTemplate = ({ user, profile, experiences, educations, skills }: TemplateProps) => {
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMM yyyy', { locale: fr });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div id="resume-content" className="bg-white text-neutral-800 w-[210mm] min-h-[297mm] mx-auto shadow-2xl flex relative overflow-hidden font-sans group">
            {/* Sidebar with background */}
            <div className="w-[35%] bg-neutral-900 text-white p-10 flex flex-col gap-10">
                {/* Photo */}
                <div className="flex flex-col items-center">
                    {profile?.avatar_url && (
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-800 shadow-xl mb-6">
                            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold tracking-tight text-center leading-tight">
                        {profile?.display_name || user.full_name}
                    </h1>
                    <p className="text-sm font-medium text-neutral-400 mt-2 text-center uppercase tracking-widest px-2">
                        {user.headline || "Professional Expert"}
                    </p>
                </div>

                {/* Contact */}
                <section className="space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500 border-b border-neutral-800 pb-2">Contact</h2>
                    <div className="space-y-3 text-[12px] font-medium text-neutral-300">
                        {user.email && <div className="flex items-center gap-3"><Mail size={16} className="text-[#0A66C2]" /> <span>{user.email}</span></div>}
                        {profile?.location_name && <div className="flex items-center gap-3"><MapPin size={16} className="text-[#0A66C2]" /> <span>{profile.location_name}</span></div>}
                        {profile?.website_url && <div className="flex items-center gap-3"><Globe size={16} className="text-[#0A66C2]" /> <span>{new URL(profile.website_url).hostname}</span></div>}
                    </div>
                </section>

                {/* Skills */}
                <section className="space-y-6">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500 border-b border-neutral-800 pb-2">Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                        {[...skills].sort((a, b) => b.endorsements_count - a.endorsements_count).map((skill) => (
                            <span key={skill.skill_id} className="text-[10px] bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-full font-bold uppercase tracking-tighter">
                                {skill.skill_name}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Socials */}
                <div className="mt-auto flex justify-center gap-6 text-neutral-600">
                    <Linkedin size={20} />
                    <Github size={20} />
                </div>
            </div>

            {/* Main Content */}
            <div className="w-[65%] p-12 py-16 flex flex-col gap-10">
                {/* Profile Text */}
                {profile?.bio && (
                    <section>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#0A66C2] mb-4">À Propos</h2>
                        <p className="text-[14px] leading-relaxed text-neutral-600 font-medium italic">
                            "{profile.bio}"
                        </p>
                    </section>
                )}

                {/* Experience */}
                <section>
                    <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#0A66C2] mb-6">Parcours Professionnel</h2>
                    <div className="space-y-8">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="group/item">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-[16px] text-neutral-900 group-hover/item:text-[#0A66C2] transition-colors">{exp.title}</h3>
                                    <span className="text-[11px] font-black text-neutral-400 uppercase tracking-tighter whitespace-nowrap ml-4">
                                        {formatDate(exp.start_date)} — {exp.is_current ? 'Présent' : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-[13px] font-black text-neutral-500 mb-3 uppercase tracking-wider">{exp.company_name}</p>
                                <p className="text-[13px] text-neutral-600 leading-relaxed font-medium">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Education */}
                <section>
                    <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[#0A66C2] mb-6">Formation</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {educations.map((edu) => (
                            <div key={edu.id}>
                                <h3 className="font-bold text-[13px] text-neutral-900 mb-1">{edu.degree}</h3>
                                <p className="text-[12px] text-neutral-500 font-medium leading-tight">{edu.field_of_study}</p>
                                <p className="text-[11px] text-neutral-400 font-bold uppercase mt-2">{edu.school_name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="mt-auto border-t border-neutral-100 pt-8 flex justify-between items-center text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">
                    <span>WorkNet Ecosystem</span>
                    <span>Verified Professional Digital Profile</span>
                </footer>
            </div>
        </div>
    );
};
