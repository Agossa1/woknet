import { Search, MoreHorizontal, UserPlus, MessageSquare } from "lucide-react";

export default function ConnectionsPage() {
  const connections = [
    { id: 1, name: "Marie Joly", role: "Product Manager", company: "TechCorp", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie" },
    { id: 2, name: "Pierre Moreau", role: "Full-Stack Developer", company: "StartupXYZ", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre" },
    { id: 3, name: "Sophie Laurent", role: "UX/UI Designer", company: "DigitalAgency", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie" },
    { id: 4, name: "Louis Durand", role: "Data Scientist", company: "DataCorp", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Louis" },
    { id: 5, name: "Claire Martin", role: "Marketing Lead", company: "GrowthHacking", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire" },
    { id: 6, name: "Lucas Dubreuil", role: "Frontend Dev", company: "Freelance", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
  ];

  const suggestions = [
    { id: 1, name: "Anne Dubois", role: "DevOps Engineer", company: "CloudStart", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anne" },
    { id: 2, name: "Thomas Henry", role: "CTO", company: "FinTech Solutions", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas" },
    { id: 3, name: "Camille Fournier", role: "Product Designer", company: "TechCorp", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Camille" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mon Réseau</h1>
            <p className="text-gray-500 mt-1">Gérez vos relations et découvrez de nouvelles opportunités.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une personne..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full md:w-64 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Connections Grid */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-gray-900 dark:text-white">Vos relations <span className="text-gray-400 font-normal ml-1">542</span></h2>
                <button className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition">Trier par : Récents</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-px bg-gray-100 dark:bg-gray-800">
                {connections.map(connection => (
                  <div key={connection.id} className="bg-white dark:bg-gray-900 p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                    <div className="flex items-start justify-between mb-4">
                      <img src={connection.image} alt={connection.name} className="w-12 h-12 rounded-full bg-gray-100" />
                      <button className="text-gray-400 hover:text-black dark:hover:text-white transition opacity-0 group-hover:opacity-100"><MoreHorizontal size={20} /></button>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{connection.name}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-1">{connection.role}</p>
                    <p className="text-xs text-gray-400 mb-6">{connection.company}</p>

                    <div className="flex gap-2">
                      <button className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Profil</button>
                      <button className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 transition"><MessageSquare size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition">Voir tout</button>
              </div>
            </div>
          </div>

          {/* Sidebar Suggestions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Suggestions</h2>
                <a href="#" className="text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white">Voir tout</a>
              </div>

              <div className="space-y-6">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="flex items-center gap-3">
                    <img src={suggestion.image} alt={suggestion.name} className="w-10 h-10 rounded-full bg-white" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{suggestion.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{suggestion.role}</p>
                    </div>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-white dark:hover:bg-gray-700 transition text-gray-400 hover:text-black dark:hover:text-white">
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black dark:bg-white rounded-xl p-6 text-white dark:text-black text-center">
              <h3 className="font-bold text-lg mb-2">Invitez vos amis</h3>
              <p className="text-sm opacity-80 mb-4">Développez votre réseau en invitant vos connaissances à rejoindre WorkNet.</p>
              <button className="w-full py-2 bg-white dark:bg-black text-black dark:text-white font-medium rounded-lg text-sm hover:opacity-90 transition">
                Envoyer une invitation
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
