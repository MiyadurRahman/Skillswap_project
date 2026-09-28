import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  query,
  where,
  orderBy,
  limitToLast,
  limit,
  getDoc,
  arrayUnion,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { resolveAvatarForName, academicAssets } from '../assets';
import {
  getLocalTimeZone,
  isValidTimeZone,
  toTimeInputValue,
  zonedDateTimeToEpoch,
} from '../utils/dateUtils';
import {
  DEFAULT_CREDIT_AMOUNT,
  INITIAL_TIME_CREDITS,
} from '../config/economy';

const DEFAULT_AVATAR = academicAssets?.avatars?.defaultMaleScholar || resolveAvatarForName('Scholar');

export { DEFAULT_CREDIT_AMOUNT } from '../config/economy';

// Normalize legacy hundred-based values while storing new values directly.
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

// Firestore rejects `undefined` anywhere in an object, including nested
// optional profile fields. Remove only undefined values while preserving nulls.
const firestoreData = (value) => {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== undefined).map(firestoreData);
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, firestoreData(entry)])
    );
  }
  return value;
};

export const getAchievementBadges = (profile = {}) => {
  const badges = [];
  const swaps = num(profile.completedSwaps);
  const count = num(profile.ratingCount);
  const average = count > 0 ? num(profile.ratingSum) / count : 0;
  const taught = asArray(profile.skillsTeach || profile.expertiseAreas);
  const wanted = asArray(profile.skillsWant || profile.learningGoals);
  if (swaps >= 1) badges.push('First Swap');
  if (swaps >= 5) badges.push('Active Scholar');
  if (swaps >= 20) badges.push('Swap Veteran');
  if (count >= 5 && average >= 4.5) badges.push('Highly Rated');
  if (count >= 10 && average >= 4.8) badges.push('Trusted Mentor');
  if (num(profile.creditsEarned) >= 25) badges.push('Knowledge Contributor');
  if (taught.length >= 3 && wanted.length >= 3) badges.push('Skill Explorer');
  return badges;
};

