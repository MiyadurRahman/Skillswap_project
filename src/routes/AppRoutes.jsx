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
import { SchedulePage } from '../pages/SchedulePage';
import { LeaderboardPage } from '../pages/LeaderboardPage';

// NOTE: Pages are intentionally imported eagerly (no React.lazy / code
// splitting). Vite's code-splitting of these modules produced a circular
// shared-chunk graph that crashed Discover with a chunk-initialization TDZ
// error (blank white screen). The app is small (~380 kB gzip ~90 kB), so
// bundling everything into one chunk is deliberate and safe.

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
  onAddSessionNote,
  incomingRequests = [],
  onUpdateIncomingRequests,
  outgoingRequests = [],
  onUpdateOutgoingRequests,
  selectedMentorForRequest,
  setSelectedMentorForRequest,
  realtime = false,
  realtimeUsers = [],
  onRequestRealtime,
  onMessageMentor,
  onAcceptRequest,
  onDeclineRequest,
  onRescheduleRequest,
  onSendRequest,
  onCancelOutgoingRequest,
  onConfirmRescheduleRequest,
  onSettleSession,
}) => {
  let screen;
  switch (currentScreen) {
    case 'requests':
    case 'request-session':
      screen = (
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
          realtime={realtime}
          onAcceptRequest={onAcceptRequest}
          onDeclineRequest={onDeclineRequest}
          onRescheduleRequest={onRescheduleRequest}
          onSendRequest={onSendRequest}
          onCancelOutgoingRequest={onCancelOutgoingRequest}
          onConfirmRescheduleRequest={onConfirmRescheduleRequest}
          onMessageMentor={onMessageMentor}
        />
      );
      break;

    case 'session-details':
      screen = (
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
          onAddSessionNote={onAddSessionNote}
          realtime={realtime}
          onMessageMentor={onMessageMentor}
          onSettleSession={onSettleSession}
        />
      );
      break;

    case 'schedule':
      screen = (
        <SchedulePage
          userProfile={userProfile}
          sessions={sessions}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onSelectSession={onSelectSession}
          onUpdateSession={onUpdateSession}
          onShowToast={onShowToast}
        />
      );
      break;

    case 'leaderboard':
      screen = (
        <LeaderboardPage
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenWalletModal={onOpenWallet}
          onShowToast={onShowToast}
          onSelectPeerProfile={(peer) => setSelectedProfile(peer)}
          realtime={realtime}
          realtimeUsers={realtimeUsers}
        />
      );
      break;

    case 'public-profile':
      screen = (
        <PublicProfilePage
          userProfile={userProfile}
          profileData={selectedProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onOpenMentorModal={onOpenMentor}
          onShowToast={onShowToast}
          onCreateSession={onCreateSession}
          onMessageMentor={onMessageMentor}
        />
      );
      break;

    case 'get-started':
      screen = (
        <GetStartedPage
          onNavigateToSignUp={() => setCurrentScreen('signup')}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onExploreDemo={onExploreDemo}
          onShowToast={onShowToast}
          onOpenSSO={onOpenSSO}
          realtime={realtime}
          realtimeUsers={realtimeUsers}
        />
      );
      break;

    case 'login':
      screen = (
        <LoginPage
          onLoginSuccess={() => setCurrentScreen('dashboard')}
          onNavigateToSignUp={() => setCurrentScreen('signup')}
          onNavigateToGetStarted={() => setCurrentScreen('get-started')}
          onOpenSSO={onOpenSSO}
          onShowToast={onShowToast}
        />
      );
      break;

    case 'skill-manager':
      screen = (
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
      break;

    case 'discover':
      screen = (
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
          realtime={realtime}
          realtimeUsers={realtimeUsers}
          onRequestRealtime={onRequestRealtime}
          onMessageMentor={onMessageMentor}
        />
      );
      break;

    case 'dashboard':
      screen = (
        <DashboardPage
          userProfile={userProfile}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onOpenMentorModal={onOpenMentor}
          onShowToast={onShowToast}
          sessions={sessions}
          onSelectSession={onSelectSession}
          realtime={realtime}
          realtimeUsers={realtimeUsers}
          onRequestRealtime={onRequestRealtime}
          onMessageMentor={onMessageMentor}
        />
      );
      break;

    case 'signup':
      screen = (
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
      break;

    case 'profile-setup':
      screen = (
        <ProfileSetupPage
          userProfile={userProfile}
          onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onShowToast={onShowToast}
        />
      );
      break;

    default:
      screen = (
        <DashboardPage
          onNavigateScreen={(screen) => setCurrentScreen(screen)}
          onOpenMeetingModal={onOpenMeeting}
          onOpenWalletModal={onOpenWallet}
          onOpenMentorModal={onOpenMentor}
          onShowToast={onShowToast}
        />
      );
      break;
  }

  return <>{screen}</>;
};