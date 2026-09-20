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
  orderBy,
  getDoc,
  arrayUnion,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { resolveAvatarForName, academicAssets } from '../assets';

const DEFAULT_AVATAR = academicAssets?.avatars?.defaultMaleScholar ||
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

// One time-credit swap is charged at 2.5 Academic Credits (i.e. 2.5 hours)
// when a session is settled. Mirrors the demo seed cost of 250 credits / 100.
export const DEFAULT_CREDIT_AMOUNT = 2.5;

// Normalize the credits a requester offered (stored as Academic Credit units,
// e.g. 250) into credit-hours (e.g. 2.5).
export const toCreditHours = (creditsOffered) => {
  const raw = Number(creditsOffered);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw >= 100 ? raw / 100 : raw;
};

// Coerce an arbitrary Firestore value (string, number, comma/;-separated
// string, single object) into a clean array. Guards the Discover directory
// against legacy/malformed profiles.
const asArray = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'string' ? v : v?.name || v)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,;•|\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') return [value?.name || String(value)] ;
  return [value];
};

// Coerce any numeric-ish Firestore value into a finite number, defaulting to 0.
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

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
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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
export const subscribeAllUsers = (callback, onFirst) => {
  const q = query(collection(db, 'users'));
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      const users = snap.docs.map((d) => {
        const u = d.data();
        const ratingSum = num(u.ratingSum);
        const ratingCount = num(u.ratingCount);
        return {
          id: d.id,
          uid: d.id,
          name: u.name || 'Scholar',
          title: u.title || u.academicLevel || 'Peer Scholar',
          avatarUrl: u.avatarUrl || DEFAULT_AVATAR,
          university: u.university || 'University',
          isOnline: u.isOnline,
          rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : (num(u.rating) || 4.8),
          ratingCount,
          reviewsCount: u.reviewsCount != null ? num(u.reviewsCount) : ratingCount,
          completedSwaps: num(u.completedSwaps),
          creditsEarned: num(u.creditsEarned),
          creditsSpent: num(u.creditsSpent),
          skillsTeach: asArray(u.skillsTeach || u.expertiseAreas),
          skillsWant: asArray(u.skillsWant || u.learningGoals),
          bio: u.bio || 'Scholar on SkillSwap Academic.',
          timeCredits: num(u.timeCredits),
          badges: asArray(u.badges || u.expertiseAreas).slice(0, 2),
        };
      });
      console.info(
        '[users] subscription',
        `${users.length} users`,
        users.map((u) => `${u.uid.slice(0, 8)}:${u.name}`).join(' | ')
      );
      callback(users);
    },
    (err) => {
      console.warn('[users] listener error:', err?.code || err, err?.message || '');
    }
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
      rating: r.requester?.rating || 4.8,
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
    responseNote: r.responseNote,
    declineReason: r.declineReason,
    rescheduledDate: r.rescheduledDate,
    rescheduledSlot: r.rescheduledSlot,
    rescheduleNote: r.rescheduleNote,
  };
};

// ---------------------------------------------------------------------------
// Session scheduling helpers
// ---------------------------------------------------------------------------
// Sessions historically store `date` / `time` as display strings
// (e.g. 'Monday, Oct 28, 2024', 'Morning (09:00 - 12:00)', 'Tomorrow, 14:00').
// These helpers normalize that into real timestamps so the calendar can place
// and sort sessions reliably, while staying backwards-compatible with legacy docs.

const SLOT_WINDOWS = {
  morning: [9, 0, 12, 0],
  afternoon: [13, 0, 16, 0],
  evening: [17, 0, 20, 0],
};

const MONTH_INDEX = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

const parseClockTime = (str) => {
  if (!str) return null;
  const m = String(str).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const mer = (m[3] || '').toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return { h, min };
};

const slotToWindow = (slot) => {
  if (!slot) return null;
  const text = String(slot);
  const lower = text.toLowerCase();
  for (const key of ['morning', 'afternoon', 'evening']) {
    if (lower.includes(key)) return SLOT_WINDOWS[key];
  }
  const range = text.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*(?:-|—|–|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );
  if (range) {
    const [start, , end] = [
      parseClockTime(`${range[1]}:${range[2]}${range[3] ? ` ${range[3]}` : ''}`),
      null,
      parseClockTime(`${range[4]}:${range[5]}${range[6] ? ` ${range[6]}` : ''}`),
    ];
    if (start && end) return [start.h, start.min, end.h, end.min];
  }
  const single = parseClockTime(text);
  if (single) return [single.h, single.min, single.h + 1, single.min];
  return null;
};

