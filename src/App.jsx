import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { NotificationBell } from './component/NotificationBell';
import { ChatPanel } from './component/ChatPanel';
import { ReportScholarModal } from './component/ReportScholarModal';
import { createInitialAvatar } from './assets';
import { useFirestoreSubscriptions } from './hooks/useFirestoreSubscriptions';
import { useToast } from './hooks/useToast';
import { useChat } from './hooks/useChat';
import { useSessionHandlers } from './hooks/useSessionHandlers';
import { useRequestHandlers } from './hooks/useRequestHandlers';
import { toMentorModel } from './utils/toMentorModel';
import { openExternalUrl } from './utils/urlUtils';
import { submitScholarReport } from './services/realtime';
import { EducationalLoader } from './component/EducationalLoader';

function AppContent() {
  const {
    currentUser,
    userProfile: authProfile,
    isAdmin,
    loading,
    updateProfileData,
  } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('get-started');
  const [activeModal, setActiveModal] = useState(null);

  const isRealtime = Boolean(currentUser?.uid);
  const myUid = currentUser?.uid;

  const myProfile = authProfile || {};
  const [sessions, setSessions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [chatMessages, setChatMessages] = useState({});

  const [realtimeUsers, setRealtimeUsers] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const { toastMessage, showToast } = useToast();

  const handleImageError = useCallback((event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = 'true';
    image.removeAttribute('srcset');
    image.src = createInitialAvatar(image.alt || 'Scholar');
  }, []);

  // Live Firestore subscriptions + the initial-paint readiness gate.
  const { dataReady, dataDelayed } = useFirestoreSubscriptions({
    isRealtime,
    myUid,
    setIncomingRequests,
    setOutgoingRequests,
    setSessions,
    setRealtimeUsers,
    setConversations,
    setCreditTransactions,
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const {
    activeChat,
    blockedUserIds,
    chatPeers,
    conversationsWithPeers,
    handleOpenChat,
    handleNewChat,
    handleSendChatMessage,
    handleMarkChatRead,
    handleCloseChat,
    handleBlockScholar,
    handleUnblockScholar,
  } = useChat({
    isRealtime,
    myUid,
    myProfile,
    realtimeUsers,
    conversations,
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

  const handleRequestRealtime = useCallback((peer) => {
    const model = toMentorModel(peer);
    setSelectedMentorForRequest(model);
    setCurrentScreen('request-session');
  }, []);

  const handleSaveProfileSkills = async ({ skillsTeach, skillsWant }) => {
    const updates = {
      skillsTeach,
      skillsWant,
      expertiseAreas: skillsTeach,
      learningGoals: skillsWant,
    };
    if (!currentUser) throw new Error('Sign in to update your skill profile.');
    await updateProfileData(updates);
  };

  const isPublicAuthScreen = ['login', 'signup', 'get-started'].includes(currentScreen);
  const routedScreen = currentUser && isPublicAuthScreen ? 'dashboard' : currentScreen;

  const handleOpenMeeting = (session) => {
    // REALTIME sessions carry a real Meet/Zoom link — open it directly.
    if (isRealtime && session?.meetingLink) {
      setSelectedSessionId(session.id || null);
      if (!openExternalUrl(session.meetingLink)) {
        showToast('This meeting link is invalid. Ask the session host to update it.');
      }
      return;
    }
    setSelectedSessionId(session?.id || null);
    showToast('No meeting link has been added to this session yet.');
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

  const handleReportScholar = useCallback((scholar) => {
    if (!myUid) {
      showToast('Sign in to report a scholar.');
      return;
    }
    setReportTarget(scholar?.uid ? scholar : null);
  }, [myUid, showToast]);

  const handleSubmitReport = useCallback(async ({ category, details }) => {
    if (!myUid || !reportTarget?.uid) throw new Error('Sign in to submit this report.');
    await submitScholarReport({
      reporterUid: myUid,
      reportedUid: reportTarget.uid,
      category,
      details,
      source: reportTarget.source,
      conversationId: reportTarget.conversationId,
    });
    setReportTarget(null);
    showToast('Report submitted. Thank you for helping keep SkillSwap safe.');
  }, [myUid, reportTarget, showToast]);

  // Wait for the first Firestore snapshots so the page never paints in a
  // half-empty state on refresh.
  if (!dataReady && !loading) {
    return <EducationalLoader label="Gathering your study updates…" />;
  }

  return (
    <div
      className="min-h-screen bg-[#fff8f7] font-sans antialiased text-[#201a1b] selection:bg-[#c5b3d3] selection:text-[#22162e]"
      onError={handleImageError}
    >
      {toastMessage && (
        <div
          id="toast-notification"
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] max-w-[calc(100vw-2rem)] bg-[#352f2f]/95 text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-medium backdrop-blur-md animate-toast-in"
        >
          <span className="material-symbols-outlined text-[18px] text-[#efdbfd]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {(!isOnline || dataDelayed) && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-[115] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-[#352f2f]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
        >
          <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
            {isOnline ? 'cloud_sync' : 'cloud_off'}
          </span>
          {isOnline
            ? 'Some live data is delayed. SkillSwap will keep reconnecting.'
            : 'You are offline. Changes may not sync until your connection returns.'}
        </div>
      )}

      {/* Global message launcher */}
      {currentUser && !activeChat && (
        <div className="fixed top-[76px] right-4 z-[80]">
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
          onReport={(peer, conversationId) => handleReportScholar({ ...peer, source: 'chat', conversationId })}
          onBlock={(peerUid) => blockedUserIds.includes(peerUid) ? handleUnblockScholar(peerUid) : handleBlockScholar(peerUid)}
          isBlocked={blockedUserIds.includes(activeChat.peer?.uid)}
        />
      )}

      <AppRoutes
        currentScreen={routedScreen}
        isAdmin={isAdmin}
        setCurrentScreen={setCurrentScreen}
        userProfile={myProfile}
        onOpenMeeting={handleOpenMeeting}
        onOpenWallet={() => setActiveModal('wallet')}
        onOpenMentor={handleOpenMentor}
        onShowToast={showToast}
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
        onSaveProfileSkills={handleSaveProfileSkills}
        realtime={isRealtime}
        realtimeUsers={realtimeUsers}
        onRequestRealtime={handleRequestRealtime}
        onMessageMentor={handleMessageMentor}
        blockedUserIds={blockedUserIds}
        onBlockScholar={handleBlockScholar}
        onUnblockScholar={handleUnblockScholar}
        onReportScholar={handleReportScholar}
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

      {reportTarget && (
        <ReportScholarModal
          scholar={reportTarget}
          onSubmit={handleSubmitReport}
          onClose={() => setReportTarget(null)}
        />
      )}
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