const millis = (value) => {
  if (value && typeof value.toMillis === 'function') return value.toMillis();
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export const formatTimeAgo = (ts) => {
  const timestamp = millis(ts);
  if (!timestamp) return 'Recently';
  const diff = Date.now() - timestamp;
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

const editableProfile = (profile = {}) => {
  const allowed = [
    'name', 'title', 'academicLevel', 'university', 'bio', 'avatarUrl',
    'expertiseAreas', 'learningGoals', 'skillsTeach', 'skillsWant',
    'availability', 'preferredMode', 'isOnline', 'lastActiveAt',
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => profile[key] !== undefined)
      .map((key) => [key, profile[key]])
  );
};

export const upsertUserProfile = async (uid, profile) => {
  const ref = doc(db, 'users', uid);
  const existing = await getDoc(ref);
  const initialStats = existing.exists() ? {} : {
    timeCredits: INITIAL_TIME_CREDITS,
    creditsEarned: 0,
    creditsSpent: 0,
    completedSwaps: 0,
    ratingCount: 0,
    ratingSum: 0,
    ratingAverage: 0,
    achievementBadges: [],
  };
  await setDoc(
    ref,
    { ...editableProfile(profile), ...initialStats, uid, updatedAt: Date.now() },
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
  await setDoc(
    ref,
    {
      ...editableProfile(profile),
      timeCredits: INITIAL_TIME_CREDITS,
      creditsEarned: 0,
      creditsSpent: 0,
      completedSwaps: 0,
      ratingCount: 0,
      ratingSum: 0,
      ratingAverage: 0,
      achievementBadges: [],
      uid,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
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

// Public scholar profiles used by Discover. Keep this projection explicit so
// fields added to account documents never leak into the directory model.
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
        const lastActiveAt = millis(u.lastActiveAt);
        const achievementBadges = getAchievementBadges(u);
        return {
          id: d.id,
          uid: d.id,
          name: u.name || 'Scholar',
          title: u.title || u.academicLevel || 'Peer Scholar',
          avatarUrl: u.avatarUrl || DEFAULT_AVATAR,
          university: u.university || 'University',
          isOnline: u.isOnline === true || (lastActiveAt > 0 && Date.now() - lastActiveAt < 5 * 60 * 1000),
          lastActiveAt,
          rating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
          ratingCount,
          reviewsCount: ratingCount,
          completedSwaps: num(u.completedSwaps),
          creditsEarned: num(u.creditsEarned),
          creditsSpent: num(u.creditsSpent),
          skillsTeach: asArray(u.skillsTeach || u.expertiseAreas),
          skillsWant: asArray(u.skillsWant || u.learningGoals),
          bio: u.bio || 'Scholar on SkillSwap Academic.',
          timeCredits: num(u.timeCredits),
          badges: achievementBadges,
          achievementBadges,
          availability: u.availability || '',
          preferredMode: u.preferredMode || '',
          academicLevel: u.academicLevel || '',
          credentials: asArray(u.credentials),
        };
      });
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
      rating: num(r.requester?.rating),
      completedSwaps: r.requester?.completedSwaps ?? 0,
      isOnline: r.requester?.isOnline ?? false,
    },
    requestedSkill: r.requestedSkill || 'Skill not specified',
    skillLevel: r.skillLevel || 'Not specified',
    offeredExchange: r.offeredExchange || `${r.creditsOffered ?? DEFAULT_CREDIT_AMOUNT} Academic Credits`,
    offeredSkill: r.offeredSkill || '',
    preferredDate: r.preferredDate,
    timeZone: r.timeZone || '',
    formattedDate: r.formattedDate || r.preferredDate || 'Flexible date',
    preferredTimeSlot: r.preferredTimeSlot || 'Any time slot',
    goals: r.goals || '',
    status: r.status || 'pending',
    urgency:
      r.status === 'pending'
        ? r.urgency || 'Awaiting response'
        : r.status,
    submittedAt: formatTimeAgo(r.createdAt),
    createdAt: r.createdAt,
    creditsOffered: r.creditsOffered ?? DEFAULT_CREDIT_AMOUNT,
    linkedSessionId: r.linkedSessionId,
    responseNote: r.responseNote,
    declineReason: r.declineReason,
    rescheduledDate: r.rescheduledDate,
    rescheduledSlot: r.rescheduledSlot,
    rescheduledTimeZone: r.rescheduledTimeZone || '',
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
      badge1: r.mentor?.badges?.[0] || '',
      badge2: r.mentor?.badges?.[1] || '',
    },
    requestedSkill: r.requestedSkill || 'Academic Skills',
    skillLevel: r.skillLevel || 'Not specified',
    cost: r.cost ?? r.creditsOffered ?? DEFAULT_CREDIT_AMOUNT,
    creditsOffered: r.creditsOffered ?? DEFAULT_CREDIT_AMOUNT,
    preferredDate: r.preferredDate || 'Flexible date',
    timeZone: r.timeZone || '',
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
    rescheduledTimeZone: r.rescheduledTimeZone || '',
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
export const resolveSessionTimes = ({ date, time, duration, startAt, endAt, timeZone }) => {
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
  const hour = window ? window[0] : 9;
  const minute = window ? window[1] : 0;
  const start = isValidTimeZone(timeZone)
    ? zonedDateTimeToEpoch({
        year: parts[0],
        month: parts[1] + 1,
        day: parts[2],
        hour,
        minute,
        timeZone,
      })
    : (base.setHours(hour, minute, 0, 0), base.getTime());
  if (!start) return { startAt: null, endAt: null };
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
    timeZone: s.timeZone,
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
    cancelledAt: millis(s.cancelledAt),
    cancelledBy: s.cancelledBy || '',
    description: s.description || '',
    learningGoals: s.learningGoals || [],
    duration: s.duration || '60 Minutes',
    timeZone: s.timeZone || '',
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
      isOnline: partner.isOnline === true,
      badges: partner.achievementBadges || partner.badges || [],
      rating: partner.ratingAverage || partner.rating || 0,
      reviewsCount: partner.completedSwaps ?? 0,
      university: partner.university,
    },
    notes: (s.notes || []).map((n) => ({ ...n })),
    createdAt: millis(s.createdAt),
    completedAt: millis(s.completedAt),
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
  rating: profile?.rating ?? 0,
  completedSwaps: profile?.completedSwaps ?? 0,
  isOnline: profile?.isOnline === true,
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
  const payload = firestoreData({
    requester: safeRequester || { uid, name: 'Scholar' },
    mentor,
    ...details,
    status: 'pending',
    createdAt: Date.now(),
  });
  const docRef = await addDoc(collection(db, 'requests'), payload);
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
  meetingLink = '',
}) => {
  const sessionRef = doc(collection(db, 'sessions'));
  const sessionId = sessionRef.id;

  const requester = {
    uid: request.requester?.id,
    name: request.requester?.name || 'Scholar',
    title: request.requester?.title || 'Peer Scholar',
    avatarUrl: request.requester?.avatarUrl || DEFAULT_AVATAR,
    university: request.requester?.university || 'University',
    rating: num(request.requester?.rating),
    completedSwaps: request.requester?.completedSwaps ?? 0,
    isOnline: request.requester?.isOnline === true,
  };

  const mentor = {
    uid: currentUid,
    name: currentProfile?.name || 'Scholar',
    title: currentProfile?.title || currentProfile?.academicLevel || 'Peer Scholar',
    avatarUrl: currentProfile?.avatarUrl || DEFAULT_AVATAR,
    university: currentProfile?.university || 'University',
    rating: currentProfile?.rating ?? 0,
    completedSwaps: currentProfile?.completedSwaps ?? 0,
    isOnline: currentProfile?.isOnline === true,
    badges: (currentProfile?.expertiseAreas || []).slice(0, 2),
  };

  const duration = request.skillLevel?.includes('90')
    ? '90 Minutes'
    : request.skillLevel?.includes('45')
      ? '45 Minutes'
      : '60 Minutes';

  const timeZone = isValidTimeZone(request.timeZone)
    ? request.timeZone
    : getLocalTimeZone();
  const sessionTime = toTimeInputValue(request.preferredTimeSlot);
  const { startAt, endAt } = resolveSessionTimes({
    date: request.preferredDate || request.formattedDate,
    time: sessionTime,
    duration,
    timeZone,
  });

  const sessionData = {
    originRequestId: requestId,
    title: request.requestedSkill,
    status: 'Accepted',
    creditAmount: toCreditHours(request.creditsOffered) || null,
    settledBy: {},
    description: request.goals?.trim() || '',
    learningGoals: request.goals?.trim() ? [request.goals.trim()] : [],
    duration,
    timeZone,
    method: 'Video Call',
    platform,
    date: request.formattedDate || request.preferredDate,
    time: sessionTime,
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
  return sessionId;
};

export const declineRequest = async (requestId, reason) => {
  const cleanReason = String(reason || '').trim();
  if (!cleanReason) throw new Error('Choose a reason before declining this request.');
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'declined',
    respondedAt: Date.now(),
    declineReason: cleanReason.slice(0, 500),
  });
};

