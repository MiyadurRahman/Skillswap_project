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
  getDocs,
  getDoc,
  arrayUnion,
  increment,
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
        return {
          id: d.id,
          uid: d.id,
          name: u.name || 'Scholar',
          title: u.title || u.academicLevel || 'Peer Scholar',
          avatarUrl: u.avatarUrl || DEFAULT_AVATAR,
          university: u.university || 'University',
          isOnline: u.isOnline,
          rating: u.rating || 4.8,
          reviewsCount: u.completedSwaps ?? 0,
          skillsTeach: u.expertiseAreas || u.skillsTeach || [],
          skillsWant: u.learningGoals || u.skillsWant || [],
          bio: u.bio || 'Scholar on SkillSwap Academic.',
          timeCredits: u.timeCredits ?? 0,
          badges: (u.expertiseAreas || []).slice(0, 2),
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
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  const data = {
    participantIds: [uidA, uidB],
    lastText: '',
    lastFrom: '',
    lastFromName: '',
    unread: { [uidA]: 0, [uidB]: 0 },
    updatedAt: Date.now(),
  };
  await setDoc(ref, data);
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
export const subscribeConversationMessages = (conversationId, callback) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  let unsub = () => {};
  let retryTimer = null;
  let stopped = false;
  const listen = () => {
    unsub = onSnapshot(
      q,
      (snap) => callback(snap.docs.map(mapMessage)),
      (err) => {
        console.warn('Messages listener error:', err);
        if (!stopped) retryTimer = setTimeout(listen, 2000);
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

// Send a message, creating the conversation if needed and bumping the
// recipient's unread counter. Both writes happen in a single atomic batch, so
// a message can never be sent to a non-existent conversation.
export const sendMessage = async ({ conversationId, participantIds, fromUid, toUid, fromName, text }) => {
  const convId = conversationId || getConversationId(fromUid, toUid);
  const convRef = doc(db, 'conversations', convId);
  const msgRef = doc(collection(db, 'conversations', convId, 'messages'));
  const now = Date.now();

  const batch = writeBatch(db);
  batch.set(
    convRef,
    {
      participantIds: participantIds || [fromUid, toUid],
      lastText: text,
      lastFrom: fromUid,
      lastFromName: fromName || 'Scholar',
      updatedAt: now,
    },
    { merge: true }
  );
  batch.set(msgRef, {
    conversationId: convId,
    participantIds: participantIds || [fromUid, toUid],
    fromUid,
    toUid,
    text,
    createdAt: now,
    read: false,
  });

  // Commit the message + conversation atomically, then bump the recipient's
  // unread counter. increment() creates `unread.<toUid>` if it does not exist,
  // so a brand-new conversation gets `{ toUid: 1 }` without ever clobbering an
  // existing recipient count (which a merge-set of the whole map would do).
  await batch.commit();
  await updateDoc(convRef, {
    [`unread.${toUid}`]: increment(1),
  });
};

// Reset the current user's unread counter for a conversation.
export const markConversationRead = async (conversationId, uid) => {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unread.${uid}`]: 0,
  });
};