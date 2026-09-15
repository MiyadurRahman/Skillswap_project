// Unified search/filter matcher for BOTH demo peers (allPeers) and realtime
// users (mapped by subscribeAllUsers). The two shapes don't share a schema, so
// each peer is normalized into lowercase searchable strings.

export const ACADEMIC_KEYWORDS = {
  'PhD Candidate': ['phd', 'ph.d', 'doctoral candidate', 'doctorate'],
  "Master's Student": ['master', 'msc', 'graduate researcher'],
  'Undergraduate Senior': ['undergraduate', 'bsc', 'bachelor', 'b.sc'],
  'Postdoctoral Researcher': ['postdoc', 'post-doctoral', 'postdoctoral', 'fellow'],
};

const normalizePeer = (peer) => {
  const skills = peer.skills || [];
  const skillsTeach = peer.skillsTeach || [];
  const badges = peer.badges || [];
  const title = peer.title || peer.academicLevel || '';
  const bio = peer.bio || '';
  const university = peer.university || peer.institution || '';

  const fieldStr = [peer.primaryField, title, ...skills, ...skillsTeach, ...badges]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const searchStr = [peer.name, title, bio, university, fieldStr]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const academicStr = [peer.academicLevel, title].filter(Boolean).join(' ').toLowerCase();
  const availabilityStr = [peer.availability, peer.nextAvailable]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return { fieldStr, searchStr, academicStr, availabilityStr, rating: peer.rating };
};

export const matchesFilters = (peer, { searchQuery, selectedFields, minRating, availability, academicLevel }) => {
  const p = normalizePeer(peer);

  if ((p.rating || 4.0) < minRating) {
    return false;
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    if (!p.searchStr.includes(q)) {
      return false;
    }
  }

  const activeFields = Object.keys(selectedFields).filter((k) => selectedFields[k]);
  if (activeFields.length > 0) {
    const matched = activeFields.some(
      (f) => p.fieldStr.includes(f.toLowerCase()) || f.toLowerCase().includes(p.fieldStr)
    );
    if (!matched) {
      return false;
    }
  }

  if (availability && availability !== 'Anytime') {
    const kw =
      availability === 'Today'
        ? /today/
        : availability === 'This Week'
        ? /this week|mon|tue|wed|thu|fri/
        : /sat|sun|weekend/;
    if (!kw.test(p.availabilityStr)) {
      return false;
    }
  }

  if (academicLevel && academicLevel !== 'Any Level') {
    const kws = ACADEMIC_KEYWORDS[academicLevel];
    if (kws && !kws.some((kw) => p.academicStr.includes(kw))) {
      return false;
    }
  }

  return true;
};