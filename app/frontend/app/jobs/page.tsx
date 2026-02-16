import { MapPin, Briefcase, Clock, Building2, Search, Filter } from "lucide-react";

export default function JobsPage() {
  const jobs = [
    {
      id: 1,
      title: "Senior Fintech Developer",
      company: "Wave Mobile Money",
      location: "Dakar, Sénégal",
      level: "Senior",
      salary: "2.5M - 3.5M FCFA",
      type: "CDI",
      posted: "2h",
      tags: ["Python", "Django", "PostgreSQL"],
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=WM"
    },
    {
      id: 2,
      title: "DevOps Engineer",
      company: "Paystack",
      location: "Lagos, Nigeria",
      level: "Mid-Level",
      salary: "Competitive",
      type: "Full-time",
      posted: "1j",
      tags: ["Kubernetes", "AWS", "Terraform"],
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=PAY"
    },
    {
      id: 3,
      title: "Product Designer UX/UI",
      company: "Orange Digital Center",
      location: "Abidjan, Côte d'Ivoire",
      level: "Confirmé",
      salary: "1.2M - 1.8M FCFA",
      type: "CDI",
      posted: "3j",
      tags: ["Figma", "Design Thinking", "Prototypage"],
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=ODC"
    },
    {
      id: 4,
      title: "Frontend Developer React",
      company: "M-KOPA",
      location: "Nairobi, Kenya",
      level: "Senior",
      salary: "KSh 250k - 400k",
      type: "Remote",
      posted: "5j",
      tags: ["React", "TypeScript", "Next.js"],
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=MK"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Offres d'emploi</h1>
            <p className="text-gray-500 mt-1">Découvrez des opportunités qui correspondent à votre profil.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un poste..."
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-64 transition"
              />
            </div>
            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <Filter size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-3 space-y-8 hidden lg:block">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Type de contrat</h3>
              <div className="space-y-2.5">
                {['CDI', 'CDD', 'Freelance', 'Stage'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Localisation</h3>
              <div className="space-y-2.5">
                {['Paris', 'Dakar', 'Abidjan', 'Lagos', 'Remote'].map(loc => (
                  <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition">{loc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job Feed */}
          <div className="lg:col-span-9 space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg hover:border-black/5 dark:hover:border-white/10 transition-all duration-300 cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700">
                    <img src={job.logo} alt={job.company} className="w-8 h-8 opacity-80" />
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:underline decoration-1 underline-offset-4">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{job.company}</span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">{job.posted}</span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        <Briefcase size={14} /> {job.type}
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        <Clock size={14} /> Plein temps
                      </div>
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">
                        {job.salary}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
