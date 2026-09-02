import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Pages
import { GetStartedPage } from '../pages/GetStartedPage';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { ProfileSetupPage } from '../pages/ProfileSetupPage';
import { SkillManagerPage } from '../pages/SkillManagerPage';

// Components & Modals
import { Modals } from '../component/Modals';

export default function AppRoutes() {
  const { currentUser, loading, userProfile, updateProfileData, loginAsDemo } = useAuth();

  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState('get-started');

  // Handle automatic screen redirect on login/logout
  useEffect(() => {
    if (!loading) {
      if (currentUser && (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'get-started')) {
        setCurrentScreen('dashboard');
      } else if (!currentUser && (currentScreen === 'dashboard' || currentScreen === 'profile-setup' || currentScreen === 'discover' || currentScreen === 'skill-manager')) {
        setCurrentScreen('login');
      }
    }
  }, [currentUser, loading]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async () => {
    try {
      if (loginAsDemo) {
        await loginAsDemo();
        showToast('Welcome back, Unknown! (UIU Scholar Demo)');
        setCurrentScreen('dashboard');
      }
    } catch (e) {
      showToast('Demo login activated.');
      setCurrentScreen('dashboard');
    }
  };

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleOpenMeetingModal = (session) => {
    setSelectedSession(session || null);
    setActiveModal('meeting');
  };

  const handleOpenWalletModal = () => {
    setActiveModal('wallet');
  };

  const handleOpenMentorModal = (mentor) => {
    setSelectedMentor(mentor || null);
    setActiveModal('mentor');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedSession(null);
    setSelectedMentor(null);
  };

  // Screen switcher navigation
  const handleNavigateScreen = (screenName) => {
    const protectedScreens = ['dashboard', 'discover', 'profile-setup', 'skill-manager'];
    if (protectedScreens.includes(screenName) && !currentUser) {
      showToast('Please sign in to access scholar dashboard.');
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen(screenName);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'get-started':
        return (
          <GetStartedPage
            onNavigateToSignUp={() => setCurrentScreen('signup')}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onShowToast={showToast}
            onOpenSSO={() => showToast('Opening University SSO...')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={() => setCurrentScreen('dashboard')}
            onNavigateToSignUp={() => setCurrentScreen('signup')}
            onNavigateToGetStarted={() => setCurrentScreen('get-started')}
            onOpenSSO={() => showToast('Connecting to University SSO...')}
            onShowToast={showToast}
          />
        );
      case 'signup':
        return (
          <SignUpPage
            onSignUpSuccess={() => setCurrentScreen('profile-setup')}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onNavigateToGetStarted={() => setCurrentScreen('get-started')}
            onOpenSSO={() => showToast('Connecting to University SSO...')}
            onShowToast={showToast}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateScreen={handleNavigateScreen}
            onOpenMeetingModal={handleOpenMeetingModal}
            onOpenWalletModal={handleOpenWalletModal}
            onOpenMentorModal={handleOpenMentorModal}
            onShowToast={showToast}
            userProfile={userProfile}
          />
        );
      case 'discover':
        return (
          <DiscoverPage
            onNavigateScreen={handleNavigateScreen}
            onOpenMeetingModal={handleOpenMeetingModal}
            onOpenWalletModal={handleOpenWalletModal}
            onOpenMentorModal={handleOpenMentorModal}
            onShowToast={showToast}
            userProfile={userProfile}
          />
        );
      case 'profile-setup':
        return (
          <ProfileSetupPage
            userProfile={userProfile}
            onUpdateProfile={updateProfileData}
            onNavigateScreen={handleNavigateScreen}
            onShowToast={showToast}
          />
        );
      case 'skill-manager':
        return (
          <SkillManagerPage
            onNavigateScreen={handleNavigateScreen}
            onOpenMeetingModal={handleOpenMeetingModal}
            onOpenWalletModal={handleOpenWalletModal}
            onOpenMentorModal={handleOpenMentorModal}
            onShowToast={showToast}
            userProfile={userProfile}
            onSaveProfileSkills={updateProfileData}
          />
        );
      default:
        return (
          <GetStartedPage
            onNavigateToSignUp={() => setCurrentScreen('signup')}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onShowToast={showToast}
            onOpenSSO={() => showToast('Opening University SSO...')}
          />
        );
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

      {/* Main Screen Content */}
      {renderScreen()}

      {/* Interactive Modals (Live Call, Wallet, Mentor Details) */}
      <Modals
        activeModal={activeModal}
        onClose={handleCloseModal}
        selectedSession={selectedSession}
        selectedMentor={selectedMentor}
        onShowToast={showToast}
      />
    </div>
  );
}