const normalizeSkills = (value) => {
  const items = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,;|\n]+/)
      : [];

  return [...new Set(
    items
      .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
      .map((skill) => String(skill || '').trim())
      .filter(Boolean)
  )];
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

// Keep Dashboard and Discover aligned even when older Firestore profiles use
// slightly different names for the same scholar fields.
export const toMentorCardModel = (scholar = {}) => {
  const rawUser = scholar.rawUser || scholar;
  const skillsTeach = normalizeSkills(
    scholar.skillsTeach ?? scholar.skills ?? scholar.badges ?? rawUser.skillsTeach
  );

  return {
    id: scholar.uid || scholar.id || rawUser.uid || rawUser.id || scholar.name || 'scholar',
    name: scholar.name || rawUser.name || 'Scholar',
    title:
      scholar.title ||
      scholar.field ||
      rawUser.title ||
      scholar.academicLevel ||
      rawUser.academicLevel ||
      'Academic Scholar',
    academicLevel: scholar.academicLevel || rawUser.academicLevel || '',
    institution:
      scholar.institution ||
      scholar.university ||
      rawUser.institution ||
      rawUser.university ||
      'Institution not provided',
    avatarUrl: scholar.avatarUrl || rawUser.avatarUrl,
    isOnline: scholar.isOnline === true || rawUser.isOnline === true,
    rating: safeNumber(
      scholar.ratingAverage ?? scholar.rating ?? rawUser.ratingAverage ?? rawUser.rating ?? 0
    ),
    reviewsCount: safeNumber(
      scholar.ratingCount ?? scholar.reviewsCount ?? rawUser.ratingCount ?? rawUser.reviewsCount ?? 0
    ),
    completedSwaps: safeNumber(scholar.completedSwaps ?? rawUser.completedSwaps ?? 0),
    skillsTeach,
    rawUser,
  };
};
