import React, { useState } from 'react';
import { ActiveSessionCard } from '../component/ActiveSessionCard';
import { MentorCard } from '../component/MentorCard';
import { academicAssets } from '../assets';

export const DashboardPage = ({
  onNavigateScreen,
  onOpenMeetingModal,
  onOpenWalletModal,
  onOpenMentorModal,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  const activeSessions = [
    {
      id: 'session-1',
      title: 'Data Regression Analysis Workshop',
      category: 'Advanced Statistics',
      type: 'Exchange',
      mentorName: 'Dr. Elena Volkov',
      dateStr: 'Tomorrow, 14:00',
      iconName: 'psychology',
      bgCategoryColor: 'bg-[#ffdada]',
      textCategoryColor: 'text-[#5c3f40]',
      status: 'upcoming',
    },
    {
      id: 'session-2',
      title: 'Grant Proposal Peer Review',
      category: 'Academic Writing',
      type: 'Mentoring',
      mentorName: 'Marcus Thorne',
      dateStr: 'Friday, 09:30',
      iconName: 'history_edu',
      bgCategoryColor: 'bg-[#efdbfd]',
      textCategoryColor: 'text-[#4f415c]',
      status: 'upcoming',
    },
  ];

  const mentors = [
    {
      id: 'mentor-1',
      name: 'Prof. Julian Archer',
      field: 'Quantum Physics & Math',
      rating: 4.9,
      reviewsCount: 124,
      avatarUrl: academicAssets.avatars.julianSterling,
      isOnline: true,
      institution: 'Stanford Quantum Lab',
      badges: ['Tensor Math', 'Hilbert Spaces'],
      hourlyRateCredits: 1.0,
    },
    {
      id: 'mentor-2',
      name: 'Dr. Sarah Khan',
      field: 'Neural Networks & ML',
      rating: 5.0,
      reviewsCount: 89,
      avatarUrl: academicAssets.avatars.sarahKhan,
      isOnline: true,
      institution: 'MIT AI Lab',
      badges: ['Transformers', 'PyTorch'],
      hourlyRateCredits: 1.0,
    },
    {
      id: 'mentor-3',
      name: 'James Whitmore',
      field: 'Microbiology Lab Tech',
      rating: 4.8,
      reviewsCount: 210,
      avatarUrl: academicAssets.avatars.jamesWhitmore,
      isOnline: false,
      institution: 'Harvard Bio Dept',
      badges: ['CRISPR', 'Cell Culture'],
      hourlyRateCredits: 1.0,
    },
  ];

  const weeklyGrowthBars = [
    { day: 'MON', height: '30%', hours: '1.5 hrs' },
    { day: 'TUE', height: '50%', hours: '2.5 hrs' },
    { day: 'WED', height: '45%', hours: '2.0 hrs' },
    { day: 'THU', height: '80%', hours: '4.0 hrs', highlight: true },
    { day: 'FRI', height: '60%', hours: '3.0 hrs' },
    { day: 'SAT', height: '70%', hours: '3.5 hrs' },
    { day: 'SUN', height: '95%', hours: '4.5 hrs' },
  ];

  const trendingTags = ['Python for Bio', 'LATEX Mastery', 'GIS Mapping', 'Sociology 101'];

  return (
    <div id="screen-dashboard" className="bg-[#fff8f7] text-[#201a1b] min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 w-full h-[72px] bg-[#4e4353] shadow-md z-50">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1280px] mx-auto h-full">
          <div className="flex items-center gap-6 sm:gap-8">
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-[#c5b3d3] tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
            >
              SkillSwap
            </span>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-[#d2c0e0] border-b-2 border-[#d2c0e0] pb-1 font-bold text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={() => onShowToast('Opening academic skill catalog...')}
                className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors text-sm"
              >
                Discover
              </button>
              <button
                onClick={() => onShowToast('Showing your upcoming 2 peer swaps')}
                className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors text-sm"
              >
                My Sessions
              </button>
              <button
                onClick={() => onShowToast('You have 3 incoming swap proposals')}
                className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors text-sm"
              >
                Requests
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center bg-[#4f415c] rounded-full px-4 py-1.5 text-[#efdbfd] text-xs">
              <span className="material-symbols-outlined mr-2 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills or peers..."
                className="bg-transparent border-none focus:outline-none placeholder-[#efdbfd]/50 text-xs w-44 text-white"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onShowToast('Notifications: 2 pending peer reviews.')}
                className="p-2 text-white/80 hover:text-white transition-colors"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
              </button>
              <button
                onClick={() => onShowToast('Scholar Messages: No unread chats')}
                className="p-2 text-white/80 hover:text-white transition-colors"
                title="Messages"
              >
                <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
              </button>
            </div>
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer"
              title="Edit Profile"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#c5b3d3] overflow-hidden">
                <img
                  src={academicAssets.avatars.alexRivera}
                  alt="Alex Rivera"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="pt-[72px] flex max-w-[1280px] mx-auto min-h-screen">
        {/* Left Side Navigation */}
        <aside className="w-64 bg-[#fdf1f1] border-r border-[#ccc4cd]/30 p-6 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* User Mini Profile Card */}
            <div className="flex items-center gap-3 pb-6 border-b border-[#ccc4cd]/30">
              <div className="w-12 h-12 rounded-full border-2 border-[#675975] overflow-hidden relative">
                <img
                  src={academicAssets.avatars.alexRivera}
                  alt="Alex Rivera"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[#201a1b]">Alex Rivera</h2>
                <p className="text-xs text-[#4a454c]">PhD Candidate</p>
                <span className="inline-block text-[10px] bg-[#ffdada] text-[#5c3f40] px-2 py-0.5 rounded font-semibold mt-1">
                  Verified Scholar
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-[#eeddf2] text-[#6c6071] rounded-xl font-bold text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Overview
              </button>
              <button
                onClick={() => onShowToast('Showing all your peer tutoring sessions')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[#4a454c] hover:bg-[#ebe0e0] rounded-xl font-medium text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                My Schedule
              </button>
              <button
                onClick={onOpenWalletModal}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[#4a454c] hover:bg-[#ebe0e0] rounded-xl font-medium text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                Time Credit Ledger
              </button>
              <button
                onClick={() => onNavigateScreen('profile-setup')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[#4a454c] hover:bg-[#ebe0e0] rounded-xl font-medium text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile Settings
              </button>
            </nav>
          </div>

          {/* Quick Action Button */}
          <div className="pt-6 border-t border-[#ccc4cd]/30">
            <button
              onClick={() => onShowToast('Opening Matchmaking engine: finding optimal peer swap...')}
              className="w-full bg-[#675975] hover:bg-[#52445f] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_search</span>
              Find a Peer
            </button>
          </div>
        </aside>

        {/* Center Main Dashboard Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8">
          {/* Welcome Banner + Time Credit Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-gradient-to-r from-[#675975] to-[#52445f] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <span className="text-[11px] font-semibold text-[#efdbfd] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                  Semester Fall 2026
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, Alex!
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
                  You have <span className="font-bold text-[#efdbfd]">2 upcoming sessions</span> scheduled this week. Your time credit balance is ready for new exchanges.
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <button
                    onClick={() => onShowToast('Initiating peer matching request...')}
                    className="px-4 py-2 bg-[#c5b3d3] hover:bg-[#a992bb] text-[#52445f] font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    Request New Swap
                  </button>
                  <button
                    onClick={() => onNavigateScreen('profile-setup')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full transition-all border border-white/20"
                  >
                    Update Bio & Skills
                  </button>
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* Time Credit Balance Widget */}
            <div className="bg-white rounded-3xl p-6 ambient-lift border border-[#ccc4cd]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7b757d] uppercase tracking-wider">
                    Time Balance
                  </span>
                  <button
                    onClick={onOpenWalletModal}
                    className="text-[#675975] hover:text-[#4e4353] text-xs font-bold flex items-center gap-0.5"
                  >
                    History
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-extrabold text-[#675975]">24.5</span>
                  <span className="text-sm font-semibold text-[#4a454c]">Credit Hours</span>
                </div>
                <p className="text-xs text-[#4a454c]/80 mt-1">
                  Earned via 18 academic research & peer tutoring swaps.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#ccc4cd]/20 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  +4.5 hrs this month
                </span>
                <button
                  onClick={onOpenWalletModal}
                  className="text-xs font-bold text-[#675975] hover:underline"
                >
                  View Ledger
                </button>
              </div>
            </div>
          </div>

          {/* Section: Upcoming Active Swaps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#201a1b]">Upcoming Active Swaps</h2>
                <p className="text-xs text-[#4a454c]">
                  Confirmed 1-on-1 collaborative research sessions
                </p>
              </div>
              <button
                onClick={() => onShowToast('Loading all scheduled peer exchanges')}
                className="text-xs font-semibold text-[#675975] hover:underline"
              >
                View Calendar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSessions.map((session) => (
                <ActiveSessionCard
                  key={session.id}
                  session={session}
                  onJoin={onOpenMeetingModal}
                  onShowToast={onShowToast}
                />
              ))}
            </div>
          </div>

          {/* Section: Learning Velocity Bento & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Learning Velocity Chart */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 ambient-lift border border-[#ccc4cd]/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#201a1b]">Learning Velocity</h3>
                  <span className="text-[11px] font-bold text-[#675975] bg-[#fdf1f1] px-2 py-0.5 rounded-full">
                    This Week
                  </span>
                </div>
                <p className="text-xs text-[#4a454c] mb-6">
                  Hours exchanged across active disciplines
                </p>

                {/* Bar Graph */}
                <div className="h-36 flex items-end justify-between gap-2 px-2 pb-2 border-b border-[#ccc4cd]/30">
                  {weeklyGrowthBars.map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 bg-[#352f2f] text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {bar.hours}
                      </div>
                      <div
                        style={{ height: bar.height }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          bar.highlight
                            ? 'bg-[#675975] hover:bg-[#52445f]'
                            : 'bg-[#c5b3d3] hover:bg-[#b09bc0]'
                        }`}
                      ></div>
                      <span className="text-[10px] font-semibold text-[#7b757d]">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                <span className="text-[#4a454c]">Total: <strong>21.0 Hrs</strong></span>
                <span className="text-emerald-700 font-bold">92% Completion rate</span>
              </div>
            </div>

            {/* Recommended Verified Scholar Mentors */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#201a1b]">
                    Recommended Scholar Mentors
                  </h3>
                  <p className="text-xs text-[#4a454c]">
                    Matched based on your learning goals (e.g. Game Theory, PyTorch)
                  </p>
                </div>
                <button
                  onClick={() => onShowToast('Showing full catalog of verified PhD peers')}
                  className="text-xs font-semibold text-[#675975] hover:underline"
                >
                  Explore All
                </button>
              </div>

              <div className="space-y-3">
                {mentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onSelect={onOpenMentorModal}
                    onShowToast={onShowToast}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section: Trending Academic Tags */}
          <div className="bg-[#fdf1f1] rounded-2xl p-5 border border-[#ccc4cd]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#675975] text-2xl">
                trending_up
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#201a1b]">Trending on Campus This Week</h4>
                <p className="text-[11px] text-[#4a454c]">
                  Popular skill categories with high peer tutoring demand
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    onShowToast(`Filtering scholars offering ${tag}...`);
                  }}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-[#675975] text-white shadow-xs'
                      : 'bg-white text-[#4a454c] hover:bg-[#ebe0e0] border border-[#ccc4cd]/40'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