const parseDateParts = (str) => {
  if (!str) return null;
  const text = String(str).trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return [Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])];
  if (/tomorrow/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return [d.getFullYear(), d.getMonth(), d.getDate()];
  }
  const named = text.match(/(?:[A-Za-z]+,\s*)?([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (named) {
    const month = MONTH_INDEX[named[1].toLowerCase()];
    if (month !== undefined) {
      const year = named[3] ? Number(named[3]) : new Date().getFullYear();
      return [year, month, Number(named[2])];
    }
  }
  return null;
};

const durationToMinutes = (dur) => {
  if (!dur) return 60;
  const m = String(dur).match(/(\d+)/);
  if (!m) return 60;
  return Math.max(15, Math.min(Number(m[1]), 300));
};

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Resolve { startAt, endAt } (ms) from any supported date/time representation.
export const resolveSessionTimes = ({ date, time, duration, startAt, endAt }) => {
  const startTs = Number(startAt);
  if (startTs && !Number.isNaN(startTs) && new Date(startTs).getFullYear() > 2000) {
    const durMs = durationToMinutes(duration) * 60000;
    const endTs = Number(endAt) || startTs + durMs;
    return { startAt: startTs, endAt: endTs };
  }
  const parts = parseDateParts(date);
  if (!parts) return { startAt: null, endAt: null };
  const base = new Date(parts[0], parts[1], parts[2], 9, 0, 0);
  const window = slotToWindow(time);
  if (window) base.setHours(window[0], window[1], 0, 0);
  const start = base.getTime();
  const end = start + durationToMinutes(duration) * 60000;
  return { startAt: start, endAt: end };
};

const sessionSchedule = (s) => {
  const { startAt, endAt } = resolveSessionTimes({
    date: s.date,
    time: s.time,
    duration: s.duration,
    startAt: s.startAt,
    endAt: s.endAt,
  });
  return {
    startMs: startAt,
    endMs: endAt,
    dayKey: startAt ? dayKey(new Date(startAt)) : null,
  };
};

export const mapSession = (doc, currentUid) => {
  const s = doc.data();
  const self = s.requester?.uid === currentUid ? s.requester : s.mentor;
  const partner = self === s.requester ? s.mentor || {} : s.requester || {};
  const schedule = sessionSchedule(s);
  const creditAmount = s.creditAmount != null
    ? num(s.creditAmount)
    : toCreditHours(s.creditsOffered);
  return {
    id: doc.id,
    originRequestId: s.originRequestId,
    title: s.title || 'Academic Session',
    status: s.status || 'Accepted',
    creditAmount: creditAmount || null,
    settledBy: s.settledBy || {},
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
      rating: partner.rating || 4.8,
      reviewsCount: partner.completedSwaps ?? 0,
      university: partner.university,
    },
    notes: (s.notes || []).map((n) => ({ ...n })),
    createdAt: s.createdAt,
    startMs: schedule.startMs,
    endMs: schedule.endMs,
    dayKey: schedule.dayKey,
  };
};

// ---------------------------------------------------------------------------
// Real-time subscriptions
// ---------------------------------------------------------------------------

export const subscribeIncomingRequests = (uid, callback, onFirst) => {
  const q = query(collection(db, 'requests'), where('mentor.uid', '==', uid));
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      const list = snap.docs
        .map(mapIncomingRequest)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (err) => console.warn('Incoming requests listener error:', err)
  );
};

export const subscribeOutgoingRequests = (uid, callback, onFirst) => {
  const q = query(collection(db, 'requests'), where('requester.uid', '==', uid));
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      const list = snap.docs
        .map(mapOutgoingRequest)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(list);
    },
    (err) => console.warn('Outgoing requests listener error:', err)
  );
};

