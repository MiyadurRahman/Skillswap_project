import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';
import { ReviewModal } from '../component/ReviewModal';
import {
  resolveSessionTimes,
  submitReview,
  subscribeReviewStatus,
} from '../services/realtime';
import { openExternalUrl } from '../utils/urlUtils';
import { getLocalTimeZone, toDateInput, toTimeInputValue } from '../utils/dateUtils';
import { resolveAvatarForName } from '../assets';

export const SessionDetailsPage = ({
  session: activeSessionProp,
  allSessions = [],
  onSelectSession,
  onNavigateScreen,
  onShowToast,
  onSelectPeerProfile,
  onUpdateSession,
  onAddSessionNote,
  realtime = false,
  onMessageMentor,
  onSettleSession,
}) => {
  const { currentUser, userProfile: authProfile } = useAuth();
  const userRole = authProfile?.academicLevel || 'Academic level not provided';
  const userAvatar =
    authProfile?.avatarUrl ||
    resolveAvatarForName(authProfile?.name || currentUser?.displayName || 'Scholar');

  const session = activeSessionProp || { partner: {}, notes: [] };
  const sessionDateLabel = session.startMs
    ? new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(session.startMs))
    : session.date;
  const sessionTimeLabel = session.startMs
    ? new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(session.startMs))
    : session.time;

  // Local interactive states
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const defaultStart = session?.startMs || resolveSessionTimes(session)?.startAt;
  const defaultRescheduleTime = defaultStart
    ? toTimeInputValue(
        `${String(new Date(defaultStart).getHours()).padStart(2, '0')}:${String(new Date(defaultStart).getMinutes()).padStart(2, '0')}`
      )
    : '14:00';
  const [rescheduleDate, setRescheduleDate] = useState(
    defaultStart
      ? `${new Date(defaultStart).getFullYear()}-${String(new Date(defaultStart).getMonth() + 1).padStart(2, '0')}-${String(new Date(defaultStart).getDate()).padStart(2, '0')}`
      : ''
  );
  const [rescheduleTime, setRescheduleTime] = useState(defaultRescheduleTime);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);

  // Review flow: opened after settling a session, saved to Firestore on submit.
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Is the current user the requester (based on the session's participant ids)?
  const currentUid = currentUser?.uid;
  const partnerUid = session.partner?.id || session.partner?.uid;
  const mySideSettled = Boolean(session.settledBy && session.settledBy[currentUid]);
  const allSidesSettled = Boolean(
    session.participantIds?.length === 2 &&
    session.participantIds.every((uid) => session.settledBy?.[uid])
  );
  const reviewStatusKey = realtime && session?.id && currentUid
    ? `${session.id}__${currentUid}`
    : null;
  const [reviewStatus, setReviewStatus] = useState({ key: null, submitted: false });
  const reviewStatusReady = Boolean(reviewStatusKey && reviewStatus.key === reviewStatusKey);
  const alreadyReviewed = reviewStatusReady && reviewStatus.submitted;

  useEffect(() => {
    if (!reviewStatusKey) return undefined;
    return subscribeReviewStatus(session.id, currentUid, (submitted) => {
      setReviewStatus({ key: reviewStatusKey, submitted });
    });
  }, [reviewStatusKey, session.id, currentUid]);

  const handleCompleteSession = async () => {
    if (session.status === 'Completed') {
      onShowToast?.('This session is already completed.');
      return;
    }
    if (isSettling) return;

    if (onSettleSession && session?.id) {
      setIsSettling(true);
      try {
        const result = await onSettleSession(session);
        if (result?.allSettled) {
          onShowToast?.('✅ Session settled! Time credits transferred.');
          if (partnerUid && !alreadyReviewed) {
            setIsReviewModalOpen(true);
          }
        } else {
          onShowToast?.(
            'Your side is settled. You can review after your partner completes settlement.'
          );
        }
      } catch (err) {
        console.warn('Settle failed:', err);
        onShowToast?.(err?.message || 'Could not settle this session.');
      } finally {
        setIsSettling(false);
      }
      return;
    }
    onShowToast?.('This session cannot be settled because it has not synced yet.');
  };

  const handleSubmitReview = async ({ sessionId, targetUid, rating, comment }) => {
    try {
      await submitReview({
        sessionId,
        authorUid: currentUser?.uid,
        authorName: authProfile?.name || 'You',
        authorAvatar: authProfile?.avatarUrl,
        targetUid,
        rating,
        comment,
      });
      if (reviewStatusKey) {
        setReviewStatus({ key: reviewStatusKey, submitted: true });
      }
      onShowToast?.('⭐ Review submitted — thanks for the feedback!');
    } catch (err) {
      console.warn('Review failed:', err);
      if (err?.message?.includes('already reviewed')) {
        if (reviewStatusKey) {
          setReviewStatus({ key: reviewStatusKey, submitted: true });
        }
        onShowToast?.('You already reviewed this session.');
        return;
      }
      const permissionDenied = String(err?.code || '').includes('permission-denied');
      onShowToast?.(
        permissionDenied
          ? 'Reviews unlock after both participants settle and the session is completed.'
          : err?.message || 'Could not post review.'
      );
      throw err;
    }
  };

  if (!activeSessionProp) {
    return (
      <div
        id="screen-session-details"
        className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col items-center justify-center gap-4 p-8 font-sans"
      >
        <span className="material-symbols-outlined text-5xl text-[#b7a4b3]">
          video_camera_front
        </span>
        <h1 className="text-2xl font-bold text-[#201a1b]">No active sessions yet</h1>
        <p className="text-sm text-[#705e69] max-w-md text-center">
          When a scholar accepts one of your requests — or you accept an incoming
          request — the confirmed session (with its live meeting link) will show up
          here in real time.
        </p>
        <button
          onClick={() => onNavigateScreen('discover')}
          className="px-5 py-2.5 bg-[#57445f] hover:bg-[#43334a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Find a Scholar
        </button>
      </div>
    );
  }

  // Partner name used on the message action.
  const partnerFirstName = session.partner?.name?.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/, '').split(' ')[0] || 'Partner';

  // Add Note Handler
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      authorUid: currentUser?.uid,
      authorName: authProfile?.name || 'You',
      authorAvatar: userAvatar,
      timestamp: 'Just now',
      text: noteText.trim(),
    };

    // REALTIME: persist the note to Firestore (shared with partner live).
    if (realtime && onAddSessionNote && session?.id) {
      try {
        await onAddSessionNote(session.id, newNote);
        setNoteText('');
        setIsAddingNote(false);
        onShowToast?.('Note added to pre-session notes!');
      } catch (err) {
        console.warn('Add note failed:', err);
        onShowToast?.('Could not post note. Please try again.');
      }
      return;
    }

    const updatedSession = {
      ...session,
      notes: [...(session.notes || []), newNote],
    };

    if (onUpdateSession) {
      onUpdateSession(updatedSession);
    }
    setNoteText('');
    setIsAddingNote(false);
    onShowToast?.('Note added to pre-session notes!');
  };

  // Reschedule Handler
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (isRescheduling) return;
    setIsRescheduling(true);
    const updatedSession = {
      ...session,
      date: rescheduleDate,
      time: rescheduleTime,
      timeZone: getLocalTimeZone(),
      startAt: null,
      endAt: null,
    };
    try {
      if (!onUpdateSession) return;
      await onUpdateSession(updatedSession);
    } catch {
      return;
    } finally {
      setIsRescheduling(false);
    }
    setIsRescheduleOpen(false);
    const pretty =
      rescheduleDate && /^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)
      ? new Date(`${rescheduleDate}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })
        : rescheduleDate;
    onShowToast?.(`Session rescheduled to ${pretty} (${rescheduleTime})`);
  };

  // Cancel Handler
  const handleCancelSession = async () => {
    if (session.status !== 'Accepted' || isCancelling || !onUpdateSession) return;
    setIsCancelling(true);
    try {
      await onUpdateSession({ ...session, status: 'Cancelled' });
      onShowToast?.('Session has been cancelled.');
    } catch {
      // The update handler reports the save failure.
    } finally {
      setIsCancelling(false);
    }
  };

  // Add to Calendar .ics exporter
  const handleAddToCalendar = () => {
    const resolvedTimes = resolveSessionTimes(session);
    const start = session.startMs || resolvedTimes.startAt;
    const end = session.endMs || resolvedTimes.endAt;
    if (!start || !end) {
      onShowToast?.('Add a valid date and time before downloading a calendar invite.');
      return;
    }
    const toICS = (ms) =>
      new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SkillSwap Academic//EN',
      'BEGIN:VEVENT',
      `UID:${session.id}@skillswap`,
      `DTSTAMP:${toICS(Date.now())}`,
      `DTSTART:${toICS(start)}`,
      `DTEND:${toICS(end)}`,
      `SUMMARY:${session.title} with ${session.partner?.name || 'Peer'}`,
      `DESCRIPTION:${session.description || ''}`,
      `LOCATION:${session.meetingLink || ''}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${session.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    onShowToast?.('📅 Calendar invite downloaded.');
  };

  // View partner full profile
  const handleViewPartnerProfile = () => {
    if (onSelectPeerProfile && session.partner) {
      onSelectPeerProfile(session.partner);
    }
    onNavigateScreen('public-profile');
  };

  return (
    <div
      id="screen-session-details"
      className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]"
    >
      {/* 1. TOP NAVBAR (matching exact dark plum bar from screenshot) */}
      <header className="sticky top-0 w-full h-[68px] bg-[#473b4b] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1400px] mx-auto h-full">
          {/* Brand & Tab Navigation */}
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#473b4b"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Search', icon: 'explore', onClick: () => onNavigateScreen('discover') },
                { label: 'Requests', icon: 'inbox', onClick: () => onNavigateScreen('requests') },
                { label: 'Skill Manager', icon: 'school', onClick: () => onNavigateScreen('skill-manager') },
              ]}
            />
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-[#c5b3d3] tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
              id="brand-logo"
            >
              SkillSwap
            </span>
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-white/80">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="hover:text-white transition-colors cursor-pointer"
                id="nav-tab-dashboard"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="hover:text-white transition-colors cursor-pointer"
                id="nav-tab-search"
              >
                SEARCH
              </button>
              <button
                onClick={() => onNavigateScreen('requests')}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                id="nav-tab-requests"
              >
                <span>REQUESTS</span>
              </button>
            </nav>
          </div>

          {/* Right Header: Search Bar & Icons */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-56 lg:w-72">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-white/50">
                search
              </span>
              <input
                type="text"
                placeholder="Search skills..."
                onFocus={() => onNavigateScreen('discover')}
                className="w-full bg-[#362a39] text-white placeholder-white/50 text-xs rounded-full pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-[#c5b3d3]"
                id="input-top-search"
              />
            </div>

            {/* Profile Avatar with Online Dot */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="relative cursor-pointer group shrink-0"
              title="Profile Settings"
              id="user-profile-avatar-trigger"
            >
              <img
                src={userAvatar}
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-white/30 group-hover:border-white transition-all shadow-2xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside
          id="sidebar-session-details"
          className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#eddcd8] p-5 sm:p-6 shrink-0 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* User Greeting Block */}
            <div className="pb-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#705e69]">
                WELCOME BACK
              </p>
              <h2 className="text-xl font-bold text-[#201a1b] tracking-tight mt-0.5">
                {userRole}
              </h2>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5" id="sidebar-nav">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#544450] hover:bg-[#f6eae7] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                id="btn-nav-overview"
              >
                <span className="material-symbols-outlined text-[19px] text-[#705e69]">
                  grid_view
                </span>
                <span>Overview</span>
              </button>

              <button
                onClick={() => onNavigateScreen('skill-manager')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#544450] hover:bg-[#f6eae7] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                id="btn-nav-skill-manager"
              >
                <span className="material-symbols-outlined text-[19px] text-[#705e69]">
                  school
                </span>
                <span>Skill Manager</span>
              </button>

              {/* Session Requests / Inquiries link */}
              <button
                onClick={() => onNavigateScreen('requests')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#544450] hover:bg-[#f6eae7] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                id="btn-nav-requests-inquiries"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px] text-[#705e69]">
                    inbox
                  </span>
                  <span>Session Requests</span>
                </div>
              </button>

              {/* Current session details navigation item */}
              <button
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#eeddf2] text-[#47364d] font-bold text-xs rounded-l-xl border-r-4 border-[#524056] shadow-2xs cursor-default"
                id="btn-nav-session-active"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[19px] text-[#47364d]">
                    video_camera_front
                  </span>
                  <span>Session Details</span>
                </div>
              </button>

              <button
                onClick={() => onNavigateScreen('schedule')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#544450] hover:bg-[#f6eae7] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                id="btn-nav-history"
              >
                <span className="material-symbols-outlined text-[19px] text-[#705e69]">
                  history
                </span>
                <span>History</span>
              </button>
            </nav>
          </div>

          {/* Settings and swap navigation */}
          <div className="pt-6 border-t border-[#eddcd8] space-y-3 mt-6 md:mt-0">
            <button
              onClick={() => onNavigateScreen('profile-setup')}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-[#544450] hover:bg-[#f6eae7] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="btn-nav-settings"
            >
              <span className="material-symbols-outlined text-[19px] text-[#705e69]">
                settings
              </span>
              <span>Settings</span>
            </button>

            <button
              onClick={() => onNavigateScreen('discover')}
              className="w-full py-3 px-4 bg-[#57445f] hover:bg-[#43334a] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              id="btn-start-new-swap"
            >
              <span>Start New Swap</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 space-y-6">
          {/* Header Row: Breadcrumbs, Title, Status & Share */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#705e69] font-medium mb-1.5">
              <span
                onClick={() => setShowSessionsDropdown(!showSessionsDropdown)}
                className="hover:text-[#201a1b] cursor-pointer underline flex items-center gap-1"
                title="Switch active session"
              >
                Sessions
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </span>
              <span>›</span>
              <span className="text-[#201a1b] font-semibold">Details</span>

              {/* Sessions Switcher Dropdown (if multiple exist) */}
              {showSessionsDropdown && allSessions.length > 0 && (
                <div className="absolute mt-8 bg-white border border-[#eddcd8] rounded-xl p-2 shadow-lg z-30 min-w-[240px] max-w-[calc(100vw-2rem)]">
                  <p className="text-[10px] uppercase font-bold text-[#887580] px-2 py-1">
                    Your Scheduled Swaps:
                  </p>
                  {allSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSession?.(s);
                        setShowSessionsDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        s.id === session.id
                          ? 'bg-[#eeddf2] text-[#47364d]'
                          : 'hover:bg-[#fbf4f2] text-[#201a1b]'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight leading-tight"
                id="session-details-title"
              >
                {session.title}
              </h1>

              <div className="flex items-center gap-3 shrink-0">
                {/* Origin indicator if from peer request */}
                {session.originRequestId && (
                  <button
                    onClick={() => onNavigateScreen('requests')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fdf2f0] text-[#784347] border border-[#f3d4cf] hover:bg-[#fae5e1] transition-colors cursor-pointer"
                    title="View original peer request"
                  >
                    <span className="material-symbols-outlined text-[14px]">inbox</span>
                    <span>From Peer Request</span>
                  </button>
                )}

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    session.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : session.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-[#efdbfd] text-[#4f415c]'
                  }`}
                  id="badge-session-status"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      session.status === 'Completed'
                        ? 'bg-emerald-600'
                        : session.status === 'Cancelled'
                          ? 'bg-rose-600'
                          : 'bg-[#4f415c]'
                    }`}
                  ></span>
                  <span>{session.status || 'Accepted'}</span>
                </span>

                {/* Share Button */}
                <button
                  onClick={() => {
                    navigator?.clipboard?.writeText?.(window.location.href);
                    onShowToast?.('📋 Session link copied to clipboard!');
                  }}
                  className="w-9 h-9 rounded-full border border-[#eddcd8] bg-white hover:bg-[#fbf4f2] text-[#544450] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="Share Session"
                  id="btn-share-session"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT COLUMN: Exchange Overview + Pre-Session Notes (2 cols wide) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Exchange Overview Card */}
              <div
                className="bg-white border border-[#ebd8d4] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden"
                id="card-exchange-overview"
              >
                {/* Subtle Mortarboard Watermark in Top Right */}
                <span
                  className="material-symbols-outlined absolute -top-4 -right-4 text-[130px] text-[#f2e6e3]/60 pointer-events-none select-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  school
                </span>

                <h2 className="text-lg font-bold text-[#201a1b] mb-3">
                  Exchange Overview
                </h2>
                <p className="text-xs sm:text-sm text-[#544650] leading-relaxed max-w-xl">
                  {session.description}
                </p>

                {/* Sub-grid: Key Learning Goals + Exchange Detail Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7 pt-5 border-t border-[#f4e8e5]">
                  {/* Left: Key Learning Goals */}
                  <div>
                    <h3 className="text-xs font-bold text-[#201a1b] tracking-wide mb-3">
                      Key Learning Goals
                    </h3>
                    {session.learningGoals?.length ? (
                    <ul className="space-y-2.5">
                      {session.learningGoals.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#443842]">
                          <span
                            className="material-symbols-outlined text-[17px] text-[#57445f] shrink-0 mt-0.5"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                    ) : (
                      <p className="text-xs text-[#705e69]">No learning goals were added to this request.</p>
                    )}
                  </div>

                  {/* Right: Exchange Detail Card */}
                  <div className="bg-[#fcf5f3] border border-[#f2e3df] rounded-xl p-4.5 space-y-3">
                    <h3 className="text-xs font-bold text-[#201a1b] tracking-wide">
                      Exchange Detail
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#705e69]">Duration</span>
                        <span className="font-bold text-[#201a1b]">
                          {session.duration || '90 Minutes'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#705e69]">Method</span>
                        <span className="font-bold text-[#201a1b]">
                          {session.method || 'Video Call'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#705e69]">Platform</span>
                        <span className="font-bold text-[#201a1b]">
                          {session.platform || 'SkillSwap Connect'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Pre-Session Notes Card */}
              <div
                className="bg-white border border-[#ebd8d4] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4"
                id="card-presession-notes"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#201a1b]">
                    Pre-Session Notes
                  </h2>
                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="text-xs font-bold text-[#57445f] hover:text-[#322338] transition-colors cursor-pointer flex items-center gap-1"
                    id="btn-toggle-add-note"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Note</span>
                  </button>
                </div>

                {/* Inline Add Note Form */}
                {isAddingNote && (
                  <form
                    onSubmit={handleAddNote}
                    className="bg-[#fcf5f3] border border-[#ebd8d4] rounded-xl p-4 space-y-3"
                  >
                    <label className="block text-xs font-bold text-[#201a1b]">
                      Add note for {session.partner?.name || 'partner'} & session prep:
                    </label>
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Share dataset links, questions, or specific agenda items..."
                      className="w-full bg-white border border-[#eddcd8] rounded-xl p-3 text-xs text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNoteText('');
                          setIsAddingNote(false);
                        }}
                        className="px-3.5 py-1.5 text-xs text-[#705e69] hover:text-[#201a1b] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#57445f] hover:bg-[#43334a] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Post Note
                      </button>
                    </div>
                  </form>
                )}

                {/* Notes Feed */}
                <div className="space-y-3">
                  {(session.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#fbf5f4] border border-[#f0e2df] rounded-xl p-4 flex items-start gap-3.5"
                    >
                      <img
                        src={note.authorAvatar || session.partner?.avatarUrl}
                        alt={note.authorName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#ebd8d4]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-[#201a1b]">
                            {note.authorName}
                          </span>
                          <span className="text-[11px] text-[#8c7b86]">
                            {note.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#4c3e47] leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!session.notes || session.notes.length === 0) && (
                    <p className="text-xs text-[#8c7b86] italic py-2">
                      No pre-session notes posted yet. Click "+ Add Note" to share materials.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Schedule + Swap Partner + Session Actions (1 col wide) */}
            <div className="space-y-5">
              {/* 1. Schedule Card (Mauve/Lavender card matching screenshot) */}
              <div
                className="bg-[#bca6c5] text-white rounded-2xl p-6 shadow-xs relative overflow-hidden"
                id="card-schedule"
              >
                {/* Watermark Clock / Calendar Icon */}
                <span
                  className="material-symbols-outlined absolute -bottom-5 -right-5 text-[120px] text-white/15 pointer-events-none select-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  calendar_today
                </span>

                <h3 className="text-base font-bold text-white/95 mb-4">
                  Schedule
                </h3>

                <div className="space-y-4 mb-6">
                  {/* Date Block */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-white">
                        calendar_today
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        DATE
                      </p>
                      <p className="font-bold text-sm text-white">
                        {sessionDateLabel || 'Date to be confirmed'}
                      </p>
                    </div>
                  </div>

                  {/* Time Block */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-white">
                        schedule
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        TIME
                      </p>
                      <p className="font-bold text-sm text-white">
                        {sessionTimeLabel || 'Time to be confirmed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add to Calendar Button */}
                <button
                  onClick={handleAddToCalendar}
                  className="w-full py-3 px-4 bg-white text-[#47364d] hover:bg-[#f6eef8] font-bold text-xs rounded-full transition-all shadow-sm active:scale-98 cursor-pointer text-center"
                  id="btn-add-to-calendar"
                >
                  Add to Calendar
                </button>
              </div>

              {/* 2. SWAP PARTNER Card */}
              <div
                className="bg-white border border-[#ebd8d4] rounded-2xl p-6 shadow-xs flex flex-col items-center text-center"
                id="card-swap-partner"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#705e69] self-start mb-4">
                  SWAP PARTNER
                </p>

                {/* Partner Avatar with Online Indicator */}
                <div className="relative mb-3">
                  <img
                    src={session.partner?.avatarUrl || resolveAvatarForName(session.partner?.name || 'Scholar')}
                    alt={session.partner?.name || 'Partner'}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#ebd8d4] shadow-xs"
                  />
                  {session.partner?.isOnline === true && (
                    <span
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                      title="Partner is active now"
                    ></span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#201a1b]">
                  {session.partner?.name || 'Peer Scholar'}
                </h3>
                <p className="text-xs text-[#6e5d68] font-medium mt-0.5 mb-3 max-w-[220px]">
                  {session.partner?.title || 'Academic level not provided'}
                </p>

                {/* Partner Skill Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                  {(session.partner?.badges || []).map(
                    (b, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#fbf0ed] text-[#6d463d] border border-[#f3ded9]"
                      >
                        {b}
                      </span>
                    )
                  )}
                </div>

                {/* Partner Action Buttons */}
                <div className="w-full space-y-2.5 pt-2 border-t border-[#f4e8e5]">
                  <button
                    onClick={() => {
                      const partner = session.partner || {};
                      if (onMessageMentor) {
                        onMessageMentor({
                          uid: partner.uid || partner.id,
                          name: partner.name || 'Partner',
                          title: partner.title || 'Peer Scholar',
                          avatarUrl: partner.avatarUrl,
                        });
                      } else if (onShowToast) {
                        onShowToast('Messaging is unavailable for this scholar right now.', 'warning');
                      }
                    }}
                    className="w-full py-2.5 px-4 text-[#201a1b] hover:bg-[#fbf4f2] border border-[#eddcd8] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    id="btn-message-partner"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#705e69]">
                      chat_bubble
                    </span>
                    <span>Message {partnerFirstName}</span>
                  </button>

                  <button
                    onClick={handleViewPartnerProfile}
                    className="w-full text-xs font-semibold text-[#57445f] hover:text-[#201a1b] py-1 transition-colors cursor-pointer"
                    id="btn-view-partner-profile"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>

              {/* 3. SESSION ACTIONS Card */}
              <div
                className="bg-[#fdf6f5] border border-[#edd7d2] rounded-2xl p-4.5 shadow-xs space-y-2.5"
                id="card-session-actions"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#887580] mb-1">
                  SESSION ACTIONS
                </p>

                {/* Join Live Meeting (real Meet/Zoom link shared on accept) */}
                {session.meetingLink && (
                  <button
                    onClick={() => {
                      if (!openExternalUrl(session.meetingLink)) {
                        onShowToast?.('This meeting link is invalid. Ask the session host to update it.');
                      }
                    }}
                    className="w-full bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                    id="btn-join-meeting"
                  >
                    <span>Join Live Meeting</span>
                    <span className="material-symbols-outlined text-[18px]">
                      video_camera_front
                    </span>
                  </button>
                )}

                {/* Complete Session Button */}
                <button
                  onClick={handleCompleteSession}
                  disabled={
                    session.status === 'Completed' ||
                    session.status === 'Cancelled' ||
                    (mySideSettled && !allSidesSettled) ||
                    isSettling
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#dfe8e2] disabled:text-[#8a9a90] disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                  id="btn-complete-session"
                >
                  <span>
                    {session.status === 'Completed'
                      ? 'Session Completed'
                      : allSidesSettled
                        ? isSettling
                          ? 'Finalizing Credits…'
                          : 'Finalize Settlement'
                        : mySideSettled
                        ? 'Awaiting Partner'
                        : isSettling
                          ? 'Settling Credits…'
                          : 'Settle Session'}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    {session.status === 'Completed' ? 'check_circle' : 'check'}
                  </span>
                </button>

                {realtime &&
                  session.status === 'Completed' &&
                  partnerUid &&
                  reviewStatusReady &&
                  (alreadyReviewed ? (
                    <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between">
                      <span>Review Submitted</span>
                      <span className="material-symbols-outlined text-[18px]">star</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                      id="btn-review-partner"
                    >
                      <span>Review Partner</span>
                      <span className="material-symbols-outlined text-[18px]">rate_review</span>
                    </button>
                  ))}

                {/* Reschedule Button */}
                <button
                  onClick={() => setIsRescheduleOpen(true)}
                  disabled={session.status !== 'Accepted'}
                  className="w-full bg-white hover:bg-[#faf4f3] border border-[#ebd8d4] rounded-xl px-4 py-3 text-xs font-bold text-[#201a1b] flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                  id="btn-reschedule-session"
                >
                  <span>Reschedule Session</span>
                  <span className="material-symbols-outlined text-[18px] text-[#705e69]">
                    chevron_right
                  </span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={handleCancelSession}
                  className="w-full bg-white hover:bg-[#fdeded] border border-[#f3d3d3] rounded-xl px-4 py-3 text-xs font-bold text-rose-600 flex items-center justify-between transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  id="btn-cancel-session"
                  disabled={session.status !== 'Accepted' || isCancelling}
                >
                  <span>
                    {isCancelling ? 'Cancelling…' : session.status === 'Cancelled' ? 'Session Cancelled' : 'Cancel Session'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-rose-500">
                    {session.status === 'Cancelled' ? 'event_busy' : 'close'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: Reschedule Session Dialog */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f4e8e5] pb-3">
              <h3 className="font-bold text-base text-[#201a1b]">
                Reschedule Session
              </h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-[#8c7b86] hover:text-[#201a1b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Select New Date:
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={toDateInput(0)}
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                  required
                />
              </div>

              <div>
                <p className="mb-2 text-[11px] text-[#705e69]">New time uses your local zone: {getLocalTimeZone()}</p>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Select New Start Time:
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f] cursor-pointer"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRescheduling}
                  className="px-5 py-2 bg-[#57445f] hover:bg-[#43334a] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isRescheduling ? 'Saving…' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (after settling a session) */}
      {isReviewModalOpen && (
        <ReviewModal
          session={session}
          authorName={authProfile?.name || 'You'}
          authorAvatar={authProfile?.avatarUrl}
          targetUid={partnerUid}
          onSubmitReview={handleSubmitReview}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
