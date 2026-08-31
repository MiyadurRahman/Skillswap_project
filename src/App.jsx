import React, { useState } from 'react';
import './App.css';
import { AppRoutes } from './routes/AppRoutes';
import { Modals } from './component/Modals';
import { ScreenSwitcher } from './component/ScreenSwitcher';
import { academicAssets } from './assets';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [userProfile, setUserProfile] = useState({
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
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenMeeting={handleOpenMeeting}
        onOpenWallet={() => setActiveModal('wallet')}
        onOpenMentor={handleOpenMentor}
        onOpenSSO={() => setActiveModal('sso')}
        onShowToast={showToast}
      />

      {/* Reusable Modals & Dialogs */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
      />

      {/* Persistent Screen Switcher Dock */}
      <ScreenSwitcher
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
        onOpenQuickDemo={(demoType) => {
          if (demoType === 'wallet') setActiveModal('wallet');
          if (demoType === 'meeting') {
            setSelectedSession({
              id: 'demo-meeting',
              title: 'Data Regression Analysis Workshop',
              category: 'Advanced Statistics',
              type: 'Exchange',
              mentorName: 'Dr. Elena Volkov',
              dateStr: 'Now',
              iconName: 'psychology',
              bgCategoryColor: 'bg-[#ffdada]',
              textCategoryColor: 'text-[#5c3f40]',
              status: 'live',
            });
            setActiveModal('meeting');
          }
        }}
      />
    </div>
  );
}
