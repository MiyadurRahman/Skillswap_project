import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MobileNav } from '../component/MobileNav';
import { allPeers } from '../data/peersData';
import { useDiscoverFilters } from '../hooks/useDiscoverFilters';
import { useDiscoverRequests } from '../hooks/useDiscoverRequests';
import { RequestPeerModal } from '../component/discover/RequestPeerModal';

export const DiscoverPage = ({
  onNavigateScreen,
  onOpenWalletModal,
  onShowToast,
  userProfile: propProfile,
  onSelectPeerProfile,
  onCreateSession,
  realtime = false,
  realtimeUsers = [],
  onRequestRealtime,
  onMessageMentor,
}) => {
  const { currentUser, userProfile: authProfile } = useAuth();
  const userProfile = authProfile || propProfile || {};

  // Real scholars who exist in Firestore (exclude the current viewer).
  const liveScholars = useMemo(
    () => realtimeUsers.filter((u) => u.uid && u.uid !== currentUser?.uid),
    [realtimeUsers, currentUser?.uid]
  );

  // Search, filters, trending tags, pagination + derived result lists.
  const {
    trendingTags,
    searchQuery,
    setSearchQuery,
    selectedFields,
    handleFieldToggle,
    minRating,
    setMinRating,
    availability,
    setAvailability,
    academicLevel,
    setAcademicLevel,
    activeTrendingTag,
    setActiveTrendingTag,
    handleTagClick,
    setCurrentPage,
    filteredPeers,
    filteredLive,
    totalPages,
    effectivePage,
    paginatedPeers,
    resetFilters,
  } = useDiscoverFilters(liveScholars, onShowToast);

  // Request Session from Discover modal state + submit handler.
  const {
    requestingPeer,
    setRequestingPeer,
    reqTopic,
    setReqTopic,
    reqSlot,
    setReqSlot,
    reqOfferedSkill,
    setReqOfferedSkill,
    reqNote,
    setReqNote,
    handleOpenRequestModal,
    handleConfirmDiscoverSession,
  } = useDiscoverRequests({
    realtime,
    onRequestRealtime,
    onShowToast,
    onCreateSession,
    onNavigateScreen,
    userProfile,
    userAvatar,
  });

  const handleOpenPeer = (peer) => {
    if (onSelectPeerProfile) {
      onSelectPeerProfile({
        id: peer.id,
        name: peer.name,
        title: peer.title,
        rating: peer.rating,
        reviewsCount: peer.reviewsCount || 48,
        avatarUrl: peer.avatarUrl,
        isOnline: peer.isOnline,
        bio: peer.bio,
        credentials: peer.credentials || ['Verified Scholar', peer.academicLevel || 'PhD Researcher'],
        responseSpeed: peer.responseSpeed || 'Usually responds in 2h',
        skillsTeach: peer.skillsTeach || (peer.skills ? peer.skills.map(s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())) : ['Peer Tutoring', 'Academic Research']),
        skillsWant: peer.skillsWant || ['Advanced Python', 'Machine Learning Basics', 'Data Visualization', 'Public Speaking'],
        availability: peer.availability || (peer.nextAvailable ? `Available: ${peer.nextAvailable}` : 'Available: Tue, Thu, Sat'),
        preferredMode: peer.preferredMode || 'Preferred: Virtual / Zoom',
        swapsCount: peer.swapsCount || (peer.reviewsCount ? Math.floor(peer.reviewsCount * 0.4) : 48),
        learnersCount: peer.learnersCount || '1.8k',
        reviews: peer.reviews || [
          {
            id: 'rev-1',
            name: 'Marcus Thorne',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
            rating: 5,
            quote: `Outstanding collaboration session with ${peer.name}. Deep academic rigor and clear explanations.`,
            meta: 'Recent • Swapped for Peer Exchange',
          },
          {
            id: 'rev-2',
            name: 'Dr. Sarah L.',
            avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
            rating: 5,
            quote: `High quality academic feedback and methodology review. Helped strengthen our paper analysis.`,
            meta: '2 weeks ago • Swapped for Research Consulting',
          },
        ],
      });
    }
    onNavigateScreen('public-profile');
  };

  const handleFindPeerCTA = () => {
    const count = realtime ? filteredLive.length : filteredPeers.length;
    const kind = realtime ? 'live' : 'verified';
    onShowToast(`Found ${count} ${kind} academic peers matching your criteria.`);
  };

  const userAvatar =
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80';

  return (
    <div id="screen-discover" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* 1. TOP NAVBAR (matching the dark plum navbar with white/lilac accents) */}
      <header className="sticky top-0 w-full h-[68px] bg-[#3e313f] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1360px] mx-auto h-full">
          {/* Brand & Nav items */}
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#3e313f"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Skill Manager', icon: 'school', onClick: () => onNavigateScreen('skill-manager') },
                { label: 'Discover', icon: 'explore', active: true, onClick: () => {} },
                { label: 'Requests', icon: 'inbox', badge: true, onClick: () => onNavigateScreen('requests') },
                { label: 'My Sessions', icon: 'calendar_today', onClick: () => onNavigateScreen('session-details') },
              ]}
            />
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
              id="nav-brand-logo"
            >
              SkillSwap
            </span>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateScreen('skill-manager')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-skill-manager"
              >
                Skill Manager
              </button>
              <button
                onClick={() => {}}
                className="text-white font-bold border-b-2 border-white pb-0.5 tracking-wide"
                id="nav-tab-discover"
              >
                Discover
              </button>
              <button
                onClick={() => onNavigateScreen('requests')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1 flex items-center gap-1.5"
                id="nav-tab-requests"
              >
                <span>Requests</span>
                <span className="w-2 h-2 rounded-full bg-[#f0b2aa]"></span>
              </button>
              <button
                onClick={() => onNavigateScreen('session-details')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-sessions"
              >
                My Sessions
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast('Notifications: Dr. Elena Vance accepted your research paper review request.')}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              title="Notifications"
              id="btn-nav-notifications"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
            </button>

            <button
              onClick={() => onOpenWalletModal && onOpenWalletModal()}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Academic Credit Ledger"
              id="btn-nav-wallet"
            >
              <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
            </button>

            {/* Profile Avatar & Label */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="View & Edit Scholar Profile"
              id="nav-user-profile-btn"
            >
              <span className="hidden sm:inline text-xs font-semibold text-white/90 group-hover:text-white">
                Profile
              </span>
              <div className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN DISCOVER CONTAINER */}
      <div className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-7 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: SEARCH FILTERS SIDEBAR (framed with soft pastel blush background) */}
        <aside
          className="w-full md:w-64 lg:w-72 shrink-0 bg-[#fdf3f0] border border-[#eedfdc] rounded-2xl p-5 flex flex-col justify-between shadow-xs self-start"
          id="sidebar-search-filters"
        >
          <div className="space-y-6">
            {/* Sidebar Title */}
            <div>
              <h2 className="text-xs font-bold text-[#5c4a55] uppercase tracking-wider">
                SEARCH FILTERS
              </h2>
            </div>

            {/* Filter Section: Field / Topic Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#66545f] block">
                Field
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'data-science', label: 'Data Science' },
                  { id: 'academic-writing', label: 'Academic Writing' },
                  { id: 'uiux-design', label: 'UI/UX Design' },
                  { id: 'microeconomics', label: 'Microeconomics' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#3b2e38] select-none hover:text-[#22162e] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selectedFields[item.label])}
                      onChange={() => handleFieldToggle(item.label)}
                      className="w-4 h-4 rounded border-[#c9b7be] text-[#473b4b] focus:ring-[#473b4b] accent-[#473b4b] cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Minimum Rating */}
            <div className="space-y-2.5 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#473b4b] gap-0.5 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => {
                        setMinRating(star);
                        onShowToast(`Filter set: ${star}.0+ star rating`);
                      }}
                      className={`material-symbols-outlined text-[18px] transition-transform hover:scale-110 ${
                        star <= Math.floor(minRating) ? 'fill text-[#473b4b]' : 'text-[#c2b2b9]'
                      }`}
                      style={{ fontVariationSettings: star <= Math.floor(minRating) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#473b4b]">
                  {minRating.toFixed(1)}+
                </span>
              </div>
            </div>

            {/* Filter Section: Availability Dropdown */}
            <div className="space-y-2 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Availability
              </label>
              <div className="relative">
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-white border border-[#ddcbca] text-xs text-[#201a1b] font-medium rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-[#473b4b] cursor-pointer shadow-2xs"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="Today">Available Today</option>
                  <option value="This Week">This Week</option>
                  <option value="Weekends">Weekends Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#776670] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter Section: Academic Level Dropdown */}
            <div className="space-y-2 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Academic Level
              </label>
              <div className="relative">
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full bg-white border border-[#ddcbca] text-xs text-[#201a1b] font-medium rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-[#473b4b] cursor-pointer shadow-2xs"
                >
                  <option value="PhD Candidate">PhD Candidate</option>
                  <option value="Master's Student">Master's Student</option>
                  <option value="Undergraduate Senior">Undergraduate Senior</option>
                  <option value="Postdoctoral Researcher">Postdoctoral Researcher</option>
                  <option value="Any Level">All Academic Levels</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#776670] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Sidebar Action Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={handleFindPeerCTA}
              className="w-full py-3 bg-[#4b3c4a] hover:bg-[#382b37] text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              id="btn-find-peer-sidebar"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Find a Peer</span>
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: EXPLORE KNOWLEDGE PEERS MAIN CATALOG */}
        <main className="flex-1 flex flex-col justify-between" id="main-peer-catalog">
          <div className="space-y-6">
            
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight">
                Explore Knowledge Peers
              </h1>
            </div>

            {/* Search Input Bar with embedded mauve Search button */}
            <div className="relative flex items-center">
              <div className="w-full bg-white border border-[#e4d4d1] rounded-2xl pl-11 pr-28 py-3 shadow-xs flex items-center focus-within:border-[#473b4b] focus-within:ring-2 focus-within:ring-[#473b4b]/10 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-[#8a7a83] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search for skills like 'Quantitative Research', 'Python', or 'Medieval History'..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#201a1b] placeholder-[#9a8b93] focus:outline-none"
                  id="input-peer-search"
                />
              </div>
              <button
                onClick={() => {
                  onShowToast(`Filtered for: "${searchQuery || 'All peers'}"`);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#bda7c5] hover:bg-[#a991b3] text-[#2c1d30] rounded-xl text-xs font-bold transition-colors shadow-2xs"
                id="btn-search-action"
              >
                Search
              </button>
            </div>

            {/* Trending Tags Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#705e69] mr-1 select-none">
                Trending:
              </span>
              {trendingTags.map((tag) => {
                const isActive = activeTrendingTag === tag || searchQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#e49b8e] text-[#2f130f] font-bold shadow-2xs'
                        : 'bg-[#f7d6cd] hover:bg-[#f2c2b7] text-[#5e3831]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {(searchQuery || activeTrendingTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTrendingTag('');
                  }}
                  className="text-xs text-[#705e69] hover:text-[#201a1b] underline font-medium ml-2"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* REALTIME EMPTY STATE: no other Firestore users returned at all */}
            {realtime && liveScholars.length === 0 && (
              <div className="rounded-2xl border border-[#d9c4d6] bg-[#f7f1f8] p-5 text-center">
                <p className="text-sm font-semibold text-[#3e2f41]">No other scholars on SkillSwap yet</p>
                <p className="text-xs text-[#7a6880] mt-1">
                  Other accounts won't appear here until their profiles sync to Firestore.
                </p>
              </div>
            )}

            {/* LIVE SCHOLARS (real Firebase users — request sessions in realtime) */}
            {realtime && liveScholars.length > 0 && (
              <div className="rounded-2xl border border-[#d9c4d6] bg-[#f7f1f8] p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-emerald-500"></span>
                  </span>
                  <h2 className="text-sm font-bold text-[#3e2f41]">Live Scholars & Mentors</h2>
                  <span className="text-[11px] font-semibold text-[#7a6880] bg-white px-2 py-0.5 rounded-full border border-[#e2d3e0]">
                    Requests deliver in real time
                  </span>
                  {filteredLive.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#7a6880] px-2 py-0.5 rounded-full">
                      {filteredLive.length} result{filteredLive.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                {filteredLive.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#d9c4d6] rounded-2xl p-6 text-center">
                    <p className="text-sm font-semibold text-[#3e2f41]">No scholars match your filters</p>
                    <p className="text-xs text-[#7a6880] mt-1">
                      Try clearing the search box or relaxing your filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLive.map((person) => (
                    <div
                      key={person.id}
                      className="bg-white border border-[#e2d3e0] rounded-2xl p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#e2d3e0]"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#201a1b] truncate">
                            {person.name}
                          </h3>
                          <p className="text-[11px] text-[#705e69] truncate">{person.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(person.skillsTeach || []).slice(0, 3).map((sk, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[#f7d6cd] text-[#5e3831]"
                          >
                            {typeof sk === 'string' ? sk : sk?.name}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onRequestRealtime && onRequestRealtime(person)}
                        className="w-full py-2 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          calendar_add_on
                        </span>
                        <span>Request</span>
                      </button>
                      <button
                        onClick={() => onMessageMentor && onMessageMentor(person)}
                        className="w-full py-2 bg-[#eeddf2] hover:bg-[#e2c7e8] text-[#473b4b] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          chat_bubble
                        </span>
                        <span>Message</span>
                      </button>
                    </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* PEER CARDS 2x2 GRID (hidden in realtime — real scholars appear above) */}
            {!realtime && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2" id="peers-grid-container">
              {paginatedPeers.map((peer) => (
                <div
                  key={peer.id}
                  onClick={() => handleOpenPeer(peer)}
                  className="bg-white border border-[#ebd8d4] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#bfa8c7] transition-all flex flex-col justify-between group cursor-pointer"
                  id={`peer-card-${peer.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenPeer(peer);
                    }
                  }}
                >
                  <div>
                    {/* Top: Avatar, Name, Rating Badge & Title */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={peer.avatarUrl}
                            alt={peer.name}
                            referrerPolicy="no-referrer"
                            className="w-13 h-13 rounded-full object-cover border-2 border-[#eedfdc] shadow-2xs group-hover:border-[#473b4b] transition-colors"
                          />
                          {peer.isOnline ? (
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                              title="Online now for peer swap"
                            ></span>
                          ) : (
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"
                              title="Currently offline"
                            ></span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#201a1b] group-hover:text-[#473b4b] transition-colors leading-snug">
                            {peer.name}
                          </h3>
                          <p className="text-xs text-[#63535d] font-medium line-clamp-1 mt-0.5">
                            {peer.title}
                          </p>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-1 bg-[#fbf2ef] border border-[#edd7d2] px-2.5 py-1 rounded-lg shrink-0">
                        <span
                          className="material-symbols-outlined text-[15px] text-[#473b4b]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-xs font-bold text-[#201a1b]">
                          {peer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Specialized Skill Badges (Soft terracotta pills with uppercase text) */}
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      {peer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded bg-[#f7d6cd] text-[#5e3831]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Next availability & View Profile CTA */}
                  <div className="pt-3.5 border-t border-[#f4e7e4] flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#705f69]">
                      <span className="material-symbols-outlined text-[16px] text-[#8e7d87]">
                        schedule
                      </span>
                      <span>Next available: {peer.nextAvailable}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRequestModal(peer);
                        }}
                        className="px-3.5 py-2 bg-[#eeddf2] hover:bg-[#e2c7e8] text-[#47364d] rounded-xl text-xs font-bold tracking-wide transition-colors shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                        id={`btn-request-session-${peer.id}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          calendar_add_on
                        </span>
                        <span>Request Session</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPeer(peer);
                        }}
                        className="px-4 py-2 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold tracking-wide transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        id={`btn-view-profile-${peer.id}`}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if search returned zero matches */}
            {filteredPeers.length === 0 && (
              <div className="bg-white border border-[#ebd8d4] rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#fdf3f0] text-[#5e3831] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <h3 className="text-base font-bold text-[#201a1b]">No knowledge peers found</h3>
                <p className="text-xs text-[#705f69] max-w-md mx-auto">
                  Try adjusting your search terms or unchecking some filter fields to explore more verified scholars.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#473b4b] text-white rounded-xl text-xs font-bold hover:bg-[#342738] transition-colors inline-block mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
              </>
            )}
          </div>

          {/* 3. PAGINATION CONTROLS (dynamic, sized to the result set) */}
          {!realtime && (
            <div className="flex items-center justify-center gap-2 py-8 select-none" id="pagination-controls">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={effectivePage === 1}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {/* Page buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  effectivePage === page
                    ? 'bg-[#473b4b] text-white shadow-xs'
                    : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={effectivePage === totalPages}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
          )}
        </main>
      </div>

      {/* 4. FOOTER (Matching the soft warm blush footer with quick links & FAB button) */}
      <footer className="w-full bg-[#f4eae7] border-t border-[#eedfdc] py-5 mt-auto relative" id="discover-footer">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705f69]">
          <div>
            <span className="font-bold text-[#3e313f] block sm:inline">SkillSwap Academic</span>
            <span className="hidden sm:inline mx-2 text-[#bda7b2]">•</span>
            <span>© 2026 SkillSwap Academic. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <button
              onClick={() => onShowToast('Institutional Privacy & Academic Integrity Policy')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('SkillSwap Academic Terms of Service')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('Participating Universities: UIU, Stanford, MIT, Harvard, Oxford, BUET')}
              className="hover:text-[#201a1b] transition-colors"
            >
              University Partners
            </button>
            <button
              onClick={() => onShowToast('Contact Academic Support: support@skillswap.edu')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Floating Action Button (FAB) at bottom-right */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => {
              handleOpenRequestModal(allPeers[0]);
            }}
            className="w-12 h-12 rounded-2xl bg-[#c5b3d3] hover:bg-[#b39dc3] text-[#2c1d30] shadow-lg flex items-center justify-center text-2xl font-bold transition-transform active:scale-95 border border-white/40"
            title="Create / Request a Skill Swap"
            id="fab-create-swap"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>
      </footer>

      {/* DYNAMIC REQUEST SESSION MODAL IN DISCOVER */}
      {requestingPeer && (
        <RequestPeerModal
          peer={requestingPeer}
          topic={reqTopic}
          onTopicChange={setReqTopic}
          slot={reqSlot}
          onSlotChange={setReqSlot}
          offeredSkill={reqOfferedSkill}
          onOfferedSkillChange={setReqOfferedSkill}
          note={reqNote}
          onNoteChange={setReqNote}
          onSubmit={handleConfirmDiscoverSession}
          onViewProfile={() => {
            handleOpenPeer(requestingPeer);
            setRequestingPeer(null);
          }}
          onClose={() => setRequestingPeer(null)}
        />
      )}
    </div>
  );
};