export const rescheduleRequest = async (requestId, { date, slot, note, timeZone }) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'rescheduled',
    respondedAt: Date.now(),
    rescheduledDate: date,
    rescheduledSlot: slot,
    rescheduledTimeZone: isValidTimeZone(timeZone) ? timeZone : getLocalTimeZone(),
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
export const confirmRescheduleRequest = async (requestId, newDate, newSlot, timeZone) => {
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'pending',
    preferredDate: newDate,
    formattedDate: newDate,
    preferredTimeSlot: newSlot,
    timeZone: isValidTimeZone(timeZone) ? timeZone : getLocalTimeZone(),
    rescheduledTimeZone: null,
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
// Trust and safety
// ---------------------------------------------------------------------------

export const getBlockId = (blockerUid, blockedUid) => `${blockerUid}__${blockedUid}`;

export const subscribeBlockedUsers = (blockerUid, callback, onError) => {
  if (!blockerUid) return () => {};
  const q = query(collection(db, 'blocks'), where('blockerUid', '==', blockerUid));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((entry) => entry.data().blockedUid).filter(Boolean)),
    (error) => onError?.(error)
  );
};

export const blockScholar = async (blockerUid, blockedUid) => {
  if (!blockerUid || !blockedUid || blockerUid === blockedUid) {
    throw new Error('Choose another scholar to block.');
  }
  if (auth.currentUser?.uid !== blockerUid) {
    throw new Error('Sign in again before changing your blocked scholars.');
  }
  const blockRef = doc(db, 'blocks', getBlockId(blockerUid, blockedUid));
  const existing = await getDoc(blockRef);
  if (existing.exists()) return;
  await setDoc(blockRef, { blockerUid, blockedUid, createdAt: Date.now() });
};

