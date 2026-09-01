import React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ProfileSetupPage } from '../pages/ProfileSetupPage';
import { GetStartedPage } from '../pages/GetStartedPage';
import { DiscoverPage } from '../pages/DiscoverPage';

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
          onLoginSuccess={() => setCurrentScreen('discover')}
          onNavigateToSignUp={() => setCurrentScreen('signup')}
          onNavigateToGetStarted={() => setCurrentScreen('get-started')}
          onOpenSSO={onOpenSSO}
          onShowToast={onShowToast}
        />
      );

    case 'discover':
      return (
        <DiscoverPage
          userProfile={userProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMentorModal={onOpenMentor}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
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
