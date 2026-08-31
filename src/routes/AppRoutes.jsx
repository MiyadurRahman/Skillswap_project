import React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ProfileSetupPage } from '../pages/ProfileSetupPage';

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
}) => {
  switch (currentScreen) {
    case 'login':
      return (
        <LoginPage
          onLoginSuccess={() => setCurrentScreen('dashboard')}
          onNavigateToSignUp={() => setCurrentScreen('signup')}
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
