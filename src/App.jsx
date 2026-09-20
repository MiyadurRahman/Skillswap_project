import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { NotificationBell } from './component/NotificationBell';
import { ChatPanel } from './component/ChatPanel';
import { academicAssets } from './assets';
import { initialSessions } from './data/sessionsData';
import { initialConversations } from './data/chatData';
import {
  initialIncomingRequests,
  initialOutgoingRequests,
  drJulianVance,
} from './data/requestsData';
import { usePersistentState } from './hooks/usePersistentState';
import {
  useFirestoreSubscriptions,
  REQUIRED_SNAPSHOTS,
} from './hooks/useFirestoreSubscriptions';
import { useToast } from './hooks/useToast';
import { useChat } from './hooks/useChat';
import { useSessionHandlers } from './hooks/useSessionHandlers';
import { useRequestHandlers } from './hooks/useRequestHandlers';
import { toMentorModel } from './utils/toMentorModel';

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
  const [sessions, setSessions] = usePersistentState(
    'skillswap_sessions',
    initialSessions,
    !isRealtime
  );
  const [incomingRequests, setIncomingRequests] = usePersistentState(
    'skillswap_incoming_requests',
    initialIncomingRequests,
    !isRealtime
  );
  const [outgoingRequests, setOutgoingRequests] = usePersistentState(
    'skillswap_outgoing_requests',
    initialOutgoingRequests,
    !isRealtime
  );

  // Chat: conversations + message cache are persisted locally so the UI isn't
  // blank while Firestore subscriptions connect.
  const [conversations, setConversations] = usePersistentState(
    'skillswap_conversations',
    initialConversations
  );
  const [chatMessages, setChatMessages] = usePersistentState(
    'skillswap_chat_messages',
    {}
  );

  const [realtimeUsers, setRealtimeUsers] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(drJulianVance);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const { toastMessage, showToast } = useToast();

  // Live Firestore subscriptions + the initial-paint readiness gate.
  const { readyCount } = useFirestoreSubscriptions({
    isRealtime,
    myUid,
    setIncomingRequests,
    setOutgoingRequests,
    setSessions,
    setRealtimeUsers,
    setConversations,
    setCreditTransactions,
  });
  const dataReady = !isRealtime || readyCount >= REQUIRED_SNAPSHOTS;

  const {
    activeChat,
    chatPeers,
    conversationsWithPeers,
    handleOpenChat,
    handleNewChat,
    handleSendChatMessage,
    handleMarkChatRead,
    handleCloseChat,
  } = useChat({
    isRealtime,
    myUid,
    myProfile,
    realtimeUsers,
    conversations,
    setConversations,
    chatMessages,
    setChatMessages,
    showToast,
  });

  const {
    handleCreateSession,
    handleUpdateSession,
    handleSelectSession,
    handleAddSessionNote,
    handleSettleSession,
  } = useSessionHandlers({
    isRealtime,
    setSessions,
    setLocalProfile,
    setSelectedSessionId,
    setCurrentScreen,
    showToast,
    myUid,
  });

  const {
    handleSendRequest,
    handleAcceptIncoming,
    handleDeclineIncoming,
    handleRescheduleIncoming,
    handleConfirmRescheduleRequest,
    handleCancelOutgoing,
  } = useRequestHandlers({ myUid, myProfile, setSelectedSessionId });

  // When leaving realtime mode, fall back to the local demo dataset.
  useEffect(() => {
    if (isRealtime) return;
    const restore = () => {
      try {
        const cachedSessions = JSON.parse(localStorage.getItem('skillswap_sessions'));
        setSessions(Array.isArray(cachedSessions) ? cachedSessions : initialSessions);
        const cachedIncoming = JSON.parse(localStorage.getItem('skillswap_incoming_requests'));
        setIncomingRequests(Array.isArray(cachedIncoming) ? cachedIncoming : initialIncomingRequests);
        const cachedOutgoing = JSON.parse(localStorage.getItem('skillswap_outgoing_requests'));
        setOutgoingRequests(Array.isArray(cachedOutgoing) ? cachedOutgoing : initialOutgoingRequests);
        const cachedConvs = JSON.parse(localStorage.getItem('skillswap_conversations'));
        setConversations(Array.isArray(cachedConvs) ? cachedConvs : initialConversations);
        handleCloseChat();
        setSelectedSessionId(null);
      } catch (e) {
        setSessions(initialSessions);
        setIncomingRequests(initialIncomingRequests);
        setOutgoingRequests(initialOutgoingRequests);
        setConversations(initialConversations);
      }
    };
    restore();
  }, [
    isRealtime,
    setSessions,
    setIncomingRequests,
    setOutgoingRequests,
    setConversations,
    handleCloseChat,
    setSelectedSessionId,
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        onSettleSession={handleSettleSession}
      />

      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
        onProposeSwap={handleProposeSwap}
        onDirectMessage={handleDirectMessage}
        userProfile={myProfile}
        creditTransactions={creditTransactions}
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