import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { NotificationBell } from './component/NotificationBell';
import { ChatPanel } from './component/ChatPanel';
import { ScreenSwitcher } from './component/ScreenSwitcher';
import { academicAssets } from './assets';
import { initialSessions } from './data/sessionsData';
import { initialConversations, initialMessages, demoChatPeers } from './data/chatData';
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
  subscribeConversations,
  subscribeConversationMessages,
  ensureConversation,
  sendMessage,
  markConversationRead,
  getConversationId,
  createRequest,
  acceptRequest,
  declineRequest,
  rescheduleRequest,
  cancelOutgoingRequest,
  confirmRescheduleRequest,
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

function AppContent() {
  const { currentUser, userProfile: authProfile, signIn, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('get-started');
  const [activeModal, setActiveModal] = useState(null);

  // Production path = real Firebase Auth user; Demo path = local seed data.
  const isRealtime = Boolean(currentUser && !currentUser.isDemo && currentUser.uid);
  const myUid = currentUser?.uid;

  // Number of live subscriptions that have delivered their first snapshot —
  // the app waits for all 5 before painting, so a refresh never flashes empty.
  const [readyCount, setReadyCount] = useState(0);
  const dataReady = !isRealtime || readyCount >= 5;

  // Prevents the localStorage persist effects from writing before the hydrate
  // effect has restored the cache on mount.
  const hydratedRef = useRef(false);

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

  // Chat: conversations list, active chat (with peer), and live messages.
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
    return initialConversations;
  });
  const [chatMessages, setChatMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  // ===========================================================================
  // LIVE SUBSCRIPTIONS (realtime mode only)
  // ===========================================================================
  useEffect(() => {
    if (!isRealtime || !myUid) return;

    setReadyCount(0);
    const onFirst = () => setReadyCount((c) => c + 1);

    const unsubscribers = [
      subscribeIncomingRequests(myUid, setIncomingRequests, onFirst),
      subscribeOutgoingRequests(myUid, setOutgoingRequests, onFirst),
      subscribeSessions(myUid, setSessions, onFirst),
      subscribeAllUsers(setRealtimeUsers, onFirst),
      subscribeConversations(myUid, setConversations, onFirst),
    ];
    setSelectedSessionId(null);

    return () => unsubscribers.forEach((u) => u());
  }, [isRealtime, myUid]);

  // Safety net: never leave the UI blocked if a subscription errors out or the
  // project has no data — force the initial-paint gate open after 2.5s.
  useEffect(() => {
    if (dataReady) return;
    const t = setTimeout(() => setReadyCount((c) => (c >= 5 ? c : 5)), 2500);
    return () => clearTimeout(t);
  }, [dataReady]);

  // Live messages for the currently open chat (realtime mode only).
  useEffect(() => {
    const convId = activeChat?.conversation?.id;
    if (!isRealtime || !myUid || !convId) return;
    const unsub = subscribeConversationMessages(convId, (msgs) => {
      console.info('[chat] subscription', convId, `${msgs.length} msgs`, msgs.map((m) => `${(m.fromUid || '?').slice(0, 6)}`).join(', '));
      setChatMessages((prev) => ({ ...prev, [convId]: msgs }));
    });
    return () => unsub();
  }, [isRealtime, myUid, activeChat?.conversation?.id]);

  // When leaving realtime mode, fall back to the local demo dataset.
  useEffect(() => {
    if (isRealtime) return;
    const restore = () => {
      try {
        const sessions = JSON.parse(localStorage.getItem('skillswap_sessions'));
        setSessions(Array.isArray(sessions) ? sessions : initialSessions);
        const inc = JSON.parse(localStorage.getItem('skillswap_incoming_requests'));
        setIncomingRequests(Array.isArray(inc) ? inc : initialIncomingRequests);
        const out = JSON.parse(localStorage.getItem('skillswap_outgoing_requests'));
        setOutgoingRequests(Array.isArray(out) ? out : initialOutgoingRequests);
        const convs = JSON.parse(localStorage.getItem('skillswap_conversations'));
        setConversations(Array.isArray(convs) ? convs : initialConversations);
        setChatMessages({});
        setActiveChat(null);
        setSelectedSessionId(null);
      } catch (e) {
        setSessions(initialSessions);
        setIncomingRequests(initialIncomingRequests);
        setOutgoingRequests(initialOutgoingRequests);
        setConversations(initialConversations);
      }
    };
    restore();
  }, [isRealtime]);

  // Hydrate conversations + chat history from localStorage on mount so the UI
  // isn't blank while the Firestore subscriptions are still connecting.
  useEffect(() => {
    try {
      const conv = JSON.parse(localStorage.getItem('skillswap_conversations') || '[]');
      if (Array.isArray(conv)) setConversations(conv);
      const msgs = JSON.parse(localStorage.getItem('skillswap_chat_messages') || '{}');
      if (msgs && typeof msgs === 'object' && !Array.isArray(msgs)) setChatMessages(msgs);
    } catch (e) {
      // Fresh session — no cache to restore.
    }
    hydratedRef.current = true;
  }, []);

  // Persist demo data to localStorage only (realtime data lives in Firestore).
  useEffect(() => {
    if (isRealtime) return;
    try {
      localStorage.setItem('skillswap_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions, isRealtime]);

  // Persist conversations so the UI isn't blank while subscriptions connect.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem('skillswap_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations:', e);
    }
  }, [conversations]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem('skillswap_chat_messages', JSON.stringify(chatMessages));
    } catch (e) {
      console.warn('Failed to save chat messages:', e);
    }
  }, [chatMessages]);

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

  // Enrich conversations with the peer's live profile (avatar/name/title).
  const conversationsWithPeers = useMemo(() => {
    const userMap = {};
    realtimeUsers.forEach((u) => {
      userMap[u.uid || u.id] = u;
    });
    return conversations.map((c) => {
      const peerUid = c.participantIds?.find((id) => id !== myUid);
      const u = userMap[peerUid];
      if (u) {
        return {
          ...c,
          peer: {
            uid: peerUid,
            name: u.name,
            title: u.title,
            avatarUrl: u.avatarUrl,
          },
        };
      }
      return c;
    });
  }, [conversations, realtimeUsers, myUid]);

  // Peers selectable for a new chat.
  const chatPeers = isRealtime
    ? realtimeUsers.filter((u) => u.uid && u.uid !== myUid)
    : demoChatPeers;

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

  const handleConfirmRescheduleRequest = useCallback((requestId, newDate, newSlot) => {
    return confirmRescheduleRequest(requestId, newDate, newSlot);
  }, []);

  const handleCancelOutgoing = useCallback((requestId) => {
    return cancelOutgoingRequest(requestId);
  }, []);

  // ---------------------------------------------------------------------------
  // Chat handlers
  // ---------------------------------------------------------------------------
  const openChatSeed = useCallback(
    (convo, peer) => {
      setActiveChat({ conversation: convo, peer });
      if (!isRealtime) {
        setChatMessages((prev) => {
          const convId = convo.id;
          const seeded =
            (() => {
              try {
                return JSON.parse(localStorage.getItem('skillswap_chat_messages') || '{}')[convId];
              } catch (e) {
                return undefined;
              }
            })() || initialMessages[convId] || [];
          return { ...prev, [convId]: prev[convId] || seeded };
        });
      }
    },
    [isRealtime]
  );

  const handleOpenChat = useCallback(
    ({ conversation, peer }) => {
      openChatSeed(conversation, peer);
      if (isRealtime && (conversation.unread?.[myUid] || 0) > 0) {
        markConversationRead(conversation.id, myUid).catch((e) =>
          console.warn('Mark conversation read failed:', e)
        );
      }
    },
    [isRealtime, myUid, openChatSeed]
  );

  const handleNewChat = useCallback(
    (peer) => {
      if (!peer?.uid) return;
      const convId = getConversationId(myUid, peer.uid);
      const convo = {
        id: convId,
        participantIds: [myUid, peer.uid],
        peer: {
          uid: peer.uid,
          name: peer.name || 'Scholar',
          title: peer.title || 'Peer Scholar',
          avatarUrl: peer.avatarUrl,
        },
        unread: { [myUid]: 0, [peer.uid]: 0 },
        updatedAt: Date.now(),
      };
      openChatSeed(convo, convo.peer);
      if (isRealtime) {
        ensureConversation(myUid, peer.uid).catch((e) =>
          console.warn('Could not create conversation:', e)
        );
      }
    },
    [isRealtime, myUid, openChatSeed]
  );

  const handleSendChatMessage = useCallback(
    async (text) => {
      const chat = activeChat;
      if (!chat?.conversation?.id) return;
      const { conversation, peer } = chat;
      const convId = conversation.id;
      const peerUid =
        peer?.uid || conversation.participantIds?.find((id) => id !== myUid);
      if (!peerUid || !myUid) return;

      if (isRealtime) {
        try {
          await sendMessage({
            conversationId: convId,
            fromUid: myUid,
            toUid: peerUid,
            fromName: myProfile?.name || 'Scholar',
            text,
          });
          console.info('[chat] sent ->', { convId, fromUid: myUid, toUid: peerUid, text });
        } catch (e) {
          console.warn('[chat] send failed:', { convId, fromUid: myUid, toUid: peerUid }, e);
          showToast('Could not send message. Please try again.');
        }
        return;
      }

      const msg = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        participantIds: [myUid, peerUid],
        fromUid: myUid,
        toUid: peerUid,
        text,
        createdAt: Date.now(),
        read: false,
      };
      setChatMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), msg],
      }));
      const updatedConv = {
        ...conversation,
        lastText: text,
        lastFrom: myUid,
        lastFromName: myProfile?.name || 'You',
        updatedAt: msg.createdAt,
        unread: {
          ...(conversation.unread || {}),
          [peerUid]: (conversation.unread?.[peerUid] || 0) + 1,
        },
      };
      setConversations((prev) => [updatedConv, ...prev.filter((c) => c.id !== convId)]);
    },
    [activeChat, isRealtime, myUid, myProfile, showToast]
  );

  const handleMarkChatRead = useCallback(
    (convId, uid) => {
      if (isRealtime) {
        markConversationRead(convId, uid).catch((e) =>
          console.warn('Mark conversation read failed:', e)
        );
        return;
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, unread: { ...(c.unread || {}), [uid]: 0 } } : c
        )
      );
    },
    [isRealtime]
  );

  const handleCloseChat = useCallback(() => {
    setActiveChat(null);
    setChatMessages({});
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

  // Open a real chat with a mentor/scholar (uses the chat panel + local or
  // Firestore conversation, depending on mode).
  const handleMessageMentor = useCallback(
    (mentor) => {
      const source = mentor?.rawUser || mentor || {};
      handleNewChat({
        uid: source.uid || source.id,
        name: source.name || 'Scholar',
        title: source.title || source.field || 'Peer Scholar',
        avatarUrl: source.avatarUrl,
      });
    },
    [handleNewChat]
  );

  // "Propose swap" routes into the real request-session form prefilled with the
  // chosen scholar (same flow as Discover's "Request Session" button).
  const handleProposeSwap = useCallback(
    (mentor) => {
      setActiveModal(null);
      handleRequestRealtime(mentor?.rawUser || mentor);
    },
    [handleRequestRealtime]
  );

  // "Direct Message" from the mentor modal opens the global chat drawer.
  const handleDirectMessage = useCallback(
    (mentor) => {
      setActiveModal(null);
      handleMessageMentor(mentor);
    },
    [handleMessageMentor]
  );

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

  // Wait for the first Firestore snapshots so the page never paints in a
  // half-empty state on refresh (demo mode paints instantly).
  if (!dataReady && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
        <div className="w-8 h-8 border-4 border-[#675975] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

      {/* Global notification bell (messaging) */}
      {currentUser && !activeChat && (
        <div className="fixed top-16 right-4 z-[108]">
          <NotificationBell
            conversations={conversationsWithPeers}
            myUid={myUid}
            peers={chatPeers}
            onOpenChat={handleOpenChat}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Global chat drawer */}
      {activeChat && activeChat.conversation?.id && (
        <ChatPanel
          conversation={activeChat.conversation}
          peer={activeChat.peer}
          myUid={myUid}
          messages={chatMessages[activeChat.conversation.id] || []}
          onSend={handleSendChatMessage}
          onClose={handleCloseChat}
          onMarkRead={handleMarkChatRead}
        />
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
        onMessageMentor={handleMessageMentor}
        onAcceptRequest={handleAcceptIncoming}
        onDeclineRequest={handleDeclineIncoming}
        onRescheduleRequest={handleRescheduleIncoming}
        onSendRequest={handleSendRequest}
        onCancelOutgoingRequest={handleCancelOutgoing}
        onConfirmRescheduleRequest={handleConfirmRescheduleRequest}
      />

      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
        onProposeSwap={handleProposeSwap}
        onDirectMessage={handleDirectMessage}
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