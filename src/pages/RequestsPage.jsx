import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';
import { AcceptModal } from '../component/requests/AcceptModal';
import { DeclineModal } from '../component/requests/DeclineModal';
import { RescheduleModal } from '../component/requests/RescheduleModal';
import {
  drJulianVance,
  initialIncomingRequests,
  initialOutgoingRequests,
} from '../data/requestsData';
import { useRequestLists } from '../hooks/useRequestLists';
import { useRequestFilters } from '../hooks/useRequestFilters';
import { useAcceptFlow } from '../hooks/useAcceptFlow';
import { useDeclineFlow } from '../hooks/useDeclineFlow';
import { useRescheduleFlow } from '../hooks/useRescheduleFlow';
import { useRequestForm } from '../hooks/useRequestForm';

export const RequestsPage = ({
  userProfile: propProfile,
  onNavigateScreen,
  onOpenWalletModal,
  onShowToast,
  incomingRequests = initialIncomingRequests,
  onUpdateIncomingRequests,
  outgoingRequests = initialOutgoingRequests,
  onUpdateOutgoingRequests,
  onCreateSession,
  onSelectSession,
  allSessions = [],
  onSelectPeerProfile,
  initialTab = 'incoming',
  selectedMentorForRequest = drJulianVance,
  realtime = false,
  onAcceptRequest,
  onDeclineRequest,
  onRescheduleRequest,
  onSendRequest,
  onCancelOutgoingRequest,
  onConfirmRescheduleRequest,
  onMessageMentor,
}) => {
  const { userProfile: authProfile } = useAuth();
  const userProfile = authProfile || propProfile || {};
  const userAvatar =
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

  // Active top tab: 'incoming' | 'outgoing' | 'request-form'
  const [activeTab, setActiveTab] = useState(initialTab);

  const { incomingList, outgoingList, updateIncoming, updateOutgoing } = useRequestLists({
    realtime,
    incomingRequests,
    onUpdateIncomingRequests,
    outgoingRequests,
    onUpdateOutgoingRequests,
  });

  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pendingCount,
    filteredIncoming,
  } = useRequestFilters(incomingList);

  const {
    acceptingReq,
    setAcceptingReq,
    acceptNote,
    setAcceptNote,
    acceptPlatform,
    setAcceptPlatform,
    acceptMeetingLink,
    setAcceptMeetingLink,
    handleOpenAcceptModal,
    handleConfirmAccept,
  } = useAcceptFlow({
    realtime,
    incomingList,
    updateIncoming,
    onAcceptRequest,
    onCreateSession,
    onSelectSession,
    userProfile,
    userAvatar,
    onShowToast,
  });

  const {
    decliningReq,
    setDecliningReq,
    declineReason,
    setDeclineReason,
    customDeclineNote,
    setCustomDeclineNote,
    handleOpenDeclineModal,
    handleConfirmDecline,
  } = useDeclineFlow({
    realtime,
    incomingList,
    updateIncoming,
    onDeclineRequest,
    onShowToast,
  });

  const {
    reschedulingReq,
    setReschedulingReq,
    newProposedDate,
    setNewProposedDate,
    newProposedSlot,
    setNewProposedSlot,
    rescheduleNote,
    setRescheduleNote,
    handleOpenRescheduleModal,
    handleConfirmReschedule,
    handleConfirmRescheduleResponse,
    handleDeclineReschedule,
  } = useRescheduleFlow({
    realtime,
    incomingList,
    updateIncoming,
    outgoingList,
    updateOutgoing,
    onRescheduleRequest,
    onConfirmRescheduleRequest,
    onCancelOutgoingRequest,
    onShowToast,
  });

  const {
    currentMentor,
    selectedSkillId,
    setSelectedSkillId,
    preferredDate,
    minPreferredDate,
    setPreferredDate,
    preferredTimeSlot,
    setPreferredTimeSlot,
    sessionGoals,
    setSessionGoals,
    isSubmittingRequest,
    handleSendLearningRequest,
  } = useRequestForm({
    realtime,
    selectedMentorForRequest,
    fallbackMentor: drJulianVance,
    onSendRequest,
    onShowToast,
    setActiveTab,
    updateOutgoing,
    outgoingList,
    userProfile,
  });

  // Handler: Open the real chat drawer with a scholar/requester/mentor.
  const openRealChat = (person) => {
    if (!person) return;
    if (onMessageMentor) {
      onMessageMentor({
        uid: person.uid || person.id,
        name: person.name || 'Scholar',
        title: person.title || person.badge1 || 'Peer Scholar',
        avatarUrl: person.avatarUrl,
      });
    } else {
      onShowToast(`Opening chat with ${person.name || 'Scholar'}...`);
    }
  };

  return (
    <div id="screen-requests" className="min-h-screen bg-[#fff8f7] text-[#201a1b] font-sans antialiased flex flex-col justify-between">
      {/* 1. TOP NAVBAR (Matching the Screenshot) */}
      <header className="sticky top-0 w-full h-[68px] bg-[#3e313f] shadow-md z-50">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1360px] mx-auto h-full">
          {/* Brand & Links */}
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#3e313f"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Discover', icon: 'explore', onClick: () => onNavigateScreen('discover') },
                { label: 'Requests', icon: 'inbox', active: true, badge: pendingCount > 0, onClick: () => setActiveTab('incoming') },
                { label: 'My Sessions', icon: 'calendar_today', onClick: () => onNavigateScreen('session-details') },
              ]}
            />
            <span
              onClick={() => onNavigateScreen('discover')}
              className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
            >
              SkillSwap
            </span>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-link-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-link-discover"
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className="text-white font-bold border-b-2 border-white pb-0.5 py-1 flex items-center gap-1.5"
                id="nav-link-requests"
              >
                <span>Requests</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#f0b2aa]"></span>
                )}
              </button>
              <button
                onClick={() => onNavigateScreen('session-details')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-link-sessions"
              >
                My Sessions
              </button>
            </nav>
          </div>

          {/* Right Icons: Notifications, Wallet, Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast(`You have ${pendingCount} incoming peer requests waiting for review`)}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => {
                if (onOpenWalletModal) onOpenWalletModal();
                else onShowToast('Academic Credit Ledger: 24.5 Available Credits');
              }}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Credit Ledger & Wallet"
            >
              <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
            </button>

            {/* User Profile Avatar with Online Dot */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="Profile Settings"
            >
              <div className="relative w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors">
                <img
                  src={userAvatar}
                  alt={userProfile?.name || 'Scholar Profile'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#3e313f]"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUBHEADER: TAB SWITCHER & QUICK STATS */}
      <div className="bg-[#fbf4f2] border-b border-[#eddcd8] px-4 sm:px-8 py-3.5">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Segmented Switcher */}
          <div className="flex items-center gap-1 bg-[#eeddf2]/60 p-1 rounded-2xl border border-[#ebd8d4] overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'incoming'
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'text-[#58465b] hover:bg-[#ebdceb]'
              }`}
              id="tab-incoming-requests"
            >
              <span className="material-symbols-outlined text-[16px]">inbox</span>
              <span>Incoming Requests</span>
              {pendingCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === 'incoming'
                      ? 'bg-[#ebdceb] text-[#3e313f]'
                      : 'bg-[#524156] text-white'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'outgoing'
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'text-[#58465b] hover:bg-[#ebdceb]'
              }`}
              id="tab-outgoing-requests"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Outgoing Requests</span>
              <span className="text-[10px] bg-white/70 text-[#58465b] px-1.5 py-0.2 rounded-full font-semibold">
                {outgoingList.length}
              </span>
            </button>
          </div>

          {/* Quick Context Prompt */}
          <div className="text-xs text-[#705e69] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Peer Mentoring Active</span>
            </span>
            <span>•</span>
            <span>All exchanges verified by Academic Escrow</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-7">
        {/* =========================================================================
            TAB 1: INCOMING REQUESTS (Where other scholars requested sessions from you)
            ========================================================================= */}
        {activeTab === 'incoming' && (
          <div className="space-y-6">
            {/* Header & Professional Performance KPI Row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#ebdcd8] pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-[#201a1b]">
                    Incoming Session Inquiries
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fcece9] text-[#703d40] text-xs font-bold border border-[#ebd4cf]">
                    {pendingCount} Pending Response
                  </span>
                </div>
                <p className="text-xs text-[#705e69] mt-1 max-w-xl">
                  Students and peer researchers who have requested your academic mentorship. Review their research goals, verify availability, and accept or reschedule.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onNavigateScreen('discover')}
                  className="px-4 py-2.5 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                  <span>Discover Mentors</span>
                </button>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[#705e69] text-xs font-medium">
                  <span>Pending Inquiries</span>
                  <span className="material-symbols-outlined text-[18px] text-[#8e6178]">
                    pending_actions
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#201a1b] mt-1.5">{pendingCount}</div>
                <span className="text-[11px] text-[#705e69]">Require reply within 24h</span>
              </div>

              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[#705e69] text-xs font-medium">
                  <span>Mentor Acceptance Rate</span>
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    verified
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-700 mt-1.5">94%</div>
                <span className="text-[11px] text-emerald-700 font-semibold">Top 5% University Response</span>
              </div>

              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[#705e69] text-xs font-medium">
                  <span>Pending Escrow Credits</span>
                  <span className="material-symbols-outlined text-[18px] text-[#7b548b]">
                    account_balance_wallet
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#201a1b] mt-1.5">700</div>
                <span className="text-[11px] text-[#705e69]">Credits released on completion</span>
              </div>

              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[#705e69] text-xs font-medium">
                  <span>Avg. Response Time</span>
                  <span className="material-symbols-outlined text-[18px] text-blue-600">
                    avg_pace
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#201a1b] mt-1.5">1.5 hrs</div>
                <span className="text-[11px] text-blue-600 font-semibold">Fast Responder Status</span>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#ebdcd8] shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: `All Requests (${incomingList.length})` },
                  { id: 'pending', label: `Needs Review (${pendingCount})` },
                  {
                    id: 'accepted',
                    label: `Accepted (${incomingList.filter((r) => r.status === 'accepted').length})`,
                  },
                  {
                    id: 'declined',
                    label: `Declined (${incomingList.filter((r) => r.status === 'declined').length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === tab.id
                        ? 'bg-[#473b4b] text-white'
                        : 'bg-[#f8f1f0] text-[#705e69] hover:bg-[#ede0de]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#917d8a]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by scholar or skill..."
                  className="w-full bg-[#fbf4f2] border border-[#ebdcd8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#201a1b] focus:outline-none focus:border-[#473b4b]"
                />
              </div>
            </div>

            {/* Inquiries Cards List */}
            {filteredIncoming.length === 0 ? (
              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#9b8895]">
                  inbox
                </span>
                <h3 className="font-bold text-base text-[#201a1b]">No incoming requests found</h3>
                <p className="text-xs text-[#705e69] max-w-sm mx-auto">
                  {statusFilter === 'pending'
                    ? "You've reviewed all incoming session inquiries! Great job keeping response times fast."
                    : 'No session requests match your current filters.'}
                </p>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="px-4 py-2 bg-[#eeddf2] text-[#473b4b] rounded-xl text-xs font-bold hover:bg-[#e2c7e8]"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIncoming.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-[#ebdcd8] rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    id={`card-req-${req.id}`}
                  >
                    {/* Top Row: Requester Info, Urgency Badge, & Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f4e8e5] pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={req.requester.avatarUrl}
                            alt={req.requester.name}
                            referrerPolicy="no-referrer"
                            className="w-13 h-13 rounded-full object-cover border-2 border-[#ebd8d4]"
                          />
                          {req.requester.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#201a1b]">
                              {req.requester.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-[#6e586a] bg-[#f8eef7] px-2 py-0.5 rounded-full border border-[#edd5eb]">
                              ★ {req.requester.rating} • {req.requester.completedSwaps} swaps
                            </span>
                          </div>
                          <p className="text-xs text-[#705e69]">
                            {req.requester.title} •{' '}
                            <span className="font-semibold text-[#544256]">
                              {req.requester.university}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Status / Urgency */}
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-[#fdeeee] text-[#913b41] text-xs font-bold flex items-center gap-1 border border-[#f5c6c6]">
                            <span className="material-symbols-outlined text-[14px]">
                              alarm
                            </span>
                            <span>{req.urgency}</span>
                          </span>
                        )}
                        {req.status === 'accepted' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">
                              check_circle
                            </span>
                            <span>Accepted & Scheduled</span>
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="px-3 py-1 rounded-full bg-[#f5f1f1] text-[#786b72] text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              cancel
                            </span>
                            <span>Declined</span>
                          </span>
                        )}
                        {req.status === 'rescheduled' && (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold flex items-center gap-1 border border-blue-200">
                            <span className="material-symbols-outlined text-[14px]">
                              update
                            </span>
                            <span>Alternate Slot Proposed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: Exchange Specifics & Timing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-[#fbf6f5] rounded-xl p-3.5 border border-[#eddcd8]">
                      {/* What they want to learn */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Topic Requested:
                        </span>
                        <div className="font-bold text-xs text-[#201a1b]">
                          {req.requestedSkill}
                        </div>
                        <span className="text-[11px] text-[#705e69]">
                          {req.skillLevel}
                        </span>
                      </div>

                      {/* What they offer */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Compensation / Swap:
                        </span>
                        <div className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            payments
                          </span>
                          <span>{req.offeredExchange}</span>
                        </div>
                        <span className="text-[11px] text-[#705e69]">
                          Skill offer: {req.offeredSkill}
                        </span>
                      </div>

                      {/* Preferred schedule */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Proposed Time:
                        </span>
                        <div className="font-bold text-xs text-[#201a1b] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            calendar_month
                          </span>
                          <span>{req.formattedDate || req.preferredDate}</span>
                        </div>
                        <span className="text-[11px] text-[#705e69]">
                          {req.preferredTimeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Requester's Research Problem Statement / Context */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#473b4b]">
                        <span className="material-symbols-outlined text-[16px]">
                          chat_bubble
                        </span>
                        <span>Student's Goals & Context:</span>
                      </div>
                      <p className="text-xs text-[#3a2d3b] bg-white border border-[#f0e3e0] rounded-xl p-3 italic leading-relaxed">
                        "{req.goals}"
                      </p>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (onSelectPeerProfile) {
                              onSelectPeerProfile({
                                id: req.requester.id,
                                name: req.requester.name,
                                title: req.requester.title,
                                avatarUrl: req.requester.avatarUrl,
                                academicLevel: 'Postgraduate Scholar',
                                rating: req.requester.rating,
                                reviewsCount: req.requester.completedSwaps,
                                isOnline: req.requester.isOnline,
                                institution: req.requester.university,
                                bio: `Scholar at ${req.requester.university} specializing in ${req.offeredSkill}.`,
                                skillsTeach: [req.offeredSkill],
                                skillsWant: [req.requestedSkill],
                              });
                              onNavigateScreen('public-profile');
                            }
                          }}
                          className="text-xs font-semibold text-[#57445f] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Scholar Credentials</span>
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </button>

                        <button
                          onClick={() => openRealChat(req.requester)}
                          className="text-xs font-semibold text-[#705e69] hover:text-[#201a1b] flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">mail</span>
                          <span>Message Student</span>
                        </button>
                      </div>

                      {/* Main Decision Buttons */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDeclineModal(req)}
                            className="px-3.5 py-2 text-xs font-bold text-[#833a41] hover:bg-[#fdeeee] rounded-xl border border-[#f5c6c6] transition-colors cursor-pointer"
                          >
                            Decline
                          </button>

                          <button
                            onClick={() => handleOpenRescheduleModal(req)}
                            className="px-3.5 py-2 text-xs font-bold text-[#57445f] bg-[#f2e7f4] hover:bg-[#e7d8ea] rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              event_repeat
                            </span>
                            <span>Propose Alternate</span>
                          </button>

                          <button
                            onClick={() => handleOpenAcceptModal(req)}
                            className="px-5 py-2 text-xs font-bold text-white bg-[#473b4b] hover:bg-[#342738] rounded-xl shadow-xs transition-transform active:scale-98 cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              check
                            </span>
                            <span>Accept Session (+{req.creditsOffered} Credits)</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'accepted' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // If there is an existing matching session, select it
                              const matchingSession = allSessions.find(
                                (s) =>
                                  s.id === req.linkedSessionId ||
                                  s.originRequestId === req.id ||
                                  s.partner?.id === req.requester.id
                              );
                              if (matchingSession && onSelectSession) {
                                onSelectSession(matchingSession);
                              }
                              onNavigateScreen('session-details');
                            }}
                            className="px-4 py-2 text-xs font-bold text-[#473b4b] bg-[#eeddf2] hover:bg-[#e2c7e8] rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              video_camera_front
                            </span>
                            <span>Open Session Materials</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'rescheduled' && (
                        <div className="text-xs text-blue-800 font-medium">
                          Pending student response to: {req.rescheduledDate} ({req.rescheduledSlot})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: OUTGOING REQUESTS (Sessions you requested from other mentors/peers)
            ========================================================================= */}
        {activeTab === 'outgoing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ebdcd8] pb-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#201a1b]">
                  Outgoing Learning Requests
                </h1>
                <p className="text-xs text-[#705e69] mt-1">
                  Learning requests you have dispatched to verified mentors and senior researchers.
                </p>
              </div>

              <button
                onClick={() => onNavigateScreen('discover')}
                className="px-4 py-2.5 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>Discover Mentors</span>
              </button>
            </div>

            {outgoingList.length === 0 ? (
              <div className="bg-white border border-[#ebdcd8] rounded-2xl p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#9b8895]">
                  send_time_extension
                </span>
                <h3 className="font-bold text-base text-[#201a1b]">No outgoing requests</h3>
                <p className="text-xs text-[#705e69] max-w-sm mx-auto">
                  You haven't requested any mentorship sessions yet. Select a scholar to start your exchange!
                </p>
                <button
                  onClick={() => onNavigateScreen('discover')}
                  className="px-4 py-2 bg-[#473b4b] text-white rounded-xl text-xs font-bold hover:bg-[#342738] cursor-pointer"
                >
                  Discover Mentors
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoingList.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-[#ebdcd8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f4e8e5] pb-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={req.mentor.avatarUrl}
                          alt={req.mentor.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-full object-cover border-2 border-[#ebd8d4]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#201a1b]">
                              {req.mentor.name}
                            </h3>
                            <span className="text-[11px] font-semibold text-[#6e586a] bg-[#f8eef7] px-2 py-0.5 rounded-full border border-[#edd5eb]">
                              {req.mentor.badge1 || 'Verified Scholar'}
                            </span>
                          </div>
                          <p className="text-xs text-[#705e69]">{req.mentor.title}</p>
                        </div>
                      </div>

                      <div>
                        {req.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              hourglass_empty
                            </span>
                            <span>Awaiting Mentor Confirmation</span>
                          </span>
                        )}
                        {req.status === 'accepted' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              event_available
                            </span>
                            <span>Confirmed Session</span>
                          </span>
                        )}
                        {req.status === 'declined' && (
                          <span className="px-3 py-1 rounded-full bg-[#fdeeee] text-[#8c464e] text-xs font-bold border border-[#f0c8c8] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            <span>Declined</span>
                          </span>
                        )}
                        {req.status === 'rescheduled' && (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">update</span>
                            <span>New Time Proposed</span>
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="px-3 py-1 rounded-full bg-[#f5f1f1] text-[#786b72] text-xs font-bold border border-[#e7dddd] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            <span>Cancelled</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-[#fbf6f5] rounded-xl p-3.5 border border-[#eddcd8] text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Requested Skill:
                        </span>
                        <div className="font-bold text-[#201a1b] mt-0.5">{req.requestedSkill}</div>
                        <span className="text-[11px] text-[#705e69]">{req.skillLevel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Date & Timing:
                        </span>
                        <div className="font-bold text-[#201a1b] mt-0.5">{req.preferredDate}</div>
                        <span className="text-[11px] text-[#705e69]">{req.preferredTimeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e6178]">
                          Escrow Locked:
                        </span>
                        <div className="font-bold text-[#201a1b] mt-0.5">
                          {req.cost} Academic Credits
                        </div>
                        <span className="text-[11px] text-[#705e69]">Refundable if declined</span>
                      </div>
                    </div>

                    {req.status === 'rescheduled' && req.rescheduledDate && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50 rounded-xl p-3.5 border border-blue-200">
                        <div className="text-xs text-blue-800 font-medium">
                          <span className="block font-bold uppercase tracking-wider text-blue-700 text-[10px] mb-0.5">
                            Mentor Proposed Alternate Time
                          </span>
                          {req.rescheduledDate} ({req.rescheduledSlot || 'Flexible'})
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmRescheduleResponse(req)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                          >
                            Confirm New Time
                          </button>
                          <button
                            onClick={() => handleDeclineReschedule(req)}
                            className="px-3.5 py-1.5 bg-transparent hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-300 transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'declined' && req.declineReason && (
                      <div className="text-xs text-[#8c464e] bg-[#fdeeee] border border-[#f0c8c8] rounded-xl p-3.5">
                        <span className="font-bold">Reason:</span> {req.declineReason}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-[#705e69] italic flex-1 min-w-0">
                        "{req.goals}"
                      </p>
                      <button
                        onClick={() => openRealChat(req.mentor)}
                        className="text-xs font-semibold text-[#57445f] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                        <span>Message Mentor</span>
                      </button>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (realtime) {
                              onCancelOutgoingRequest(req.id)
                                .then(() =>
                                  onShowToast('Request withdrawn. Credits returned to your ledger.')
                                )
                                .catch((err) => {
                                  console.warn('Cancel request failed:', err);
                                  onShowToast('Could not withdraw request. Please try again.');
                                });
                            } else {
                              onShowToast('Withdrawing request and returning credits to ledger.');
                              updateOutgoing(outgoingList.filter((r) => r.id !== req.id));
                            }
                          }}
                          className="text-xs font-semibold text-[#8c464e] hover:underline shrink-0"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: THE "REQUEST A LEARNING SESSION" FORM (EXACT MATCH TO SCREENSHOT)
            ========================================================================= */}
        {activeTab === 'request-form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Scholar Preview & Booking Policy (~4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Scholar Preview Card */}
              <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 text-center shadow-2xs space-y-5">
                {/* Circular Avatar with Online Dot */}
                <div className="relative inline-block mx-auto">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#eddcd8] mx-auto shadow-xs">
                    <img
                      src={currentMentor.avatarUrl}
                      alt={currentMentor.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {currentMentor.isOnline && (
                    <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
                  )}
                </div>

                {/* Name & Academic Credentials */}
                <div>
                  <h2 className="text-xl font-bold text-[#201a1b] tracking-tight">
                    {currentMentor.name}
                  </h2>
                  <p className="text-xs text-[#705e69] mt-1 font-medium">
                    {currentMentor.title}
                  </p>
                </div>

                {/* Badges Stack */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-center gap-2 bg-[#f5eeec] text-[#4a3b48] py-2.5 px-4 rounded-xl text-xs font-semibold border border-[#eddcd8]/60">
                    <span className="material-symbols-outlined text-[18px] text-[#524156]">
                      workspace_premium
                    </span>
                    <span>{currentMentor.badge1 || 'Top 1% Mentor 2023'}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-[#f5eeec] text-[#4a3b48] py-2.5 px-4 rounded-xl text-xs font-semibold border border-[#eddcd8]/60">
                    <span className="material-symbols-outlined text-[18px] text-[#524156]">
                      history
                    </span>
                    <span>{currentMentor.badge2 || '450+ Sessions Completed'}</span>
                  </div>
                </div>

                {/* Reach out before you book */}
                <button
                  onClick={() => openRealChat(currentMentor)}
                  className="w-full py-2.5 bg-[#eeddf2] hover:bg-[#e2c7e8] text-[#473b4b] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                  <span>
                    Message{' '}
                    {currentMentor.name
                      .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/, '')
                      .split(' ')[0] || currentMentor.name}
                  </span>
                </button>
              </div>

              {/* Booking Policy Card (Blush Background matching Screenshot) */}
              <div className="bg-[#f9ece8] border border-[#edd8d4] rounded-2xl p-6 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2 text-[#473645] font-bold text-sm">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  <span>Booking Policy</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#52444b] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#8c6773] mt-0.5">•</span>
                    <span>Requests are usually confirmed within 12 hours.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8c6773] mt-0.5">•</span>
                    <span>Rescheduling is free up to 24 hours before the session.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8c6773] mt-0.5">•</span>
                    <span>Credits transfer only after the session is completed and settled.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: "Request a Learning Session" Main Form (~8 cols) */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-9 shadow-2xs space-y-7">
                {/* Form Title & Subtitle */}
                <div className="border-b border-[#f4e8e5] pb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#201a1b]">
                    Request a Learning Session
                  </h1>
                  <p className="text-sm text-[#705e69] mt-1.5">
                    Specify your learning objectives and preferred timing for {currentMentor.name}.
                  </p>
                </div>

                <form onSubmit={handleSendLearningRequest} className="space-y-7">
                  {/* Section 1: Which skill would you like to master? */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#201a1b]">
                      <span className="material-symbols-outlined text-[20px] text-[#524156]">
                        school
                      </span>
                      <span>Which skill would you like to master?</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {currentMentor.skills.map((skill) => {
                        const isSelected = selectedSkillId === skill.id;
                        return (
                          <div
                            key={skill.id}
                            onClick={() => setSelectedSkillId(skill.id)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-[#524156] bg-[#faf6fa] shadow-2xs'
                                : 'border-[#ebdcd8] bg-white hover:border-[#cfbdc9]'
                            }`}
                            id={`skill-choice-${skill.id}`}
                          >
                            <div>
                              <h4 className="font-bold text-sm text-[#201a1b]">
                                {skill.name}
                              </h4>
                              <p className="text-xs text-[#705e69] mt-0.5">
                                {skill.level}
                              </p>
                            </div>

                            <span
                              className={`material-symbols-outlined text-[22px] ${
                                isSelected ? 'text-[#524156]' : 'text-[#cfbdc9]'
                              }`}
                            >
                              {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Preferred Date & Time Slot Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Preferred Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#201a1b]">
                        <span className="material-symbols-outlined text-[19px] text-[#524156]">
                          calendar_today
                        </span>
                        <span>Preferred Date</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={preferredDate}
                          min={minPreferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full bg-white border border-[#ebdcd8] rounded-xl px-4 py-3 text-sm text-[#201a1b] focus:outline-none focus:border-[#524156] shadow-2xs"
                          required
                          id="input-preferred-date"
                        />
                      </div>
                    </div>

                    {/* Preferred Time Slot */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#201a1b]">
                        <span className="material-symbols-outlined text-[19px] text-[#524156]">
                          schedule
                        </span>
                        <span>Preferred Time Slot</span>
                      </label>
                      <div className="relative">
                        <select
                          value={preferredTimeSlot}
                          onChange={(e) => setPreferredTimeSlot(e.target.value)}
                          className="w-full bg-white border border-[#ebdcd8] rounded-xl px-4 py-3 text-sm text-[#201a1b] focus:outline-none focus:border-[#524156] shadow-2xs appearance-none cursor-pointer pr-10"
                          id="select-preferred-time-slot"
                        >
                          <option value="Morning (09:00 - 12:00)">
                            Morning (09:00 - 12:00)
                          </option>
                          <option value="Afternoon (13:00 - 16:00)">
                            Afternoon (13:00 - 16:00)
                          </option>
                          <option value="Evening (17:00 - 20:00)">
                            Evening (17:00 - 20:00)
                          </option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#705e69] pointer-events-none text-[20px]">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Session Goals & Context */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#201a1b]">
                      <span className="material-symbols-outlined text-[19px] text-[#524156]">
                        chat
                      </span>
                      <span>Session Goals & Context</span>
                    </label>
                    <textarea
                      rows={4}
                      value={sessionGoals}
                      onChange={(e) => setSessionGoals(e.target.value)}
                      placeholder="Briefly describe what you're working on or specific questions you have..."
                      className="w-full bg-white border border-[#ebdcd8] rounded-xl p-4 text-sm text-[#201a1b] placeholder:text-[#9e8c97] focus:outline-none focus:border-[#524156] shadow-2xs resize-y"
                      id="textarea-session-goals"
                    />
                  </div>

                  {/* Footer Bar: Cost, Cancel, and Send Request Button */}
                  <div className="pt-5 border-t border-[#f4e8e5] flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Cost */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#201a1b]">
                      <span className="material-symbols-outlined text-[20px] text-[#524156]">
                        payments
                      </span>
                      <span>Cost: {currentMentor.cost || 250} Academic Credits</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onShowToast('Request canceled.');
                          setActiveTab('incoming');
                        }}
                        className="text-sm font-semibold text-[#524156] hover:text-[#201a1b] px-4 py-2 cursor-pointer transition-colors"
                        id="btn-cancel-request"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => openRealChat(currentMentor)}
                        className="text-sm font-semibold text-[#524156] hover:text-[#201a1b] px-4 py-2 cursor-pointer transition-colors flex items-center gap-1.5"
                        id="btn-message-current-mentor"
                      >
                        <span className="material-symbols-outlined text-[17px]">chat_bubble</span>
                        <span>Message</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingRequest}
                        className="px-7 py-3 bg-[#524156] hover:bg-[#3d2e41] text-white rounded-full font-bold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                        id="btn-send-learning-request"
                      >
                        <span>{isSubmittingRequest ? 'Sending...' : 'Send Request'}</span>
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS FOR INCOMING ACTIONS (Accept, Decline, Reschedule, Message) */}

      {acceptingReq && (
        <AcceptModal
          request={acceptingReq}
          note={acceptNote}
          onNoteChange={setAcceptNote}
          platform={acceptPlatform}
          onPlatformChange={setAcceptPlatform}
          meetingLink={acceptMeetingLink}
          onMeetingLinkChange={setAcceptMeetingLink}
          onCancel={() => setAcceptingReq(null)}
          onConfirm={handleConfirmAccept}
        />
      )}

      {decliningReq && (
        <DeclineModal
          request={decliningReq}
          reason={declineReason}
          onReasonChange={setDeclineReason}
          customNote={customDeclineNote}
          onCustomNoteChange={setCustomDeclineNote}
          onCancel={() => setDecliningReq(null)}
          onConfirm={handleConfirmDecline}
        />
      )}

      {reschedulingReq && (
        <RescheduleModal
          request={reschedulingReq}
          date={newProposedDate}
          onDateChange={setNewProposedDate}
          slot={newProposedSlot}
          onSlotChange={setNewProposedSlot}
          note={rescheduleNote}
          onNoteChange={setRescheduleNote}
          onCancel={() => setReschedulingReq(null)}
          onConfirm={handleConfirmReschedule}
        />
      )}

      {/* 5. FOOTER (Matching the Screenshot Exactly) */}
      <footer className="mt-16 bg-[#f7edea] border-t border-[#eddcd8] py-8 text-xs text-[#705e69]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-[#201a1b] mb-1">SkillSwap</div>
            <p>© {new Date().getFullYear()} SkillSwap Academic. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => onShowToast('Academic Privacy Policy')}
              className="hover:text-[#201a1b] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('Terms of Service & Code of Conduct')}
              className="hover:text-[#201a1b] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('University Partners: Stanford, MIT, Harvard, Cambridge')}
              className="hover:text-[#201a1b] transition-colors cursor-pointer"
            >
              University Partners
            </button>
            <button
              onClick={() => onShowToast('Connecting to Academic Support Desk...')}
              className="hover:text-[#201a1b] transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
