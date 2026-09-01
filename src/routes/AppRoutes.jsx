import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ProfileSetupPage } from '../pages/ProfileSetupPage';
import { GetStartedPage } from '../pages/GetStartedPage';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const AppRoutes = ({
  currentScreen,
  setCurrentScreen,
  userProfile,
  setUserProfile,
  onOpenMeeting,
  onOpenWallet,
  onOpenMentor,
  onOpenSSO,
  onShowToast,
  onExploreDemo,
}) => {
  const renderScreen = () => {
    switch (currentScreen) {
      case 'get-started':
        return (
          <GetStartedPage
            onNavigateToSignUp={() => setCurrentScreen('signup')}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onExploreDemo={onExploreDemo}
            onShowToast={onShowToast}
            onOpenSSO={onOpenSSO}
          />
        );

      case 'login':
        return (
          <LoginPage
            onLoginSuccess={() => setCurrentScreen('dashboard')}
            onNavigateToSignUp={() => setCurrentScreen('signup')}
            onNavigateToGetStarted={() => setCurrentScreen('get-started')}
            onOpenSSO={onOpenSSO}
            onShowToast={onShowToast}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage
            userProfile={userProfile}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onOpenMeetingModal={onOpenMeeting}
            onOpenWalletModal={onOpenWallet}
            onOpenMentorModal={onOpenMentor}
            onShowToast={onShowToast}
          />
        );

      case 'signup':
        return (
          <SignUpPage
            onSignUpSuccess={({ name, email }) => {
              setUserProfile((prev) => ({ ...prev, name, email }));
              setCurrentScreen('profile-setup');
            }}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onNavigateToGetStarted={() => setCurrentScreen('get-started')}
            onOpenSSO={onOpenSSO}
            onShowToast={onShowToast}
          />
        );

      case 'profile-setup':
        return (
          <ProfileSetupPage
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onShowToast={onShowToast}
          />
        );

      default:
        return (
          <DashboardPage
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
            onOpenMeetingModal={onOpenMeeting}
            onOpenWalletModal={onOpenWallet}
            onOpenMentorModal={onOpenMentor}
            onShowToast={onShowToast}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentScreen}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full min-h-screen flex flex-col"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
};