export const subscribeSessions = (uid, callback, onFirst) => {
  const q = query(collection(db, 'sessions'), where('participantIds', 'array-contains', uid));
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
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
    rating: request.requester?.rating || 4.8,
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

  const { startAt, endAt } = resolveSessionTimes({
    date: request.formattedDate || request.preferredDate,
    time: request.preferredTimeSlot,
    duration,
  });

  const sessionData = {
    originRequestId: requestId,
    title: request.requestedSkill,
    status: 'Accepted',
    creditAmount: toCreditHours(request.creditsOffered) || null,
    settledBy: {},
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
    startAt: startAt || null,
    endAt: endAt || null,
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

  // NOTE: credits are NOT moved at accept time. Time credits are only
  // transferred when a participant settles their side of the session
  // (settleSessionSide), keeping the ledger honest and never overdrafted.
  // Cosmetic/demo sessions update local state via useSessionHandlers only.

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

// Requester confirms the mentor's proposed alternate time — reopens the
// request with the new date/slot so the mentor can accept it.
export const confirmRescheduleRequest = async (requestId, newDate, newSlot) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'pending',
    preferredDate: newDate,
    formattedDate: newDate,
    preferredTimeSlot: newSlot,
    rescheduledDate: null,
    rescheduledSlot: null,
    rescheduleNote: null,
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

// ---------------------------------------------------------------------------
// Chat / conversations
// ---------------------------------------------------------------------------

// Deterministic id for a 1:1 conversation between two users.
export const getConversationId = (uidA, uidB) => [uidA, uidB].sort().join('__');

// Get or create the conversation document between two users.
export const ensureConversation = async (uidA, uidB) => {
  const convId = getConversationId(uidA, uidB);
  const ref = doc(db, 'conversations', convId);
  const data = {
    participantIds: [uidA, uidB],
  };
  // A read of a non-existent document cannot satisfy the participant-based
  // read rule. An idempotent merge works for both cases: it creates the parent
  // for a new chat and leaves all existing message metadata untouched.
  await setDoc(ref, data, { merge: true });
  return { id: convId, ...data };
};

const mapConversation = (doc) => {
  const d = doc.data();
  return {
    id: doc.id,
    participantIds: d.participantIds || [],
    lastText: d.lastText || '',
    lastFrom: d.lastFrom || '',
    lastFromName: d.lastFromName || '',
    unread: d.unread || {},
    updatedAt: d.updatedAt || 0,
  };
};

const mapMessage = (doc) => {
  const d = doc.data();
  return {
    id: doc.id,
    conversationId: d.conversationId,
    participantIds: d.participantIds || [],
    fromUid: d.fromUid,
    toUid: d.toUid,
    text: d.text || '',
    createdAt: d.createdAt || 0,
    read: d.read || false,
  };
};

// Live list of the current user's conversations, newest activity first.
export const subscribeConversations = (uid, callback, onFirst) => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', uid)
  );
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      const list = snap.docs
        .map(mapConversation)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(list);
    },
    (err) => console.warn('Conversations listener error:', err)
  );
};

// Live messages of a single conversation (oldest first).
// Retries automatically on transient errors (offline, cold rules, index
// warm-up) so the history view isn't silently killed.
export const subscribeConversationMessages = (conversationId, callback, onError) => {
  if (!conversationId) return () => {};
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  let unsub = () => {};
  let retryTimer = null;
  let stopped = false;
  let retryAttempt = 0;
  const retryableCodes = new Set([
    'aborted',
    'cancelled',
    'deadline-exceeded',
    'internal',
    'resource-exhausted',
    'unavailable',
    'unknown',
  ]);
  const listen = () => {
    unsub = onSnapshot(
      q,
      (snap) => {
        retryAttempt = 0;
        callback(snap.docs.map(mapMessage));
      },
      (err) => {
        if (stopped) return;
        const code = String(err?.code || '').replace('firestore/', '');
        if (!retryableCodes.has(code)) {
          console.warn('Messages listener stopped:', code || err);
          onError?.(err);
          return;
        }
        const delay = Math.min(30_000, 1_000 * 2 ** retryAttempt);
        retryAttempt += 1;
        console.warn(`Messages listener retrying in ${delay}ms:`, code);
        retryTimer = setTimeout(listen, delay);
      }
    );
  };
  listen();
  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    unsub();
  };
};

