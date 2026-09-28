// Convert a real Firestore user into the shape the request form expects.
export const toMentorModel = (user) => {
  const skillNames = Array.isArray(user.skillsTeach)
    ? user.skillsTeach.map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];
  return {
    id: user.id,
    uid: user.uid || user.id,
    name: user.name || 'Scholar',
    title: user.title || 'Peer Scholar',
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline === true,
    university: user.university || user.institution,
    cost: Number(user.sessionCreditCost || 2.5),
    skills: skillNames.map((name, index) => ({
      id: `skill-${index}`,
      name,
      level: '60 minutes',
      duration: '60 min',
    })),
    badges: user.achievementBadges || [],
    completedSwaps: Number(user.completedSwaps || 0),
    requestDraft: user.requestDraft,
  };
};
