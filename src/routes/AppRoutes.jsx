import React from 'react';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ProfileSetupPage } from '../pages/ProfileSetupPage';
import { GetStartedPage } from '../pages/GetStartedPage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { SkillManagerPage } from '../pages/SkillManagerPage';
import { PublicProfilePage } from '../pages/PublicProfilePage';
import { SessionDetailsPage } from '../pages/SessionDetailsPage';
import { RequestsPage } from '../pages/RequestsPage';

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
  selectedProfile,
  setSelectedProfile,
  sessions = [],
  selectedSession,
  setSelectedSession,
  onCreateSession,
  onUpdateSession,
  onSelectSession,
  incomingRequests = [],
  onUpdateIncomingRequests,
  outgoingRequests = [],
  onUpdateOutgoingRequests,
  selectedMentorForRequest,
  setSelectedMentorForRequest,
}) => {
  switch (currentScreen) {
    case 'requests':
    case 'request-session':
      return (
        <RequestsPage
          userProfile={userProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onShowToast={onShowToast}
          incomingRequests={incomingRequests}
          onUpdateIncomingRequests={onUpdateIncomingRequests}
          outgoingRequests={outgoingRequests}
          onUpdateOutgoingRequests={onUpdateOutgoingRequests}
          onCreateSession={onCreateSession}
          onSelectSession={onSelectSession}
          allSessions={sessions}
          onSelectPeerProfile={(peer) => setSelectedProfile(peer)}
          initialTab={currentScreen === 'request-session' ? 'request-form' : 'incoming'}
          selectedMentorForRequest={selectedMentorForRequest}
        />
      );

    case 'session-details':
      return (
        <SessionDetailsPage
          session={selectedSession}
          allSessions={sessions}
          onSelectSession={onSelectSession}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onShowToast={onShowToast}
          onSelectPeerProfile={(peer) => setSelectedProfile(peer)}
          onUpdateSession={onUpdateSession}
        />
      );

    case 'public-profile':
      return (
        <PublicProfilePage
          userProfile={userProfile}
          profileData={selectedProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onOpenMentorModal={onOpenMentor}
          onShowToast={onShowToast}
          onCreateSession={onCreateSession}
        />
      );
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

    case 'skill-manager':
      return (
        <SkillManagerPage
          userProfile={userProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMentorModal={onOpenMentor}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onShowToast={onShowToast}
          onSaveProfileSkills={({ skillsTeach, skillsWant }) => {
            setUserProfile((prev) => ({
              ...prev,
              expertiseAreas: skillsTeach,
              learningGoals: skillsWant,
            }));
          }}
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
          onSelectPeerProfile={(peer) => setSelectedProfile(peer)}
          onCreateSession={onCreateSession}
          onSelectSession={onSelectSession}
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
          sessions={sessions}
          onSelectSession={onSelectSession}
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
