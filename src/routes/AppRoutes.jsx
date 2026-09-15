import { lazy, Suspense } from 'react';

const loadPage = (name) =>
  lazy(() => import(`../pages/${name}.jsx`).then((mod) => ({ default: mod[name] })));

const LoginPage = loadPage('LoginPage');
const DashboardPage = loadPage('DashboardPage');
const SignUpPage = loadPage('SignUpPage');
const ProfileSetupPage = loadPage('ProfileSetupPage');
const GetStartedPage = loadPage('GetStartedPage');
const DiscoverPage = loadPage('DiscoverPage');
const SkillManagerPage = loadPage('SkillManagerPage');
const PublicProfilePage = loadPage('PublicProfilePage');
const SessionDetailsPage = loadPage('SessionDetailsPage');
const RequestsPage = loadPage('RequestsPage');
const SchedulePage = loadPage('SchedulePage');

const fallback = (
  <div className="min-h-screen flex items-center justify-center bg-[#fff8f7]">
    <div className="w-8 h-8 border-4 border-[#675975] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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

  return <Suspense fallback={fallback}>{screen}</Suspense>;
};