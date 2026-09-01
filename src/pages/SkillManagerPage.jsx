import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const SkillManagerPage = ({
  onNavigateScreen,
  onOpenMentorModal,
  onOpenMeetingModal,
  onOpenWalletModal,
  onShowToast,
  userProfile: propProfile,
  onSaveProfileSkills,
}) => {
  const { currentUser, userProfile: authProfile, logOut } = useAuth();
  const userProfile = authProfile || propProfile || {};

  // Active top navigation tab
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [activeSidebarItem, setActiveSidebarItem] = useState('skill-manager');

  // Skills I Teach state
  const [skillsTeach, setSkillsTeach] = useState([
    'Python Data Science',
    'Academic Writing',
    'Statistical Analysis',
  ]);
  const [teachInput, setTeachInput] = useState('');

  // Skills I Want state
  const [skillsWant, setSkillsWant] = useState([
    'UI/UX Design',
    'Spanish B2',
  ]);
  const [wantInput, setWantInput] = useState('');

  // Suggested for Your Profile
  const [suggestedSkills, setSuggestedSkills] = useState([
    'Research Methodology',
    'R Programming',
    'Latex Formatting',
    'Deep Learning',
    'Econometrics',
  ]);

  // Popular Exchanges
  const [popularExchanges, setPopularExchanges] = useState([
    'Machine Learning',
    'Public Speaking',
    'Financial Modeling',
    'Cloud Architecture',
    'Bioinformatics',
  ]);

  // Matches Activity dataset
  const [recentMatches, setRecentMatches] = useState([
    {
      id: 'match-1',
      name: 'Prof. Julian V.',
      title: 'PhD Scholar & Language Tutor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      matchesSkill: 'Spanish B2',
      quote: 'I can help you master academic Spanish while you help me with my Python data pipeline.',
      compatibility: 98,
      isOnline: true,
      institution: 'Stanford Language Center',
      hourlyCredits: 1.0,
      skills: ['SPANISH B2', 'CRITICAL THEORY', 'EDITING'],
    },
    {
      id: 'match-2',
      name: 'Sarah Chen',
      title: 'Senior UI/UX Researcher',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
      matchesSkill: 'UI/UX',
      quote: 'Looking to transition from Psychology to Design. I can teach Figma & UX research methodologies.',
      compatibility: 95,
      isOnline: true,
      institution: 'HCI Institute',
      hourlyCredits: 1.0,
      skills: ['USER RESEARCH', 'FIGMA', 'UI/UX DESIGN'],
    },
  ]);

  // Add / Remove Handlers for "Skills I Teach"
  const handleAddTeachSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || teachInput).trim();
    if (!trimmed) return;
    if (skillsTeach.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onShowToast(`"${trimmed}" is already in your teaching list.`);
      setTeachInput('');
      return;
    }
    setSkillsTeach((prev) => [...prev, trimmed]);
    setTeachInput('');
    onShowToast(`Added "${trimmed}" to Skills I Teach`);
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setSkillsTeach((prev) => prev.filter((s) => s !== skillToRemove));
    onShowToast(`Removed "${skillToRemove}"`);
  };

  // Add / Remove Handlers for "Skills I Want"
  const handleAddWantSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || wantInput).trim();
    if (!trimmed) return;
    if (skillsWant.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onShowToast(`"${trimmed}" is already in your learning wishlist.`);
      setWantInput('');
      return;
    }
    setSkillsWant((prev) => [...prev, trimmed]);
    setWantInput('');
    onShowToast(`Added "${trimmed}" to Skills I Want`);
  };

  const handleRemoveWantSkill = (skillToRemove) => {
    setSkillsWant((prev) => prev.filter((s) => s !== skillToRemove));
    onShowToast(`Removed "${skillToRemove}"`);
  };

  // Discard Changes
  const handleDiscard = () => {
    setSkillsTeach(['Python Data Science', 'Academic Writing', 'Statistical Analysis']);
    setSkillsWant(['UI/UX Design', 'Spanish B2']);
    onShowToast('Changes discarded.');
  };

  // Save Skills
  const handleSave = () => {
    if (onSaveProfileSkills) {
      onSaveProfileSkills({
        skillsTeach,
        skillsWant,
      });
    }
    onShowToast('✨ Skill profile successfully updated and synchronized!');
  };

  const handleProposeSwap = (match) => {
    if (onOpenMentorModal) {
      onOpenMentorModal({
        id: match.id,
        name: match.name,
        title: match.title,
        field: match.matchesSkill,
        institution: match.institution,
        rating: 4.9,
        reviewsCount: 42,
        avatarUrl: match.avatarUrl,
        isOnline: match.isOnline,
        badges: match.skills,
        hourlyRateCredits: match.hourlyCredits,
        bio: match.quote,
      });
    } else {
      onShowToast(`Initiating swap proposal with ${match.name}`);
    }
  };

  const userAvatar =
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80';

  const userRole = userProfile?.academicLevel || 'PhD Candidate';

  return (
    <div id="screen-skill-manager" className="min-h-screen bg-[#fcf5f3] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 w-full h-[64px] bg-[#4a3b47] shadow-sm z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1400px] mx-auto h-full">
          {/* Brand & Nav items */}
          <div className="flex items-center gap-8">
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-xl sm:text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
              id="skill-manager-brand-logo"
            >
              SkillSwap
            </span>

            <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors py-1"
                id="skill-manager-nav-dashboard"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="text-white/80 hover:text-white transition-colors py-1"
                id="skill-manager-nav-search"
              >
                SEARCH
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast('Notifications: 2 new skill match recommendations.')}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              title="Notifications"
              id="btn-nav-skill-notifs"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
            </button>

            <button
              onClick={() => onShowToast('Academic Messages & Exchange Inquiries')}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Messages"
              id="btn-nav-skill-mail"
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </button>

            {/* Profile Avatar */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="View & Edit Scholar Profile"
              id="nav-skill-user-profile"
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors relative">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN APP CONTAINER */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR (Pale pink/blush background #fcf0ee matching exact screenshot) */}
        <aside
          className="w-full md:w-56 lg:w-60 shrink-0 bg-[#fdf2f0] border-r border-[#eddcd8] p-5 flex flex-col justify-between"
          id="skill-manager-sidebar"
        >
          <div className="space-y-6">
            
            {/* Start New Swap Action Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onShowToast('Creating a new intellectual exchange proposal...');
                  if (onOpenMentorModal && recentMatches[0]) {
                    handleProposeSwap(recentMatches[0]);
                  }
                }}
                className="w-full py-3 px-4 bg-[#574654] hover:bg-[#433541] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center text-center leading-normal active:scale-[0.98]"
                id="btn-sidebar-start-swap"
              >
                Start New Swap
              </button>
            </div>

            {/* Main Sidebar Navigation Menu Items */}
            <nav className="space-y-1.5 pt-2">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#65525e] hover:bg-[#f6e1dc] hover:text-[#201a1b] rounded-xl transition-colors text-left"
                id="menu-item-overview"
              >
                <span className="material-symbols-outlined text-[18px] text-[#7d6a77]">
                  grid_view
                </span>
                <span>Overview</span>
              </button>

              {/* Active Skill Manager Nav Tab (with highlighted soft box & dark border) */}
              <button
                onClick={() => setActiveSidebarItem('skill-manager')}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#2d1c2b] bg-[#ecd8d5] border border-[#d6beba] rounded-xl shadow-2xs text-left"
                id="menu-item-skill-manager"
              >
                <span className="material-symbols-outlined text-[18px] text-[#4a3b47]">
                  school
                </span>
                <span>Skill<br className="sm:hidden" /> Manager</span>
              </button>

              <button
                onClick={() => {
                  onShowToast('Session Requests: 2 pending peer inquiries');
                  onNavigateScreen('dashboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#65525e] hover:bg-[#f6e1dc] hover:text-[#201a1b] rounded-xl transition-colors text-left"
                id="menu-item-session-requests"
              >
                <span className="material-symbols-outlined text-[18px] text-[#7d6a77]">
                  forum
                </span>
                <span>Session Requests</span>
              </button>

              <button
                onClick={() => onShowToast('Showing historical skill exchange transcripts')}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#65525e] hover:bg-[#f6e1dc] hover:text-[#201a1b] rounded-xl transition-colors text-left"
                id="menu-item-history"
              >
                <span className="material-symbols-outlined text-[18px] text-[#7d6a77]">
                  history
                </span>
                <span>History</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Settings & Support */}
          <div className="pt-6 border-t border-[#ecd9d5] space-y-1.5">
            <button
              onClick={() => onNavigateScreen('profile-setup')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#65525e] hover:bg-[#f6e1dc] hover:text-[#201a1b] rounded-xl transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-[#7d6a77]">
                settings
              </span>
              <span>Settings</span>
            </button>
            <button
              onClick={() => onShowToast('UIU & Academic Exchange Support: support@skillswap.edu')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#65525e] hover:bg-[#f6e1dc] hover:text-[#201a1b] rounded-xl transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-[#7d6a77]">
                help
              </span>
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 p-6 sm:p-9 space-y-8 overflow-y-auto" id="main-skill-manager-content">
          
          {/* Header Title & Subtext */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight">
              Skill Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#6c5965] max-w-2xl font-normal leading-relaxed">
              Curate your intellectual exchange profile. Define what you bring to the table and what you aim to master next.
            </p>
          </div>

          {/* 2-CARD GRID: "Skills I Teach" and "Skills I Want" */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT CARD: SKILLS I TEACH */}
            <div className="space-y-3">
              {/* Card Header Label + Count Badge */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#fae8e5] text-[#574654] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#201a1b]">Skills I Teach</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#7c6975] bg-[#fae8e5] px-2.5 py-0.5 rounded-full">
                  {skillsTeach.length} Added
                </span>
              </div>

              {/* White Container Box */}
              <div className="bg-white border border-[#edd8d4] rounded-2xl p-5 shadow-xs space-y-5 min-h-[300px] flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Field Label */}
                  <label className="text-xs font-bold text-[#453742] block">
                    Add a Skill
                  </label>

                  {/* Input Search Box */}
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#9a8992] text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={teachInput}
                      onChange={(e) => setTeachInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTeachSkill();
                        }
                      }}
                      placeholder="Search Coding, Humanities, Sciences..."
                      className="w-full bg-white border border-[#e2d0cd] rounded-xl pl-10 pr-16 py-2.5 text-xs text-[#201a1b] placeholder-[#9a8992] focus:outline-none focus:border-[#574654] focus:ring-1 focus:ring-[#574654]/20 transition-all"
                      id="input-teach-skill"
                    />
                    {teachInput.trim() && (
                      <button
                        onClick={() => handleAddTeachSkill()}
                        className="absolute right-2 px-2.5 py-1 bg-[#574654] text-white text-[11px] font-bold rounded-lg hover:bg-[#433541] transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>

                  {/* Selected Skill Tags (Terracotta/Blush rounded pills with 'x' button) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillsTeach.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 bg-[#fbe7e3] text-[#553b37] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#f3d4cd] group transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9e6f67]"></span>
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveTeachSkill(skill)}
                          className="text-[#9e6f67] hover:text-[#553b37] hover:bg-[#f2cdc5] rounded-full p-0.5 transition-colors ml-0.5"
                          title={`Remove ${skill}`}
                        >
                          <span className="material-symbols-outlined text-[13px] block">close</span>
                        </button>
                      </span>
                    ))}
                    {skillsTeach.length === 0 && (
                      <p className="text-xs text-[#9a8992] italic py-2">
                        No teaching skills added yet. Search or click recommendations below.
                      </p>
                    )}
                  </div>
                </div>

                {/* SUGGESTED FOR YOUR PROFILE */}
                <div className="pt-4 border-t border-[#f4e8e5] space-y-2.5">
                  <span className="text-[10px] font-bold text-[#867480] uppercase tracking-wider block">
                    SUGGESTED FOR YOUR PROFILE
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddTeachSkill(skill)}
                        className="text-xs font-medium bg-white hover:bg-[#fae8e5] text-[#574654] border border-[#e6d3cf] hover:border-[#574654] px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>+</span>
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARD: SKILLS I WANT */}
            <div className="space-y-3">
              {/* Card Header Label + Count Badge */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#fae8e5] text-[#574654] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  </div>
                  <h2 className="text-sm font-bold text-[#201a1b]">Skills I Want</h2>
                </div>
                <span className="text-[11px] font-semibold text-[#7c6975] bg-[#fae8e5] px-2.5 py-0.5 rounded-full">
                  {skillsWant.length} Added
                </span>
              </div>

              {/* White Container Box */}
              <div className="bg-white border border-[#edd8d4] rounded-2xl p-5 shadow-xs space-y-5 min-h-[300px] flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Field Label */}
                  <label className="text-xs font-bold text-[#453742] block">
                    Search Learning Path
                  </label>

                  {/* Input Search Box with sparkle / auto-suggest icon */}
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#9a8992] text-[18px]">
                      auto_awesome
                    </span>
                    <input
                      type="text"
                      value={wantInput}
                      onChange={(e) => setWantInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWantSkill();
                        }
                      }}
                      placeholder="What would you like to learn?"
                      className="w-full bg-white border border-[#e2d0cd] rounded-xl pl-10 pr-16 py-2.5 text-xs text-[#201a1b] placeholder-[#9a8992] focus:outline-none focus:border-[#574654] focus:ring-1 focus:ring-[#574654]/20 transition-all"
                      id="input-want-skill"
                    />
                    {wantInput.trim() && (
                      <button
                        onClick={() => handleAddWantSkill()}
                        className="absolute right-2 px-2.5 py-1 bg-[#574654] text-white text-[11px] font-bold rounded-lg hover:bg-[#433541] transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>

                  {/* Selected Want Tags (Soft lavender / grayish lilac pills with star/dot and close button) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillsWant.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 bg-[#efe7f2] text-[#4b3c4f] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#ded2e3] group transition-all"
                      >
                        <span className="text-[10px] text-[#735b7a]">★</span>
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveWantSkill(skill)}
                          className="text-[#735b7a] hover:text-[#4b3c4f] hover:bg-[#e2d3e8] rounded-full p-0.5 transition-colors ml-0.5"
                          title={`Remove ${skill}`}
                        >
                          <span className="material-symbols-outlined text-[13px] block">close</span>
                        </button>
                      </span>
                    ))}
                    {skillsWant.length === 0 && (
                      <p className="text-xs text-[#9a8992] italic py-2">
                        No desired skills added. Choose from popular exchanges below.
                      </p>
                    )}
                  </div>
                </div>

                {/* POPULAR EXCHANGES */}
                <div className="pt-4 border-t border-[#f4e8e5] space-y-2.5">
                  <span className="text-[10px] font-bold text-[#867480] uppercase tracking-wider block">
                    POPULAR EXCHANGES
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {popularExchanges.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleAddWantSkill(skill)}
                        className="text-xs font-medium bg-white hover:bg-[#f3edf6] text-[#574654] border border-[#e2d5e6] hover:border-[#574654] px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>+</span>
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RECENT ACTIVITY & MATCHES SECTION */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#201a1b]">
                Recent Activity & Matches
              </h2>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="text-xs font-semibold text-[#6c5965] hover:text-[#201a1b] transition-colors"
                id="btn-view-all-matches"
              >
                View All Matches
              </button>
            </div>

            {/* 3-COLUMN MATCHES CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* MATCH CARD 1: Prof. Julian V. */}
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-white border border-[#edd8d4] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#cfb3be] transition-all flex flex-col justify-between space-y-4"
                  id={`match-card-${match.id}`}
                >
                  <div className="space-y-3">
                    {/* Top: Avatar, Name & Matches Badge */}
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={match.avatarUrl}
                          alt={match.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-full object-cover border border-[#ecd9d5]"
                        />
                        {match.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-[#201a1b] truncate">
                          {match.name}
                        </h3>
                        <p className="text-[11px] text-[#786571] truncate font-medium">
                          Matches your skill: <span className="font-bold text-[#453742]">{match.matchesSkill}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quote statement */}
                    <p className="text-xs text-[#52444e] italic leading-relaxed line-clamp-3">
                      "{match.quote}"
                    </p>
                  </div>

                  {/* Bottom: Compatibility % & Send Message / Swap proposal CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f7eae7]">
                    <span className="text-[11px] font-bold text-[#553b37] bg-[#fbf0ed] px-2 py-0.5 rounded-md border border-[#eddcd8]">
                      {match.compatibility}% Compatibility
                    </span>

                    <button
                      onClick={() => handleProposeSwap(match)}
                      className="w-8 h-8 rounded-full bg-[#f1e5f4] hover:bg-[#574654] text-[#574654] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                      title="Propose Skill Swap"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* CARD 3: Dotted Empty Action Box "Broaden your search parameters / Edit Preferences" */}
              <div
                onClick={() => {
                  onShowToast('Navigating to Discover filter directory...');
                  onNavigateScreen('discover');
                }}
                className="border-2 border-dashed border-[#d8c3bf] hover:border-[#574654] rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-2 bg-[#fdf5f3]/60 hover:bg-[#fbf0ed] transition-all cursor-pointer min-h-[160px]"
                id="box-broaden-preferences"
              >
                <div className="w-9 h-9 rounded-full bg-white border border-[#e5d4d0] text-[#7c6975] flex items-center justify-center shadow-2xs">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#352833]">
                    Broaden your search parameters
                  </p>
                  <p className="text-[11px] text-[#7c6975] font-semibold underline">
                    Edit Preferences
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM ACTION BUTTONS (Discard Changes / Save Skills) */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#edd8d4]" id="skill-manager-bottom-actions">
            <button
              onClick={handleDiscard}
              className="text-xs font-semibold text-[#6c5965] hover:text-[#201a1b] px-4 py-2.5 transition-colors"
              id="btn-discard-skills"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#574654] hover:bg-[#433541] text-white rounded-2xl text-xs font-bold tracking-wide transition-all shadow-sm active:scale-[0.98]"
              id="btn-save-skills"
            >
              Save Skills
            </button>
          </div>

        </main>
      </div>

    </div>
  );
};
