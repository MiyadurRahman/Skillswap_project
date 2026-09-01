import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const DiscoverPage = ({
  onNavigateScreen,
  onOpenMentorModal,
  onOpenMeetingModal,
  onOpenWalletModal,
  onShowToast,
  userProfile: propProfile,
}) => {
  const { currentUser, userProfile: authProfile, logOut } = useAuth();
  const userProfile = authProfile || propProfile || {};

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState('discover');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    'Data Science': false,
    'Academic Writing': true,
    'UI/UX Design': false,
    'Microeconomics': false,
  });
  const [minRating, setMinRating] = useState(4.0);
  const [availability, setAvailability] = useState('Anytime');
  const [academicLevel, setAcademicLevel] = useState('PhD Candidate');
  const [activeTrendingTag, setActiveTrendingTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Comprehensive dataset matching the exact screenshot plus more
  const allPeers = [
    {
      id: 'peer-1',
      name: 'Dr. Elena Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
      title: 'PhD Candidate in Neural Computing',
      rating: 4.9,
      reviewsCount: 48,
      skills: ['MACHINE LEARNING', 'PYTORCH', 'STATISTICS'],
      primaryField: 'Data Science',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Today, 4:00 PM',
      isOnline: true,
      institution: 'Stanford AI & Neural Computing Lab',
      bio: 'Postdoctoral researcher in neural dynamics and deep generative models. Available for paper reviews and PyTorch implementation.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-2',
      name: 'Julian Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      title: 'Master of Comparative Literature',
      rating: 4.7,
      reviewsCount: 32,
      skills: ['CRITICAL THEORY', 'EDITING', 'PHILOSOPHY'],
      primaryField: 'Academic Writing',
      academicLevel: 'Master\'s Student',
      nextAvailable: 'Wed, 10:00 AM',
      isOnline: false,
      institution: 'Department of Comparative Literature',
      bio: 'Graduate fellow in narrative structures and literary critique. Specializes in thesis editing and academic peer argumentation.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-3',
      name: 'Sarah K. Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
      title: 'Senior UI/UX Researcher',
      rating: 5.0,
      reviewsCount: 65,
      skills: ['USER RESEARCH', 'FIGMA', 'UT'],
      primaryField: 'UI/UX Design',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Tue, 2:00 PM',
      isOnline: true,
      institution: 'Human-Computer Interaction Institute',
      bio: 'Doctoral researcher focusing on usability testing methodologies and academic dashboard experience architectures.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-4',
      name: 'Markus Zhao',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
      title: 'Graduate Researcher, Robotics',
      rating: 4.8,
      reviewsCount: 41,
      skills: ['C++', 'ROS', 'REINFORCEMENT'],
      primaryField: 'Data Science',
      academicLevel: 'Graduate Researcher',
      nextAvailable: 'Today, 7:00 PM',
      isOnline: true,
      institution: 'Robotics & Autonomous Systems Lab',
      bio: 'Master\'s researcher working on ROS2 locomotion controllers and reinforcement learning algorithms for bipedal motion.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-5',
      name: 'Dr. Rafiqul Islam',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=240&auto=format&fit=crop&q=80',
      title: 'Assistant Professor, Algorithms & Discrete Math',
      rating: 4.95,
      reviewsCount: 112,
      skills: ['DYNAMIC PROGRAMMING', 'GRAPH THEORY', 'C++'],
      primaryField: 'Data Science',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Tomorrow, 2:00 PM',
      isOnline: true,
      institution: 'United International University (UIU)',
      bio: 'ICPC coach and algorithms educator. Passionate about helping students break down NP-complete problems and dynamic programming trees.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-6',
      name: 'Sofia Al-Mansoor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      title: 'DPhil Candidate in Quantitative Economics',
      rating: 4.92,
      reviewsCount: 39,
      skills: ['ECONOMETRICS', 'R PROGRAMMING', 'CAUSAL INFERENCE'],
      primaryField: 'Microeconomics',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Thursday, 3:30 PM',
      isOnline: false,
      institution: 'Oxford Department of Economics',
      bio: 'Empirical microeconomics researcher working on randomized control trials and econometric policy evaluations.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-7',
      name: 'Mahir Faisal',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      title: 'Graduate Researcher in NLP & Transformers',
      rating: 4.88,
      reviewsCount: 54,
      skills: ['TRANSFORMERS', 'PYTORCH', 'LATEX'],
      primaryField: 'Academic Writing',
      academicLevel: 'Master\'s Student',
      nextAvailable: 'Friday, 11:00 AM',
      isOnline: true,
      institution: 'UIU NLP Center',
      bio: 'Researcher in low-resource language processing, transformer distillation, and peer academic paper formatting.',
      hourlyCredits: 1.0,
    },
    {
      id: 'peer-8',
      name: 'Abrar Zahin',
      avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=240&auto=format&fit=crop&q=80',
      title: 'Systems & Cloud Infrastructure Engineer',
      rating: 4.85,
      reviewsCount: 78,
      skills: ['REACT', 'NODE.JS', 'DOCKER'],
      primaryField: 'Data Science',
      academicLevel: 'Undergraduate Senior',
      nextAvailable: 'Tomorrow, 5:00 PM',
      isOnline: true,
      institution: 'UIU Software Engineering Club',
      bio: 'Peer tutor in distributed systems, full-stack reactive design, and containerized research pipelines.',
      hourlyCredits: 1.0,
    },
  ];

  const trendingTags = [
    'Quantum Mechanics',
    'Digraphities',
    'Bioinformatics',
    'Machine Learning',
    'Academic Writing',
  ];

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTagClick = (tag) => {
    if (activeTrendingTag === tag) {
      setActiveTrendingTag('');
      setSearchQuery('');
    } else {
      setActiveTrendingTag(tag);
      setSearchQuery(tag);
      onShowToast(`Filtering peers for "${tag}"`);
    }
  };

  // Filter peers
  const filteredPeers = useMemo(() => {
    const activeCheckedFields = Object.keys(selectedFields).filter((k) => selectedFields[k]);

    return allPeers.filter((peer) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = peer.name.toLowerCase().includes(q);
        const matchesTitle = peer.title.toLowerCase().includes(q);
        const matchesSkills = peer.skills.some((s) => s.toLowerCase().includes(q));
        const matchesField = peer.primaryField.toLowerCase().includes(q);
        const matchesBio = peer.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesSkills && !matchesField && !matchesBio) {
          return false;
        }
      }

      // 2. Checked Fields (If any selected, must match at least one)
      if (activeCheckedFields.length > 0) {
        const matchesField = activeCheckedFields.includes(peer.primaryField);
        const matchesSkill = peer.skills.some((skill) =>
          activeCheckedFields.some((f) => skill.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!matchesField && !matchesSkill) {
          return false;
        }
      }

      // 3. Minimum Rating
      if (peer.rating < minRating) {
        return false;
      }

      // 4. Academic Level (if not set to "Any" or matches)
      if (academicLevel && academicLevel !== 'Any Level' && peer.academicLevel) {
        if (academicLevel === 'PhD Candidate' && !peer.academicLevel.includes('PhD') && !peer.title.includes('PhD')) {
          // allow close matches or strictly filter
        }
      }

      return true;
    });
  }, [allPeers, searchQuery, selectedFields, minRating, academicLevel]);

  // Paginated peers (4 per page to match exact 2x2 grid layout from screenshot)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredPeers.length / itemsPerPage) || 1;
  const paginatedPeers = filteredPeers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenPeer = (peer) => {
    if (onOpenMentorModal) {
      onOpenMentorModal({
        id: peer.id,
        name: peer.name,
        title: peer.title,
        field: peer.primaryField,
        institution: peer.institution,
        rating: peer.rating,
        reviewsCount: peer.reviewsCount,
        avatarUrl: peer.avatarUrl,
        isOnline: peer.isOnline,
        badges: peer.skills,
        hourlyRateCredits: peer.hourlyCredits,
        bio: peer.bio,
      });
    } else {
      onShowToast(`Viewing profile of ${peer.name}`);
    }
  };

  const handleFindPeerCTA = () => {
    onShowToast(`Found ${filteredPeers.length} verified academic peers matching your criteria.`);
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
          <div className="flex items-center gap-8">
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
                onClick={() => setActiveTab('discover')}
                className="text-white font-bold border-b-2 border-white pb-0.5 tracking-wide"
                id="nav-tab-discover"
              >
                Discover
              </button>
              <button
                onClick={() => {
                  onShowToast('Navigating to your scheduled academic exchange sessions');
                  onNavigateScreen('dashboard');
                }}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-sessions"
              >
                My Sessions
              </button>
              <button
                onClick={() => onShowToast('You have 2 pending peer exchange requests')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-requests"
              >
                Requests
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

            {/* PEER CARDS 2x2 GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2" id="peers-grid-container">
              {paginatedPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="bg-white border border-[#ebd8d4] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#cfb3be] transition-all flex flex-col justify-between group"
                  id={`peer-card-${peer.id}`}
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
                            className="w-13 h-13 rounded-full object-cover border-2 border-[#eedfdc] shadow-2xs"
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

                    <button
                      onClick={() => handleOpenPeer(peer)}
                      className="px-4 py-2 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold tracking-wide transition-colors shadow-2xs active:scale-95"
                      id={`btn-view-profile-${peer.id}`}
                    >
                      View Profile
                    </button>
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
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFields({
                      'Data Science': false,
                      'Academic Writing': true,
                      'UI/UX Design': false,
                      'Microeconomics': false,
                    });
                    setMinRating(4.0);
                  }}
                  className="px-4 py-2 bg-[#473b4b] text-white rounded-xl text-xs font-bold hover:bg-[#342738] transition-colors inline-block mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* 3. PAGINATION CONTROLS (matching < (1) 2 3 ... 12 >) */}
          <div className="flex items-center justify-center gap-2 py-8 select-none" id="pagination-controls">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {/* Page 1 */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 1
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 2
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 3
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              3
            </button>

            <span className="text-xs text-[#9a8992] px-1">...</span>

            {/* Page 12 */}
            <button
              onClick={() => setCurrentPage(12)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 12
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              12
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(12, p + 1))}
              disabled={currentPage === 12}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
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
              onShowToast('Requesting a peer skill swap session...');
              if (onOpenMentorModal) {
                onOpenMentorModal(allPeers[0]);
              }
            }}
            className="w-12 h-12 rounded-2xl bg-[#c5b3d3] hover:bg-[#b39dc3] text-[#2c1d30] shadow-lg flex items-center justify-center text-2xl font-bold transition-transform active:scale-95 border border-white/40"
            title="Create / Request a Skill Swap"
            id="fab-create-swap"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
