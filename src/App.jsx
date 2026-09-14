import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { ScreenSwitcher } from './component/ScreenSwitcher';
import { academicAssets } from './assets';
import { initialSessions } from './data/sessionsData';
import {
  initialIncomingRequests,
  initialOutgoingRequests,
  drJulianVance,
} from './data/requestsData';
import {
  subscribeIncomingRequests,
  subscribeOutgoingRequests,
  subscribeSessions,
  subscribeAllUsers,
  createRequest,
  acceptRequest,
  declineRequest,
  rescheduleRequest,
  cancelOutgoingRequest,
  updateSession,
  addSessionNote,
  buildRequesterSnapshot,
} from './services/realtime';

// Convert a real Firestore user into the shape the request form expects.
const toMentorModel = (user) => {
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
    university: user.university,
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

function AppContent() {
  const { currentUser, userProfile: authProfile, signIn, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('get-started');
  const [activeModal, setActiveModal] = useState(null);

  // Production path = real Firebase Auth user; Demo path = local seed data.
  const isRealtime = Boolean(currentUser && !currentUser.isDemo && currentUser.uid);
  const myUid = currentUser?.uid;

  const [localProfile, setLocalProfile] = useState({
    name: 'Alex Rivera',
    email: 'scholar@university.edu',
    title: 'PhD Scholar',
    academicLevel: 'PhD Candidate',
    university: 'Stanford University',
    avatarUrl: academicAssets.avatars.alexRivera,
    timeCredits: 24.5,
    expertiseAreas: ['Applied Math', 'LaTeX', 'Python', 'Fourier Analysis'],
    learningGoals: ['Game Theory', 'R-Studio', 'CRISPR Data Analysis'],
    bio: 'Doctoral candidate focusing on high-energy mathematical physics and stochastic modeling.',
  });

  const myProfile = authProfile || localProfile;

  // Sessions + requests live in Firestore in realtime mode; otherwise they are
  // seeded/demo data persisted to localStorage.
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load sessions from storage:', e);
    }
    return initialSessions;
  });

  const [incomingRequests, setIncomingRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_incoming_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load incoming requests:', e);
    }
    return initialIncomingRequests;
  });

  const [outgoingRequests, setOutgoingRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_outgoing_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load outgoing requests:', e);
    }
    return initialOutgoingRequests;
  });

  const [realtimeUsers, setRealtimeUsers] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(drJulianVance);

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  // ===========================================================================
  // LIVE SUBSCRIPTIONS (realtime mode only)
  // ===========================================================================
  useEffect(() => {
    if (!isRealtime || !myUid) return;

    const unsubscribers = [
      subscribeIncomingRequests(myUid, setIncomingRequests),
      subscribeOutgoingRequests(myUid, setOutgoingRequests),
      subscribeSessions(myUid, setSessions),
      subscribeAllUsers(setRealtimeUsers),
    ];
    setSelectedSessionId(null);

    return () => unsubscribers.forEach((u) => u());
  }, [isRealtime, myUid]);

  // When leaving realtime mode, fall back to the local demo dataset.
  useEffect(() => {
    if (isRealtime) return;
    const restore = () => {
      try {
        setSessions(JSON.parse(localStorage.getItem('skillswap_sessions')) || initialSessions);
        setIncomingRequests(
          JSON.parse(localStorage.getItem('skillswap_incoming_requests')) || initialIncomingRequests
        );
        setOutgoingRequests(
          JSON.parse(localStorage.getItem('skillswap_outgoing_requests')) || initialOutgoingRequests
        );
        setSelectedSessionId(null);
      } catch (e) {
        setSessions(initialSessions);
        setIncomingRequests(initialIncomingRequests);
        setOutgoingRequests(initialOutgoingRequests);
      }
    };
    restore();
  }, [isRealtime]);

  // Persist demo data to localStorage only (realtime data lives in Firestore).
  useEffect(() => {
    if (isRealtime) return;
    try {
      localStorage.setItem('skillswap_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions, isRealtime]);

  useEffect(() => {
    if (isRealtime) return;
    try {
      localStorage.setItem('skillswap_incoming_requests', JSON.stringify(incomingRequests));
    } catch (e) {
      console.warn('Failed to save incoming requests:', e);
    }
  }, [incomingRequests, isRealtime]);

  useEffect(() => {
    if (isRealtime) return;
    try {
      localStorage.setItem('skillswap_outgoing_requests', JSON.stringify(outgoingRequests));
    } catch (e) {
      console.warn('Failed to save outgoing requests:', e);
    }
  }, [outgoingRequests, isRealtime]);

  // ===========================================================================
  // ACTIONS
  // ===========================================================================
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Demo-mode session creation (used by mock flows only).
  const handleCreateSession = useCallback(
    (newSession) => {
      if (isRealtime) {
        showToast('In production mode, sessions are created when a scholar accepts your request.');
        return;
      }
      const created = {
        id: `session-${Date.now()}`,
        status: 'Accepted',
        duration: '90 Minutes',
        method: 'Video Call',
        platform: 'SkillSwap Connect',
        notes: [],
        ...newSession,
      };
      setSessions((prev) => [created, ...prev]);
      setSelectedSessionId(created.id);
      setLocalProfile((prev) => ({
        ...prev,
        timeCredits: Number((prev.timeCredits + 2.5).toFixed(1)),
      }));
      setCurrentScreen('session-details');
      showToast(`✨ Session scheduled with ${created.partner?.name || 'peer'}!`);
    },
    [showToast]
  );

  const handleUpdateSession = useCallback(
    (updatedSession) => {
      if (isRealtime && updatedSession?.id) {
        updateSession(updatedSession.id, {
          status: updatedSession.status,
          date: updatedSession.date,
          time: updatedSession.time,
          title: updatedSession.title,
        }).catch((e) => console.warn('Update session failed:', e));
        return;
      }
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      );
      setSelectedSessionId(updatedSession.id);
    },
    [isRealtime]
  );

  const handleSelectSession = useCallback(
    (session) => {
      setSelectedSessionId(session?.id || null);
      setCurrentScreen('session-details');
    },
    []
  );

  const handleAddSessionNote = useCallback(
    (sessionId, note) => {
      if (!isRealtime) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, notes: [...(s.notes || []), note] } : s
          )
        );
        return Promise.resolve();
      }
      return addSessionNote(sessionId, note).catch((e) =>
        console.warn('Add note failed:', e)
      );
    },
    [isRealtime]
  );

  // ---- REALTIME: request lifecycle handlers ----
  const handleSendRequest = useCallback(
    async ({ mentor, ...details }) => {
      const requester = buildRequesterSnapshot(myUid, myProfile);
      const mentorSnapshot = {
        uid: mentor.uid || mentor.id,
        name: mentor.name,
        title: mentor.title,
        avatarUrl: mentor.avatarUrl,
        university: mentor.university,
        badge1: mentor.badge1,
        badge2: mentor.badge2,
      };
      return createRequest({ requester, mentor: mentorSnapshot, details });
    },
    [myUid, myProfile]
  );

  const handleAcceptIncoming = useCallback(
    async (request, { note, platform, meetingLink }) => {
      const fixedLink =
        meetingLink ||
        (platform === 'Zoom Meeting Room'
          ? 'https://zoom.us/j/new'
          : 'https://meet.google.com/new');
      const sessionId = await acceptRequest({
        requestId: request.id,
        request,
        currentUid: myUid,
        currentProfile: myProfile,
        note,
        platform,
        meetingLink: fixedLink,
      });
      setSelectedSessionId(sessionId);
      return sessionId;
    },
    [myUid, myProfile]
  );

  const handleDeclineIncoming = useCallback((requestId, reason) => {
    return declineRequest(requestId, reason);
  }, []);

  const handleRescheduleIncoming = useCallback((requestId, payload) => {
    return rescheduleRequest(requestId, payload);
  }, []);

  const handleCancelOutgoing = useCallback((requestId) => {
    return cancelOutgoingRequest(requestId);
  }, []);

  const handleRequestRealtime = useCallback((peer) => {
    const model = toMentorModel(peer);
    setSelectedMentorForRequest(model);
    setCurrentScreen('request-session');
  }, []);

  // Sync auth state to screen navigation on change
  useEffect(() => {
    if (currentUser) {
      if (
        currentScreen === 'login' ||
        currentScreen === 'signup' ||
        currentScreen === 'get-started'
      ) {
        setCurrentScreen('dashboard');
      }
    }
  }, [currentUser]);

  const handleOpenMeeting = (session) => {
    // REALTIME sessions carry a real Meet/Zoom link — open it directly.
    if (isRealtime && session?.meetingLink) {
      setSelectedSessionId(session.id || null);
      window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedSessionId(session?.id || null);
    setActiveModal('meeting');
  };

  const handleOpenMentor = (mentor) => {
    setSelectedMentor(mentor);
    setActiveModal('mentor');
  };

  const handleExploreDemo = async () => {
    try {
      const res = await signIn('unknown@bscse.uiu.ac.bd', 'password123');
      showToast(`Logged in as ${res.profile?.fullName || 'UIU'}!`);
      setCurrentScreen('dashboard');
    } catch (err) {
      showToast('Exploring dashboard...');
      setCurrentScreen('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] font-sans antialiased text-[#201a1b] selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-[#352f2f]/95 text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-medium backdrop-blur-md animate-bounce"
        >
          <span className="material-symbols-outlined text-[18px] text-[#efdbfd]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <AppRoutes
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userProfile={myProfile}
        setUserProfile={setLocalProfile}
        onOpenMeeting={handleOpenMeeting}
        onOpenWallet={() => setActiveModal('wallet')}
        onOpenMentor={handleOpenMentor}
        onOpenSSO={() => setActiveModal('sso')}
        onShowToast={showToast}
        onExploreDemo={handleExploreDemo}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        sessions={sessions}
        selectedSession={selectedSession}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onUpdateSession={handleUpdateSession}
        onAddSessionNote={handleAddSessionNote}
        incomingRequests={incomingRequests}
        onUpdateIncomingRequests={setIncomingRequests}
        outgoingRequests={outgoingRequests}
        onUpdateOutgoingRequests={setOutgoingRequests}
        selectedMentorForRequest={selectedMentorForRequest}
        setSelectedMentorForRequest={setSelectedMentorForRequest}
        realtime={isRealtime}
        realtimeUsers={realtimeUsers}
        onRequestRealtime={handleRequestRealtime}
        onAcceptRequest={handleAcceptIncoming}
        onDeclineRequest={handleDeclineIncoming}
        onRescheduleRequest={handleRescheduleIncoming}
        onSendRequest={handleSendRequest}
        onCancelOutgoingRequest={handleCancelOutgoing}
      />

      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}