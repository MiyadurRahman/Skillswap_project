// Assets helper for academic avatars, university badges, and images
export const academicAssets = {
  logoTitle: "SkillSwap Academic",
  avatars: {
    // Professional South Asian / Bangladeshi male scholar & student portraits
    tanvirAhmed: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80",
    rafiqulIslam: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=240&auto=format&fit=crop&q=80",
    mahirFaisal: "https://images.unsplash.com/photo-1531891437562-4301cf092a3d?w=240&auto=format&fit=crop&q=80",
    shakibChowdhury: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=240&auto=format&fit=crop&q=80",
    abrarZahin: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=240&auto=format&fit=crop&q=80",
    // Backwards-compatible aliases for existing keys
    alexRivera: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80",
    julianSterling: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=240&auto=format&fit=crop&q=80",
    sarahKhan: "https://images.unsplash.com/photo-1531891437562-4301cf092a3d?w=240&auto=format&fit=crop&q=80",
    jamesWhitmore: "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?w=240&auto=format&fit=crop&q=80",
    defaultScholar: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80",
    defaultMaleScholar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    defaultFemaleScholar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&auto=format&fit=crop&q=80",
  },
  photos: {
    libraryStudy: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    architectureBlueprints: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    inspirationalLibrary: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  },
  icons: {
    google: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh32jh__K9dXUW9NlyxfGrgA_7edB_mUwvtRD5eEUYmNBbo17PCtPBzhirNZo-3g42nlL4QUj5s7hmICpdibIxJHkqKAj5AUjhuQSJlVVYCpzoai32pXyVQDW1QHEyI7e3UmSrgRrDapiuHMFIp3Dy8GdAfcKb9qRlxnzUx-8tmgH_2PN9rTFsHNaZOfgbgmLlzFOF_BEBx4NI29jvG_iHzClow5C-RuXI6ERv8coSriMCdkYbGh7RUg",
  }
};

export const resolveAvatarForName = (name, fallback = academicAssets.avatars.defaultMaleScholar) => {
  const normalized = (name || '').trim().toLowerCase();
  if (!normalized) return fallback;

  const femaleHints = [
    'sarah', 'sadia', 'maria', 'nabila', 'faria', 'tania', 'anika', 'salma', 'ruma',
    'mim', 'sanjida', 'nusaiba', 'maisha', 'raisa', 'jannat', 'sharna', 'esha',
    'rehana', 'tasnia', 'tinni', 'sabrina', 'afrin', 'saba', 'sumi', 'lisa', 'julia'
  ];
  const maleHints = [
    'tanvir', 'abrar', 'shakib', 'rafiqul', 'mahir', 'ahmed', 'hasan', 'arif',
    'rahman', 'hossain', 'saif', 'sabbir', 'jamil', 'nabil', 'mir', 'nazim', 'shuvo',
    'imran', 'sifat', 'taz', 'zahid', 'rayan', 'farhan', 'adnan', 'tamim'
  ];

  const isFemale = femaleHints.some((hint) => normalized.includes(hint));
  const isMale = maleHints.some((hint) => normalized.includes(hint));

  if (isFemale && !isMale) return academicAssets.avatars.defaultFemaleScholar;
  if (isMale && !isFemale) return academicAssets.avatars.defaultMaleScholar;

  return fallback;
};
