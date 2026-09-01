import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { ScreenSwitcher } from './component/ScreenSwitcher';
import { academicAssets } from './assets';

function AppContent() {
  const { currentUser, userProfile: authProfile, signIn, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('get-started');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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
        setCurrentScreen('discover');
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
      setCurrentScreen('discover');
    } catch (err) {
      showToast('Exploring peer catalog...');
      setCurrentScreen('discover');
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
