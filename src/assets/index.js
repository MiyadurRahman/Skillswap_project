// Network-independent avatar artwork keeps cards usable when remote profile
// photos are blocked, slow, or unavailable. Real users can still upload a
// photo; these SVGs are the polished default for seeded/demo scholars.
const escapeXml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const createInitialAvatar = (
  name = 'Scholar',
  startColor = '#675975',
  endColor = '#c5b3d3'
) => {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'S';
  const safeInitials = escapeXml(initials);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${startColor}"/><stop offset="1" stop-color="${endColor}"/></linearGradient></defs><rect width="240" height="240" rx="120" fill="url(#g)"/><circle cx="190" cy="50" r="62" fill="#fff" opacity=".08"/><circle cx="42" cy="208" r="78" fill="#fff" opacity=".06"/><text x="120" y="137" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="72" font-weight="700" fill="#fff">${safeInitials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Assets helper for academic avatars, university badges, and images
export const academicAssets = {
  logoTitle: "SkillSwap Academic",
  avatars: {
    tanvirAhmed: createInitialAvatar('Tanvir Ahmed', '#365a69', '#86b2bd'),
    rafiqulIslam: createInitialAvatar('Rafiqul Islam', '#4f415c', '#b89ac7'),
    mahirFaisal: createInitialAvatar('Mahir Faisal', '#735548', '#d3a88d'),
    shakibChowdhury: createInitialAvatar('Shakib Chowdhury', '#365a4d', '#82b49f'),
    abrarZahin: createInitialAvatar('Abrar Zahin', '#564b78', '#a89acb'),
    // Backwards-compatible aliases for existing keys
    alexRivera: createInitialAvatar('Alex Rivera', '#365a69', '#86b2bd'),
    julianSterling: createInitialAvatar('Julian Sterling', '#4f415c', '#b89ac7'),
    sarahKhan: createInitialAvatar('Sarah Khan', '#7a4f65', '#d9a8bd'),
    jamesWhitmore: createInitialAvatar('James Whitmore', '#365a4d', '#82b49f'),
    defaultScholar: createInitialAvatar('Scholar'),
    defaultMaleScholar: createInitialAvatar('Scholar', '#4f415c', '#9a83aa'),
    defaultFemaleScholar: createInitialAvatar('Scholar', '#7a4f65', '#c997ad'),
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
