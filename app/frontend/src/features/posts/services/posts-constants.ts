export interface PostBackgroundPreset {
    id: string;
    class: string;
    category: 'none' | 'gradient' | 'solid' | 'decorative';
    style?: React.CSSProperties;
}

export const POST_BACKGROUND_PRESETS: PostBackgroundPreset[] = [
    { id: 'none', class: 'bg-transparent border-gray-200 dark:border-gray-700', category: 'none' },

    // --- UNI (Solid) ---
    { id: 'solid-white', class: 'bg-white dark:bg-gray-800 text-neutral-900 dark:text-white border border-neutral-100 dark:border-white/10', category: 'solid' },
    { id: 'solid-gray', class: 'bg-neutral-400 text-white', category: 'solid' },
    { id: 'solid-black', class: 'bg-[#1b1f23] text-white', category: 'solid' },
    { id: 'solid-pink', class: 'bg-[#ffccd5] text-neutral-800', category: 'solid' },
    { id: 'solid-red', class: 'bg-[#ff424d] text-white', category: 'solid' },
    { id: 'solid-yellow', class: 'bg-[#ffda00] text-neutral-900 font-bold', category: 'solid' },
    { id: 'solid-green', class: 'bg-[#00a86b] text-white', category: 'solid' },

    // --- GRADIENT (Dégradé) ---
    {
        id: 'nebula-pink',
        class: 'text-white shadow-inner',
        category: 'gradient',
        style: { background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)' }
    },
    {
        id: 'aurora-blue',
        class: 'text-white',
        category: 'gradient',
        style: { background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' }
    },
    {
        id: 'sunset-deep',
        class: 'text-white',
        category: 'gradient',
        style: { background: 'linear-gradient(to top, #ff0844 0%, #ffb199 100%)' }
    },
    {
        id: 'mesh-1',
        class: 'text-white',
        category: 'gradient',
        style: { background: 'radial-gradient(at 0% 0%, #ff9a9e 0%, transparent 50%), radial-gradient(at 100% 0%, #fad0c4 0%, transparent 50%), radial-gradient(at 50% 100%, #fbc2eb 0%, transparent 50%)', backgroundColor: '#a18cd1' }
    },
    {
        id: 'mesh-2',
        class: 'text-white',
        category: 'gradient',
        style: { background: 'radial-gradient(at 80% 0%, #84fab0 0%, transparent 50%), radial-gradient(at 0% 100%, #8fd3f4 0%, transparent 50%)', backgroundColor: '#fccb90' }
    },
    {
        id: 'vibrant-wine',
        class: 'text-white',
        category: 'gradient',
        style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
    },

    // --- DECORATIVE (Décoratif) ---
    {
        id: 'bubbles-light',
        class: 'text-neutral-800',
        category: 'decorative',
        style: {
            background: 'white',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%)',
            backgroundSize: '20px 20px'
        }
    },
    {
        id: 'silk-waves',
        class: 'text-white',
        category: 'decorative',
        style: {
            background: 'linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%)',
            boxShadow: 'inset 0 0 50px rgba(255,255,255,0.3)'
        }
    },
    {
        id: 'dark-lines',
        class: 'text-white',
        category: 'decorative',
        style: {
            background: '#1d2226',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)'
        }
    },
    {
        id: 'glass-morphism',
        class: 'text-neutral-900',
        category: 'decorative',
        style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
            backdropFilter: 'blur(10px)',
            backgroundColor: '#f3f4f6'
        }
    },
    {
        id: 'hearts-red',
        class: 'text-white font-bold',
        category: 'decorative',
        style: {
            background: '#ff4d4d',
            backgroundImage: 'radial-gradient(#ff6666 20%, transparent 20%), radial-gradient(#ff6666 20%, transparent 20%)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }
    },
];

export const MAX_BACKGROUND_POST_CHARACTERS = 250;