export const unblockScholar = async (blockerUid, blockedUid) => {
  if (!blockerUid || !blockedUid || auth.currentUser?.uid !== blockerUid) {
    throw new Error('Sign in again before changing your blocked scholars.');
  }
  await deleteDoc(doc(db, 'blocks', getBlockId(blockerUid, blockedUid)));
};

export const submitScholarReport = async ({
  reporterUid,
  reportedUid,
  category,
  details,
  source = 'profile',
  conversationId = '',
}) => {
  const allowedCategories = ['harassment', 'spam', 'impersonation', 'unsafe', 'other'];
  if (!reporterUid || !reportedUid || reporterUid === reportedUid) {
    throw new Error('This scholar cannot be reported from the current account.');
  }
  if (auth.currentUser?.uid !== reporterUid) {
    throw new Error('Sign in again before submitting a report.');
  }
  if (!allowedCategories.includes(category)) {
    throw new Error('Choose a reason for your report.');
  }
  await addDoc(collection(db, 'reports'), {
    reporterUid,
    reportedUid,
    category,
    details: String(details || '').trim().slice(0, 2000),
    source: source === 'chat' ? 'chat' : 'profile',
    conversationId: String(conversationId || '').slice(0, 200),
    status: 'open',
    createdAt: Date.now(),
  });
};

export const subscribeAdminReports = (callback, onError) => {
  const reportsQuery = query(
    collection(db, 'reports'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(
    reportsQuery,
    (snapshot) => callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))),
    (error) => onError?.(error)
  );
};

export const subscribeMyReports = (reporterUid, callback, onError) => {
  if (!reporterUid || auth.currentUser?.uid !== reporterUid) {
    onError?.(new Error('Sign in to view your reports.'));
    return () => {};
  }
  const reportsQuery = query(
    collection(db, 'reports'),
    where('reporterUid', '==', reporterUid),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  return onSnapshot(
    reportsQuery,
    (snapshot) => callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))),
    (error) => onError?.(error)
  );
};

export const updateReportReview = async (reportId, status) => {
  const allowedStatuses = ['reviewing', 'resolved', 'dismissed'];
  if (!reportId || !allowedStatuses.includes(status)) {
    throw new Error('Choose a valid report status.');
  }
  const reviewerUid = auth.currentUser?.uid;
  if (!reviewerUid) throw new Error('Sign in again before updating this report.');
  await updateDoc(doc(db, 'reports', reportId), {
    status,
    reviewedAt: Date.now(),
    reviewedBy: reviewerUid,
  });
};

// ---------------------------------------------------------------------------
// Chat / conversations
// ---------------------------------------------------------------------------

// Deterministic id for a 1:1 conversation between two users.
export const getConversationId = (uidA, uidB) => [uidA, uidB].sort().join('__');