// Send a message and bump the recipient's unread counter atomically. The
// conversation is created by ensureConversation before the chat opens. Do not
// rewrite participantIds here: reversing the same two IDs still counts as a
// protected array-field change in Firestore and makes replies fail for the
// participant whose sender/recipient order differs from the stored order.
export const sendMessage = async ({ conversationId, participantIds, fromUid, toUid, fromName, text }) => {
  const convId = conversationId || getConversationId(fromUid, toUid);
  const convRef = doc(db, 'conversations', convId);
  const msgRef = doc(collection(db, 'conversations', convId, 'messages'));
  const now = Date.now();
  const messageParticipantIds = participantIds || [fromUid, toUid];

  const batch = writeBatch(db);
  batch.update(convRef, {
    lastText: text,
    lastFrom: fromUid,
    lastFromName: fromName || 'Scholar',
    updatedAt: now,
    [`unread.${toUid}`]: increment(1),
  });
  batch.set(msgRef, {
    conversationId: convId,
    participantIds: messageParticipantIds,
    fromUid,
    toUid,
    text,
    createdAt: now,
    read: false,
  });

  // increment() creates `unread.<toUid>` when that nested counter is absent.
  // Keeping it in this batch prevents a successfully stored message from being
  // reported as failed merely because a later unread update was rejected.
  await batch.commit();
};

