import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { resolveAvatarForName, academicAssets } from '../assets';

const DEFAULT_AVATAR = academicAssets?.avatars?.defaultMaleScholar ||
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export const formatTimeAgo = (ts) => {
  if (!ts) return 'Recently';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
};

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const upsertUserProfile = async (uid, profile) => {
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    { ...profile, uid, updatedAt: Date.now() },
    { merge: true }
  );
  return profile;
};

export const getUserProfile = async (uid) => {
  const snap = await getDocs(query(collection(db, 'users')));
  const hit = snap.docs.find((d) => d.id === uid);
  return hit ? { id: hit.id, ...hit.data() } : null;
};

// Create the user doc only if it doesn't exist yet; never overwrite existing
// profile fields on every login.
export const ensureUserProfile = async (uid, profile) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  await setDoc(ref, { ...profile, uid, updatedAt: Date.now() }, { merge: true });
  return profile;
};

export const subscribeUserProfile = (uid, callback) => {
  const ref = doc(db, 'users', uid);
  return onSnapshot(
    ref,
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err) => console.warn('Profile listener error:', err)
  );
};

// All public scholar profiles (for the Discover directory). Excludes no one;
// the UI filters out the current viewer.
export const subscribeAllUsers = (callback) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(
    q,
    (snap) => {
      const users = snap.docs.map((d) => {
        const u = d.data();
        return {
          id: d.id,
          uid: d.id,
          name: u.name || 'Scholar',
          title: u.title || u.academicLevel || 'Peer Scholar',
          avatarUrl: u.avatarUrl || DEFAULT_AVATAR,
          university: u.university || 'University',
          isOnline: u.isOnline,
          rating: u.rating ?? 4.8,
          reviewsCount: u.completedSwaps ?? 0,
          skillsTeach: u.expertiseAreas || u.skillsTeach || [],
          skillsWant: u.learningGoals || u.skillsWant || [],
          bio: u.bio || 'Scholar on SkillSwap Academic.',
          timeCredits: u.timeCredits ?? 0,
          badges: (u.expertiseAreas || []).slice(0, 2),
        };
      });
      callback(users);
    },
    (err) => console.warn('Users listener error:', err)
  );
};

// ---------------------------------------------------------------------------
// Request mapping (Firestore doc -> shape the existing UI expects)
// ---------------------------------------------------------------------------

export const mapIncomingRequest = (doc) => {
  const r = doc.data();
  return {
    id: doc.id,
    requester: {
      id: r.requester?.uid,
      name: r.requester?.name || 'Scholar',
      title: r.requester?.title || 'Peer Scholar',
      university: r.requester?.university || 'University',
      avatarUrl: r.requester?.avatarUrl || DEFAULT_AVATAR,
      rating: r.requester?.rating ?? 4.8,
      completedSwaps: r.requester?.completedSwaps ?? 0,
      isOnline: r.requester?.isOnline ?? false,
    },
    requestedSkill: r.requestedSkill || 'Academic Skills',
    skillLevel: r.skillLevel || 'Advanced Level • 60 min',
    offeredExchange: r.offeredExchange || `${r.creditsOffered ?? 250} Academic Credits`,
    offeredSkill: r.offeredSkill || 'Peer Expertise',
    preferredDate: r.preferredDate,
    formattedDate: r.formattedDate || r.preferredDate || 'Flexible date',
    preferredTimeSlot: r.preferredTimeSlot || 'Any time slot',
    goals: r.goals || '',
    status: r.status || 'pending',
    urgency:
      r.status === 'pending'
        ? r.urgency || 'Expires in 24 hours'
        : r.status,
    submittedAt: formatTimeAgo(r.createdAt),
    createdAt: r.createdAt,
    creditsOffered: r.creditsOffered ?? 250,
    linkedSessionId: r.linkedSessionId,
    responseNote: r.responseNote,
    declineReason: r.declineReason,
    rescheduledDate: r.rescheduledDate,
    rescheduledSlot: r.rescheduledSlot,
    rescheduleNote: r.rescheduleNote,
  };
};

