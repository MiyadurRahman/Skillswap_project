// Network-independent avatar artwork keeps cards usable when remote profile
// photos are blocked, slow, or unavailable. Real users can still upload a
// photo; these SVGs are polished fallbacks for scholars without an avatar.
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
  const normalized = String(name || '').trim();
  return normalized ? createInitialAvatar(normalized) : fallback;
};
