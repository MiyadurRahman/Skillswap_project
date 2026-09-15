import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MobileNav } from '../component/MobileNav';
import { CalendarView } from '../component/CalendarView';
import { ScheduleHistoryList } from '../component/ScheduleHistoryList';

const startOfWeek = (d) => {
  const copy = new Date(d);
  const dow = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - dow);
  return copy.getTime();
};

export const SchedulePage = ({
  userProfile,
  sessions = [],
  onNavigateScreen,
  onSelectSession,
  onUpdateSession,
  onShowToast,
}) => {
  const { currentUser, userProfile: authProfile } = useAuth();
  const userAvatar =
    authProfile?.avatarUrl ||
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80';

  const [cancelTarget, setCancelTarget] = useState(null);

  const calendarEvents = useMemo(
    () => sessions.filter((s) => s.status !== 'Cancelled'),
    [sessions]
  );

  const confirmed = useMemo(
    () => sessions.filter((s) => s.status === 'Accepted'),
    [sessions]
  );

  const thisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
    return confirmed.filter((s) => s.startMs >= weekStart && s.startMs < weekEnd).length;
  }, [confirmed]);

  const upcoming = useMemo(
    () =>
      confirmed
        .filter((s) => !s.startMs || s.startMs >= Date.now())
        .sort((a, b) => (a.startMs || Infinity) - (b.startMs || Infinity))
        .slice(0, 4),
    [confirmed]
  );

  const completedCount = sessions.filter((s) => s.status === 'Completed').length;
  const cancelledCount = sessions.filter((s) => s.status === 'Cancelled').length;

  const handleCancel = (session) => {
    if (!session?.id) return;
    setCancelTarget(session);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    onUpdateSession?.({
      ...cancelTarget,
      status: 'Cancelled',
      date: cancelTarget.date,
      time: cancelTarget.time,
      title: cancelTarget.title,
    });
    onShowToast?.('Session cancelled. It has been removed from your calendar.');
    setCancelTarget(null);
  };

  const formatDay = (ms) =>
    ms
      ? new Date(ms).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : '';

  const formatTime = (ms) =>
    ms
      ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
          new Date(ms)
        )
      : '';

  return (
    <div id="screen-schedule" className="min-h-screen bg-[#fcf5f3] text-[#201a1b] font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 w-full h-[68px] bg-[#4a3b47] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1400px] mx-auto h-full">
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#4a3b47"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Skill Manager', icon: 'school', onClick: () => onNavigateScreen('skill-manager') },
                { label: 'Search', icon: 'explore', onClick: () => onNavigateScreen('discover') },
                { label: 'Requests', icon: 'inbox', onClick: () => onNavigateScreen('requests') },
              ]}
            />
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-[#c5b3d3] tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
              id="schedule-brand-logo"
            >
              SkillSwap
            </span>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="schedule-nav-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="schedule-nav-discover"
              >
                Discover
              </button>
              <button
                onClick={() => onNavigateScreen('requests')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="schedule-nav-requests"
              >
                Requests
              </button>
              <button className="text-white font-bold border-b-2 border-white pb-0.5 py-1" id="schedule-nav-schedule">
                My Schedule
              </button>
            </div>
          </div>

          {/* Right: icons & profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast?.('Notifications: All academic swaps are up to date.')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Notifications"
              id="schedule-btn-notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button
              onClick={() => onNavigateScreen('profile-setup')}
              className="relative cursor-pointer group shrink-0"
              title="Profile Settings"
              id="schedule-profile-avatar-trigger"
            >
              <img
                src={userAvatar}
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-white/30 group-hover:border-white transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Page intro */}
        <div>
          <h1 className="text-2xl font-bold text-[#201a1b] tracking-tight">My Schedule</h1>
          <p className="text-xs text-[#7b757d] mt-1">
            Confirmed sessions appear in real time when a booker accepts. Reschedule or cancel
            from any day in the agenda and the calendar updates instantly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#887580]">Confirmed</p>
            <p className="text-2xl font-bold text-[#675975] mt-1">{confirmed.length}</p>
          </div>
          <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#887580]">This Week</p>
            <p className="text-2xl font-bold text-[#675975] mt-1">{thisWeek}</p>
          </div>
          <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#887580]">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#887580]">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{cancelledCount}</p>
          </div>
        </div>

        {/* Calendar */}
        <CalendarView
          events={calendarEvents}
          onSelectSession={(s) => onSelectSession?.(s)}
          onReschedule={(s) => onSelectSession?.(s)}
          onCancel={handleCancel}
        />

        {/* Upcoming strip */}
        {upcoming.length > 0 && (
          <section className="bg-white border border-[#ccc4cd]/40 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#201a1b] mb-3">Next Up</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcoming.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession?.(s)}
                  className="flex items-center gap-4 rounded-xl border border-[#f1e8ea] bg-[#fcfaf9] p-3 text-left hover:border-[#d7c2e2] hover:bg-[#fbf4f2] transition-colors cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-full border-2 border-[#675975]/40 overflow-hidden shrink-0">
                    <img
                      src={s.partner?.avatarUrl}
                      alt={s.partner?.name || 'Peer'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#201a1b] truncate group-hover:text-[#675975] transition-colors">
                      {s.title}
                    </p>
                    <p className="text-xs text-[#7b757d] truncate">
                      {s.partner?.name || 'Peer Scholar'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#675975]">
                      {s.startMs ? formatTime(s.startMs) : (s.time || 'TBD')}
                    </p>
                    <p className="text-[11px] text-[#7b757d]">
                      {s.startMs ? formatDay(s.startMs) : (s.date || 'To be scheduled')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <ScheduleHistoryList sessions={sessions} onSelectSession={onSelectSession} />
      </main>

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCancelTarget(null)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl text-red-600">event_busy</span>
              <div>
                <h3 className="text-base font-bold text-[#201a1b]">Cancel this session?</h3>
                <p className="text-xs text-[#4a454c] mt-1">
                  <strong>{cancelTarget.title}</strong> with{' '}
                  {cancelTarget.partner?.name || 'your peer'} will be removed from your calendar
                  and moved to Past &amp; Cancelled.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#4a454c] hover:bg-[#f4f1f3] transition-colors cursor-pointer"
              >
                Keep Session
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};