export const mapOutgoingRequest = (doc) => {
  const r = doc.data();
  return {
    id: doc.id,
    mentor: {
      id: r.mentor?.uid,
      name: r.mentor?.name || 'Scholar',
      title: r.mentor?.title || 'Peer Scholar',
      avatarUrl: r.mentor?.avatarUrl || DEFAULT_AVATAR,
      badge1: r.mentor?.badge1 || 'Verified Scholar',
      badge2: r.mentor?.badge2 || 'Peer Mentor',
    },
    requestedSkill: r.requestedSkill || 'Academic Skills',
    skillLevel: r.skillLevel || 'Advanced Level • 60 min',
    cost: r.cost ?? r.creditsOffered ?? 250,
    creditsOffered: r.creditsOffered ?? 250,
    preferredDate: r.preferredDate || 'Flexible date',
    formattedDate: r.formattedDate || r.preferredDate || 'Flexible date',
    preferredTimeSlot: r.preferredTimeSlot || 'Any time slot',
    goals: r.goals || '',
    status: r.status || 'pending',
    submittedAt: formatTimeAgo(r.createdAt),
    createdAt: r.createdAt,
    linkedSessionId: r.linkedSessionId,
  };
};

export const mapSession = (doc, currentUid) => {
  const s = doc.data();
  const self = s.requester?.uid === currentUid ? s.requester : s.mentor;
  const partner = self === s.requester ? s.mentor || {} : s.requester || {};
  return {
    id: doc.id,
    originRequestId: s.originRequestId,
    title: s.title || 'Academic Session',
    status: s.status || 'Accepted',
    description: s.description || '',
    learningGoals: s.learningGoals || [],
    duration: s.duration || '60 Minutes',
    method: s.method || 'Video Call',
    platform: s.platform || 'Google Meet',
    date: s.date || 'Upcoming',
    time: s.time || '',
    meetingLink: s.meetingLink || '',
    requesterUid: s.requester?.uid,
    mentorUid: s.mentor?.uid,
    participantIds: s.participantIds || [],
    partner: {
      id: partner.uid,
      name: partner.name || 'Partner',
      title: partner.title || 'Peer Scholar',
      avatarUrl: partner.avatarUrl || DEFAULT_AVATAR,
      isOnline: partner.isOnline !== false,
      badges: partner.badges || ['Scholar Swap'],
      rating: partner.rating ?? 4.8,
      reviewsCount: partner.completedSwaps ?? 0,
      university: partner.university,
    },
    notes: (s.notes || []).map((n) => ({ ...n })),
  };
};

// ---------------------------------------------------------------------------
// Real-time subscriptions
// ---------------------------------------------------------------------------

