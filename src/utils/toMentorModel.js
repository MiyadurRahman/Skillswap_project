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
    isOnline: user.isOnline !== false,
    university: user.university || user.institution,
    cost: 250,
    skills:
      skillNames.length > 0
        ? skillNames.map((name, i) => ({
            id: `skill-${i}`,
            name,
            level: 'Advanced Level • 60 min',
            duration: '60 min',
          }))
        : [
            {
              id: 'general',
              name: 'Academic Mentorship',
              level: 'Flexible Level • 60 min',
              duration: '60 min',
            },
          ],
    badge1: 'Verified Scholar',
    badge2: `${user.reviewsCount || 0} Sessions Completed`,
  };
};