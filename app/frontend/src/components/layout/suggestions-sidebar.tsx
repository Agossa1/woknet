'use client';

import Link from 'next/link';
import { Plus, Info } from 'lucide-react';

interface SuggestionItem {
  id: number;
  name: string;
  title: string;
  image: string;
}

const suggestedPeople: SuggestionItem[] = [
  {
    id: 1,
    name: 'Sophie Laurent',
    title: 'Designer UX/UI chez Creative Studio',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  },
  {
    id: 2,
    name: 'Marie Joly',
    title: 'Product Manager • SaaS Expert',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
  },
  {
    id: 3,
    name: 'Pierre Moreau',
    title: 'Senior React Developer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pierre',
  },
];

function SuggestionsContent() {
  return (
    <>
      {/* Suggestions / Add to Feed */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ajouter à votre fil</h3>
          <Info size={14} className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {suggestedPeople.map((person) => (
            <div key={person.id} className="flex gap-3 items-start">
              <img
                src={person.image}
                alt={person.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {person.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug mb-2">
                  {person.title}
                </p>
                <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-400 hover:border-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <Plus size={16} /> Suivre
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link href="#" className="block mt-4 text-sm text-gray-500 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded px-2 w-fit">
          Voir toutes les suggestions →
        </Link>
      </div>

      {/* News / Trending */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">WorkNet Actualités</h3>
          <Info size={14} className="text-gray-400" />
        </div>
        <ul className="space-y-3">
          <li>
            <Link href="#" className="block group">
              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:underline group-hover:text-blue-600">IA générative : Le boom continue</span>
              <span className="block text-[10px] text-gray-500">il y a 2h • 14,320 lecteurs</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="block group">
              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:underline group-hover:text-blue-600">Télétravail : Les nouvelles lois</span>
              <span className="block text-[10px] text-gray-500">il y a 5h • 8,102 lecteurs</span>
            </Link>
          </li>
          <li>
            <Link href="#" className="block group">
              <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:underline group-hover:text-blue-600">Startups françaises en 2026</span>
              <span className="block text-[10px] text-gray-500">il y a 1j • 22,109 lecteurs</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-[11px] text-gray-500 dark:text-gray-400">
        <Link href="#" className="hover:text-blue-600 hover:underline">À propos</Link>
        <Link href="#" className="hover:text-blue-600 hover:underline">Accessibilité</Link>
        <Link href="#" className="hover:text-blue-600 hover:underline">Centre d'aide</Link>
        <Link href="#" className="hover:text-blue-600 hover:underline">Confidentialité et conditions</Link>
        <Link href="#" className="hover:text-blue-600 hover:underline">Options publicitaires</Link>

        <div className="w-full text-center mt-2">
          <span className="text-blue-600 font-bold">WorkNet Corporation © 2026</span>
        </div>
      </div>
    </>
  );
}

export function SuggestionsSidebar() {
  return (
    <div className="hidden lg:flex flex-col gap-2 w-80">
      <SuggestionsContent />
    </div>
  );
}

export function MobileSuggestions() {
  return (
    <div className="lg:hidden flex flex-col gap-4 w-full pb-20">
      <SuggestionsContent />
    </div>
  );
}