export const subscribeIncomingRequests = (uid, callback) => {
  const q = query(collection(db, 'requests'), where('mentor.uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map(mapIncomingRequest)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (err) => console.warn('Incoming requests listener error:', err)
  );
};

export const subscribeOutgoingRequests = (uid, callback) => {
  const q = query(collection(db, 'requests'), where('requester.uid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map(mapOutgoingRequest)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (err) => console.warn('Outgoing requests listener error:', err)
  );
};

export const subscribeSessions = (uid, callback) => {
  const q = query(collection(db, 'sessions'), where('participantIds', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => mapSession(d, uid))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (err) => console.warn('Sessions listener error:', err)
  );
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

// Build the requester snapshot from the current user's profile.
export const buildRequesterSnapshot = (uid, profile) => ({
  uid,
  name: profile?.name || 'Scholar',
  title: profile?.title || profile?.academicLevel || 'Peer Scholar',
  avatarUrl: profile?.avatarUrl || resolveAvatarForName(profile?.name || 'Scholar', DEFAULT_AVATAR),
  university: profile?.university || 'University',
  rating: profile?.rating ?? 4.8,
  completedSwaps: profile?.completedSwaps ?? 0,
  isOnline: true,
  expertiseAreas: profile?.expertiseAreas || [],
  learningGoals: profile?.learningGoals || [],
});

export const createRequest = async ({ requester, mentor, details }) => {
  const uid = auth?.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be signed in to a real Firebase account to send a live request.');
  }
  const safeRequester =
    requester?.uid && requester.uid !== uid ? { ...requester, uid } : requester;
  const docRef = await addDoc(collection(db, 'requests'), {
    requester: safeRequester || { uid, name: 'Scholar' },
    mentor,
    ...details,
    status: 'pending',
    createdAt: Date.now(),
  });
  return docRef.id;
};

// Accept an incoming request and atomically create the confirmed session.
export const acceptRequest = async ({
  requestId,
  request,
  currentUid,
  currentProfile,
  note,
  platform = 'Google Meet',
  meetingLink = 'https://meet.google.com/new',
}) => {
  const sessionRef = doc(collection(db, 'sessions'));
  const sessionId = sessionRef.id;

  const requester = {
    uid: request.requester?.id,
    name: request.requester?.name || 'Scholar',
    title: request.requester?.title || 'Peer Scholar',
    avatarUrl: request.requester?.avatarUrl || DEFAULT_AVATAR,
    university: request.requester?.university || 'University',
    rating: request.requester?.rating ?? 4.8,
    completedSwaps: request.requester?.completedSwaps ?? 0,
    isOnline: true,
  };

  const mentor = {
    uid: currentUid,
    name: currentProfile?.name || 'Scholar',
    title: currentProfile?.title || currentProfile?.academicLevel || 'Peer Scholar',
    avatarUrl: currentProfile?.avatarUrl || DEFAULT_AVATAR,
    university: currentProfile?.university || 'University',
    rating: currentProfile?.rating ?? 0,
    completedSwaps: currentProfile?.completedSwaps ?? 0,
    isOnline: true,
    badges: (currentProfile?.expertiseAreas || []).slice(0, 2),
  };

  const duration = request.skillLevel?.includes('90')
    ? '90 Minutes'
    : request.skillLevel?.includes('45')
      ? '45 Minutes'
      : '60 Minutes';

  const sessionData = {
    originRequestId: requestId,
    title: request.requestedSkill,
    status: 'Accepted',
    description: `Collaborative mentorship session requested by ${requester.name}. Focus: ${request.requestedSkill}.`,
    learningGoals: [
      `Master foundational concepts in ${request.requestedSkill}`,
      'Solve core applied problems and edge cases',
      'Review methodological integrity and literature context',
    ],
    duration,
    method: 'Video Call',
    platform,
    date: request.formattedDate || request.preferredDate,
    time: request.preferredTimeSlot,
    meetingLink,
    requester,
    mentor,
    participantIds: [requester.uid, mentor.uid].filter(Boolean),
    notes: [
      {
        id: `note-${Date.now()}-1`,
        authorUid: requester.uid,
        authorName: requester.name,
        authorAvatar: requester.avatarUrl,
        timestamp: request.submittedAt || 'Recently',
        createdAt: request.createdAt || Date.now(),
        text: request.goals,
      },
      note
        ? {
            id: `note-${Date.now()}-2`,
            authorUid: currentUid,
            authorName: mentor.name,
            authorAvatar: mentor.avatarUrl,
            timestamp: 'Just now',
            createdAt: Date.now(),
            text: note,
          }
        : null,
    ].filter(Boolean),
    createdAt: Date.now(),
  };

  const requestRef = doc(db, 'requests', requestId);
  const batch = writeBatch(db);
  batch.update(requestRef, {
    status: 'accepted',
    respondedAt: Date.now(),
    responseNote: note || '',
    linkedSessionId: sessionId,
  });
  batch.set(sessionRef, sessionData);

  await batch.commit();

  // Small convenience: bump the mentor's credit ledger (cosmetic for now).
  const credits = request.creditsOffered ? request.creditsOffered / 100 : 0;
  if (credits > 0 && currentUid) {
    try {
      await updateDoc(doc(db, 'users', currentUid), {
        timeCredits: (Number(currentProfile?.timeCredits) || 0) + credits,
      });
    } catch (e) {
      console.warn('Could not update credits:', e);
    }
  }

  return sessionId;
};

export const declineRequest = async (requestId, reason) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'declined',
    respondedAt: Date.now(),
    declineReason: reason || 'Schedule conflict during this time slot',
  });
};

export const rescheduleRequest = async (requestId, { date, slot, note }) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'rescheduled',
    respondedAt: Date.now(),
    rescheduledDate: date,
    rescheduledSlot: slot,
    rescheduleNote: note || '',
  });
};

export const cancelOutgoingRequest = async (requestId) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'cancelled',
    respondedAt: Date.now(),
  });
};

export const updateSession = async (sessionId, fields) => {
  await updateDoc(doc(db, 'sessions', sessionId), fields);
};

export const addSessionNote = async (sessionId, note) => {
  await updateDoc(doc(db, 'sessions', sessionId), {
    notes: arrayUnion(note),
  });
};