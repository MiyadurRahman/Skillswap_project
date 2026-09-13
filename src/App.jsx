import React, { useState, useEffect } from 'react';
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

function AppContent() {
  const { currentUser, userProfile: authProfile, signIn, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('get-started');
  const [activeModal, setActiveModal] = useState(null);

  // Dynamic sessions management
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load sessions from storage:', e);
    }
    return initialSessions;
  });

  // Dynamic requests management
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

  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(drJulianVance);

  const [selectedSession, setSelectedSession] = useState(() => {
    return sessions[0] || initialSessions[0];
  });

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('skillswap_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions]);

  // Persist incoming and outgoing requests
  useEffect(() => {
    try {
      localStorage.setItem('skillswap_incoming_requests', JSON.stringify(incomingRequests));
    } catch (e) {
      console.warn('Failed to save incoming requests:', e);
    }
  }, [incomingRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('skillswap_outgoing_requests', JSON.stringify(outgoingRequests));
    } catch (e) {
      console.warn('Failed to save outgoing requests:', e);
    }
  }, [outgoingRequests]);

  const handleCreateSession = (newSession) => {
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
    setSelectedSession(created);
    // Award 250 credits to the mentor
    setLocalProfile((prev) => ({
      ...prev,
      timeCredits: Number((prev.timeCredits + 2.5).toFixed(1)),
    }));
    setCurrentScreen('session-details');
    showToast(`✨ Session scheduled with ${created.partner?.name || 'peer'}!`);
  };

  const handleUpdateSession = (updatedSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setSelectedSession(updatedSession);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setCurrentScreen('session-details');
  };

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

  const activeUserProfile = authProfile || localProfile;

  // Sync auth state to screen navigation on change
  useEffect(() => {
    if (currentUser) {
      if (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'get-started') {
        setCurrentScreen('dashboard');
      }
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleOpenMeeting = (session) => {
    setSelectedSession(session);
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
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-[#352f2f]/95 text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-medium backdrop-blur-md animate-bounce"
        >
          <span className="material-symbols-outlined text-[18px] text-[#efdbfd]">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Router */}
      <AppRoutes
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userProfile={activeUserProfile}
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
        setSelectedSession={setSelectedSession}
        onCreateSession={handleCreateSession}
        onUpdateSession={handleUpdateSession}
        onSelectSession={handleSelectSession}
        incomingRequests={incomingRequests}
        onUpdateIncomingRequests={setIncomingRequests}
        outgoingRequests={outgoingRequests}
        onUpdateOutgoingRequests={setOutgoingRequests}
        selectedMentorForRequest={selectedMentorForRequest}
        setSelectedMentorForRequest={setSelectedMentorForRequest}
      />

      {/* Reusable Modals & Dialogs */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
      />

      {/* Bottom Floating Navigation / Preview Switcher (Disabled) */}
      {/* 
      <ScreenSwitcher
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        onOpenQuickDemo={(type) => setActiveModal(type)}
      /> 
      */}
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