// Get or create the conversation document between two users. Participant IDs
// are stored in deterministic order and are never rewritten after creation.
export const ensureConversation = async (uidA, uidB) => {
  if (!uidA || !uidB || uidA === uidB) {
    throw new Error('Choose another scholar to start a conversation.');
  }
  const convId = getConversationId(uidA, uidB);
  const ref = doc(db, 'conversations', convId);
  const participantIds = [uidA, uidB].sort();
  try {
    await setDoc(ref, { participantIds }, { merge: true });
    return { id: convId, participantIds };
  } catch (error) {
    // Legacy conversations may contain the correct pair in the opposite array
    // order. Rules correctly block changing that protected field; in that case
    // read and reuse the existing conversation instead.
    if (!String(error?.code || '').includes('permission-denied')) throw error;
    const existing = await getDoc(ref);
    if (!existing.exists()) throw error;
    return { id: existing.id, ...existing.data() };
  }
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
    orderBy('createdAt', 'asc'),
    limitToLast(100)
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
  const cleanText = typeof text === 'string' ? text.trim() : '';
  if (!fromUid || !toUid || fromUid === toUid) {
    throw new Error('A valid conversation participant is required.');
  }
  if (!cleanText || cleanText.length > 4000) {
    throw new Error('Messages must contain 1 to 4000 characters.');
  }
  const convId = conversationId || getConversationId(fromUid, toUid);
  const convRef = doc(db, 'conversations', convId);
  const msgRef = doc(collection(db, 'conversations', convId, 'messages'));
  const now = Date.now();
  const messageParticipantIds = participantIds || [fromUid, toUid];
  if (
    messageParticipantIds.length !== 2 ||
    !messageParticipantIds.includes(fromUid) ||
    !messageParticipantIds.includes(toUid)
  ) {
    throw new Error('The conversation participants are invalid.');
  }

  const batch = writeBatch(db);
  batch.update(convRef, {
    lastText: cleanText,
    lastFrom: fromUid,
    lastFromName: String(fromName || 'Scholar').slice(0, 100),
    lastMessageId: msgRef.id,
    updatedAt: now,
    [`unread.${toUid}`]: increment(1),
  });
  batch.set(msgRef, {
    conversationId: convId,
    participantIds: messageParticipantIds,
    fromUid,
    toUid,
    text: cleanText,
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
// Settlement runs as one Firestore transaction. Security rules validate the
// resulting profile balances, session state, and create-only ledger entries.

export const mapTransaction = (doc) => {
  const t = doc.data();
  return {
    id: doc.id,
    sessionId: t.sessionId || '',
    title: t.title || '',
    type: t.type || 'spent',
    amount: num(t.amount),
    date: t.date || formatTimeAgo(t.createdAt),
    createdAt: millis(t.createdAt),
    partner: t.partner || (t.type === 'adjustment' ? 'Administrator' : 'Peer Scholar'),
    partnerUid: t.partnerUid || '',
    reason: t.reason || '',
    balanceBefore: t.balanceBefore,
    balanceAfter: t.balanceAfter,
    adjustedBy: t.adjustedBy || '',
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

// Settle the current user's side of a session. Credits move only after both
// participants confirm completion.
export const settleSessionSide = async ({ sessionId, currentUid }) => {
  if (!sessionId || !currentUid) {
    throw new Error('Missing session or user for settlement.');
  }
  if (auth.currentUser?.uid !== currentUid) {
    throw new Error('The authenticated account does not match this session action.');
  }
  return runTransaction(db, async (transaction) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionSnapshot = await transaction.get(sessionRef);
    if (!sessionSnapshot.exists()) throw new Error('Session not found.');

    const session = sessionSnapshot.data();
    const participantIds = asArray(session.participantIds);
    if (participantIds.length !== 2 || !participantIds.includes(currentUid)) {
      throw new Error('You are not a participant in this session.');
    }
    if (session.status === 'Completed' || session.statsApplied === true) {
      return { alreadyCompleted: true, allSettled: true };
    }

    const settledBy = { ...(session.settledBy || {}) };
    const alreadyConfirmed = Boolean(settledBy[currentUid]);
    if (!alreadyConfirmed) settledBy[currentUid] = Date.now();
    const allSettled = participantIds.every((uid) => Boolean(settledBy[uid]));
    if (!allSettled) {
      if (!alreadyConfirmed) transaction.update(sessionRef, { settledBy });
      return { alreadyConfirmed, allSettled: false };
    }

    // Older/interrupted settlement attempts can leave both confirmations on
    // an Accepted session without applying credits or profile statistics. Do
    // not return early for that recoverable state: rerun the atomic finalizer.

    const requesterUid = session.requester?.uid;
    const mentorUid = session.mentor?.uid;
    if (!requesterUid || !mentorUid || requesterUid === mentorUid) {
      throw new Error('Session participants are invalid.');
    }

    const requesterRef = doc(db, 'users', requesterUid);
    const mentorRef = doc(db, 'users', mentorUid);
    const spentRef = doc(db, 'transactions', `${sessionId}__spent`);
    const earnedRef = doc(db, 'transactions', `${sessionId}__earned`);
    // Ledger reads are owner-only. Reading both predictable ledger IDs here
    // causes permission-denied for the participant who does not own each entry
    // (even when those entries do not exist yet). The rules reject duplicate
    // settlement writes atomically, so only participant profiles need reads.
    const [requesterSnapshot, mentorSnapshot] = await Promise.all([
      transaction.get(requesterRef),
      transaction.get(mentorRef),
    ]);

    if (!requesterSnapshot.exists() || !mentorSnapshot.exists()) {
      throw new Error('A participant profile is missing.');
    }
    const requester = requesterSnapshot.data();
    const mentor = mentorSnapshot.data();
    const amount = num(session.creditAmount);
    if (amount <= 0) throw new Error('The session credit amount is invalid.');
    const requesterBalance = num(requester.timeCredits);
    if (requesterBalance < amount) {
      throw new Error(`The requester needs ${amount} credits but has ${requesterBalance}.`);
    }

    const completedAt = Date.now();
    const requesterBalanceAfter = Number((requesterBalance - amount).toFixed(3));
    const mentorBalanceAfter = Number((num(mentor.timeCredits) + amount).toFixed(3));
    transaction.update(requesterRef, {
      timeCredits: requesterBalanceAfter,
      creditsSpent: num(requester.creditsSpent) + amount,
      completedSwaps: num(requester.completedSwaps) + 1,
      lastSettlementId: sessionId,
      updatedAt: completedAt,
    });
    transaction.update(mentorRef, {
      timeCredits: mentorBalanceAfter,
      creditsEarned: num(mentor.creditsEarned) + amount,
      completedSwaps: num(mentor.completedSwaps) + 1,
      lastSettlementId: sessionId,
      updatedAt: completedAt,
    });
    transaction.set(spentRef, {
      uid: requesterUid,
      sessionId,
      participantIds,
      partnerUid: mentorUid,
      partner: session.mentor?.name || 'Peer Mentor',
      title: session.title || 'Peer Mentoring Session',
      type: 'spent',
      amount: -amount,
      balanceAfter: requesterBalanceAfter,
      createdAt: completedAt,
    });
    transaction.set(earnedRef, {
      uid: mentorUid,
      sessionId,
      participantIds,
      partnerUid: requesterUid,
      partner: session.requester?.name || 'Peer Scholar',
      title: session.title || 'Peer Mentoring Session',
      type: 'earned',
      amount,
      balanceAfter: mentorBalanceAfter,
      createdAt: completedAt,
    });
    transaction.update(sessionRef, {
      settledBy,
      status: 'Completed',
      completedAt,
      statsApplied: true,
    });
    return { alreadyConfirmed, allSettled: true, paid: amount, completedAt };
  });
};

export const updateUserPresence = (uid, isOnline) => {
  if (!uid) return Promise.resolve();
  return setDoc(
    doc(db, 'users', uid),
    { isOnline: Boolean(isOnline), lastActiveAt: Date.now(), updatedAt: Date.now() },
    { merge: true }
  );
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
    createdAt: millis(r.createdAt) || Date.now(),
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
  targetUid,
  rating,
  comment,
}) => {
  if (!sessionId || !authorUid || !targetUid) {
    throw new Error('Missing review references.');
  }
  if (auth.currentUser?.uid !== authorUid) {
    throw new Error('The authenticated account does not match this review.');
  }
  const normalizedRating = Math.max(1, Math.min(5, Math.round(num(rating))));
  return runTransaction(db, async (transaction) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const reviewRef = doc(db, 'reviews', reviewDocumentId(sessionId, authorUid));
    const targetRef = doc(db, 'users', targetUid);
    const authorRef = doc(db, 'users', authorUid);
    const [sessionSnapshot, reviewSnapshot, targetSnapshot, authorSnapshot] =
      await Promise.all([
        transaction.get(sessionRef),
        transaction.get(reviewRef),
        transaction.get(targetRef),
        transaction.get(authorRef),
      ]);

    if (!sessionSnapshot.exists() || sessionSnapshot.data().status !== 'Completed') {
      throw new Error('Only completed sessions can be reviewed.');
    }
    if (reviewSnapshot.exists()) throw new Error('You already reviewed this session.');
    if (!targetSnapshot.exists()) throw new Error('Scholar profile not found.');
    const participants = asArray(sessionSnapshot.data().participantIds);
    if (!participants.includes(authorUid) || !participants.includes(targetUid)) {
      throw new Error('Both scholars must belong to this session.');
    }

    const target = targetSnapshot.data();
    const nextCount = num(target.ratingCount) + 1;
    const nextSum = num(target.ratingSum) + normalizedRating;
    const createdAt = Date.now();
    transaction.set(reviewRef, {
      sessionId,
      sessionTitle: sessionSnapshot.data().title || 'Academic Session',
      authorUid,
      authorName: authorSnapshot.data()?.name || 'Scholar',
      authorAvatar: authorSnapshot.data()?.avatarUrl || '',
      targetUid,
      rating: normalizedRating,
      comment: String(comment || '').trim().slice(0, 2000),
      createdAt,
    });
    transaction.update(targetRef, {
      ratingCount: nextCount,
      ratingSum: nextSum,
      ratingAverage: nextSum / nextCount,
      lastRatingReviewId: reviewDocumentId(sessionId, authorUid),
      updatedAt: createdAt,
    });
    return { rating: normalizedRating, ratingCount: nextCount };
  });
};

export const adjustUserCredits = async ({ targetUid, amount, reason }) => {
  const normalizedAmount = Number(amount);
  if (!targetUid || !Number.isFinite(normalizedAmount) || normalizedAmount === 0) {
    throw new Error('Provide a user and a non-zero adjustment.');
  }
  if (String(reason || '').trim().length < 5) {
    throw new Error('A clear adjustment reason is required.');
  }
  return runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', targetUid);
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists()) throw new Error('User not found.');
    const before = num(userSnapshot.data().timeCredits);
    const after = Number((before + normalizedAmount).toFixed(3));
    if (after < 0) throw new Error('The balance cannot become negative.');

    const transactionRef = doc(collection(db, 'transactions'));
    const createdAt = Date.now();
    transaction.update(userRef, { timeCredits: after, updatedAt: createdAt });
    transaction.set(transactionRef, {
      uid: targetUid,
      participantIds: [targetUid],
      type: 'adjustment',
      amount: normalizedAmount,
      reason: String(reason).trim().slice(0, 500),
      adjustedBy: auth.currentUser?.uid || '',
      balanceBefore: before,
      balanceAfter: after,
      title: 'Administrative credit adjustment',
      createdAt,
    });
    return { transactionId: transactionRef.id, balanceBefore: before, balanceAfter: after };
  });
};