// Reset the current user's unread counter for a conversation.
export const markConversationRead = async (conversationId, uid) => {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unread.${uid}`]: 0,
  });
};

// ---------------------------------------------------------------------------
// Time-credit ledger & session settlement
// ---------------------------------------------------------------------------
// Each participant settles ONLY their own side of a session (rules enforce
// `request.auth.uid == uid` on their own users/transactions docs). When the
// requester settles, the agreed credits move from their balance to the
// mentor's; writes happen in one transaction so a low balance is never
// overdrafted and the session flips to Completed exactly once per user.

export const mapTransaction = (doc) => {
  const t = doc.data();
  return {
    id: doc.id,
    sessionId: t.sessionId || '',
    title: t.title || '',
    type: t.type || 'spent',
    amount: num(t.amount),
    date: t.date || formatTimeAgo(t.createdAt),
    createdAt: num(t.createdAt) || Date.now(),
    partner: t.partner || 'Peer Scholar',
    partnerUid: t.partnerUid || '',
  };
};

export const subscribeTransactions = (uid, callback, onFirst) => {
  const q = query(
    collection(db, 'transactions'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      callback(snap.docs.map(mapTransaction));
    },
    (err) => console.warn('Transactions listener error:', err?.code || err)
  );
};

// Settle the current user's side of a session.
//  - requester: pays min(agreed, balance) -> mentor earns the same amount
//  - mentor:   we never require the mentor to hold credits; they just earn
// When both sides have settled, the session is marked Completed.
export const settleSessionSide = async ({ sessionId, currentUid }) => {
  if (!sessionId || !currentUid) {
    throw new Error('Missing session or user for settlement.');
  }
  const sessionRef = doc(db, 'sessions', sessionId);

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(sessionRef);
    if (!snap.exists()) throw new Error('Session not found.');

    const s = snap.data();
    const amount = s.creditAmount != null ? s.creditAmount : DEFAULT_CREDIT_AMOUNT;

    if (s.status === 'Completed') {
      throw new Error('This session is already completed.');
    }
    if ((s.settledBy && s.settledBy[currentUid]) || (s.settled && s.settled[currentUid])) {
      throw new Error('You already settled this session.');
    }

    const requesterUid = s.requester?.uid;
    const mentorUid = s.mentor?.uid;
    const participants = s.participantIds || [requesterUid, mentorUid].filter(Boolean);
    if (!participants.includes(currentUid)) {
      throw new Error('You are not a participant in this session.');
    }

    const isRequester = currentUid === requesterUid
      ? true
      : currentUid === mentorUid
        ? false
        : !(participants[0] === mentorUid);

    const partnerUid = isRequester ? mentorUid : requesterUid;

    const myUserRef = doc(db, 'users', currentUid);
    const mySnap = await tx.get(myUserRef);
    const myData = mySnap.exists() ? mySnap.data() : {};
    const balance = num(myData.timeCredits);

    // The ledger must stay symmetric: the requester pays the agreed amount
    // (never more than they actually hold), and the mentor earns exactly what
    // was paid. If the requester can't cover the full amount we refuse rather
    // than mint credits out of thin air.
    if (isRequester && balance < amount) {
      throw new Error(
        `Not enough time credits to settle this session (need ${amount}, have ${balance.toFixed(2)}).`
      );
    }
    const paid = amount;

    const now = Date.now();

    if (isRequester) {
      tx.set(doc(collection(db, 'transactions')), {
        uid: currentUid,
        sessionId,
        partnerUid,
        partner: s.mentor?.name || 'Peer Mentor',
        title: s.title || 'Peer Mentoring Session',
        type: 'spent',
        amount: -paid,
        createdAt: now,
        date: `settled ${formatTimeAgo(now)}`,
      });
    } else {
      tx.set(doc(collection(db, 'transactions')), {
        uid: currentUid,
        sessionId,
        partnerUid,
        partner: s.requester?.name || 'Peer Scholar',
        title: s.title || 'Peer Mentoring Session',
        type: 'earned',
        amount,
        createdAt: now,
        date: `settled ${formatTimeAgo(now)}`,
      });
    }

    tx.update(myUserRef, {
      timeCredits: Number((balance + (isRequester ? -paid : amount)).toFixed(3)),
      creditsEarned: num(myData.creditsEarned) + (isRequester ? 0 : amount),
      creditsSpent: num(myData.creditsSpent) + (isRequester ? paid : 0),
    });

    const nextSettledBy = { ...(s.settledBy || {}), [currentUid]: now };
    const allSettled = participants.every((p) => nextSettledBy[p] != null);

    tx.update(sessionRef, {
      settledBy: nextSettledBy,
      ...[allSettled ? { status: 'Completed', completedAt: now } : {}],
    });

    return { paid, isRequester, allSettled, completedAt: allSettled ? now : null };
  });

  return result;
};

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
// One deterministic review doc per (session, author) so a participant can
// review a completed session exactly once. Ratings bump the target profile's
// ratingCount/ratingSum (rules guard the bump so nobody can inflate ratings).

export const reviewDocumentId = (sessionId, authorUid) =>
  `${sessionId}__${authorUid}`;

export const subscribeReviewStatus = (sessionId, authorUid, callback) => {
  if (!sessionId || !authorUid) return () => {};
  const reviewRef = doc(db, 'reviews', reviewDocumentId(sessionId, authorUid));
  return onSnapshot(
    reviewRef,
    (snapshot) => callback(snapshot.exists()),
    (error) => console.warn('Review status listener error:', error?.code || error)
  );
};

export const mapReview = (doc) => {
  const r = doc.data();
  return {
    id: doc.id,
    sessionId: r.sessionId || '',
    authorUid: r.authorUid || '',
    authorName: r.authorName || 'Scholar',
    authorAvatar: r.authorAvatar || DEFAULT_AVATAR,
    targetUid: r.targetUid || '',
    rating: num(r.rating),
    comment: r.comment || '',
    createdAt: num(r.createdAt) || Date.now(),
    meta: r.createdAt ? `Reviewed ${formatTimeAgo(r.createdAt)}` : 'Recent review',
  };
};

export const subscribeReviews = (targetUid, callback, onFirst) => {
  const q = query(
    collection(db, 'reviews'),
    where('targetUid', '==', targetUid),
    orderBy('createdAt', 'desc')
  );
  let fired = false;
  return onSnapshot(
    q,
    (snap) => {
      if (!fired && onFirst) {
        fired = true;
        onFirst();
      }
      callback(snap.docs.map(mapReview));
    },
    (err) => console.warn('Reviews listener error:', err?.code || err)
  );
};

export const submitReview = async ({
  sessionId,
  authorUid,
  authorName,
  authorAvatar,
  targetUid,
  rating,
  comment,
}) => {
  if (!sessionId || !authorUid || !targetUid) {
    throw new Error('Missing review references.');
  }
  const clamped = Math.max(1, Math.min(5, Math.round(num(rating))));
  const reviewRef = doc(db, 'reviews', reviewDocumentId(sessionId, authorUid));

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(reviewRef);
    if (existing.exists()) {
      throw new Error('You already reviewed this session.');
    }

    const targetRef = doc(db, 'users', targetUid);
    const targetSnap = await tx.get(targetRef);
    if (!targetSnap.exists()) {
      throw new Error('The reviewed scholar no longer exists.');
    }

    tx.set(reviewRef, {
      sessionId,
      authorUid,
      authorName: authorName || 'Scholar',
      authorAvatar: authorAvatar || DEFAULT_AVATAR,
      targetUid,
      rating: clamped,
      comment: comment || '',
      createdAt: Date.now(),
    });

    tx.update(targetRef, {
      ratingCount: increment(1),
      ratingSum: increment(clamped),
    });
  });

  return { rating: clamped };
};
