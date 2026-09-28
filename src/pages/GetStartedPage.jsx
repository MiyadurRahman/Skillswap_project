import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { AvatarImage } from '../component/AvatarImage';

export const GetStartedPage = ({
  onNavigateToSignUp,
  onNavigateToLogin,
  onNavigateToPrivacy,
  onNavigateToTerms,
  realtime = false,
  realtimeUsers = [],
}) => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(0);

  // Live Firestore scholars (display only). Never includes the signed-in
  // viewer's own profile.
  const liveScholars = realtime
    ? realtimeUsers.filter((u) => u.uid && u.name && u.uid !== currentUser?.uid)
    : [];

  // Hero "Live Peer Exchange" card shows the first two live scholars.
  const livePeerCards = liveScholars.slice(0, 2);

  const liveSkillLine = (u) =>
    u.skillsTeach?.[0] || u.badges?.[0] || u.title || 'Academic Peer Exchange';

  // Category keyword heuristics so the filter pills still work on live cards.
  const CATEGORY_KEYWORDS = {
    cs: ['computer', 'programming', 'software', 'algorithm', 'data ', 'database', 'c++', 'python', 'java', 'javascript', 'machine learning', 'artificial intelligence', 'sql', 'web', 'cryptography', 'system design'],
    math: ['math', 'statistics', 'calculus', 'algebra', 'probability', 'econometrics', 'linear algebra'],
    bio: ['bio', 'biotech', 'genetics', 'genomics', 'biology', 'dna'],
    eng: ['engineering', 'robotics', 'embedded', 'control', 'mechatronics', 'ros', 'mechanics'],
  };

  const deriveCategory = (u) => {
    const hay = [u.title, u.academicLevel, ...(u.skillsTeach || []), ...(u.badges || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    for (const cat of ['cs', 'math', 'bio', 'eng']) {
      if (CATEGORY_KEYWORDS[cat].some((kw) => hay.includes(kw))) return cat;
    }
    return 'all';
  };

  // Directory preview cards use live scholar profiles only.
  const liveSkillCards = liveScholars.slice(0, 4).map((u, idx) => ({
    id: `live-${idx}-${u.uid}`,
    category: deriveCategory(u),
    title: u.skillsTeach?.[0] || u.badges?.[0] || u.title || 'Academic Peer Exchange',
    mentorName: u.name,
    university: u.university || 'University Scholar',
    tags: (u.badges && u.badges.length ? u.badges : u.skillsTeach || []).slice(0, 3),
    rating: u.rating ?? 0,
    reviewsCount: u.reviewsCount ?? u.completedSwaps ?? 0,
    avatarUrl: u.avatarUrl,
    status: u.isOnline ? 'Online' : 'Offline',
  }));

  const categories = [
    { id: 'all', label: 'All Fields', icon: 'auto_stories' },
    { id: 'cs', label: 'Computer Science', icon: 'terminal' },
    { id: 'math', label: 'Applied Math', icon: 'functions' },
    { id: 'bio', label: 'Bio Sciences', icon: 'biotech' },
    { id: 'eng', label: 'Engineering', icon: 'precision_manufacturing' },
  ];

  const faqs = [
    {
      q: 'How does the Time Credit economy work?',
      a: 'The credits agreed in a request transfer only after both participants confirm the session is complete. You can spend earned credits on another peer session.',
    },
    {
      q: 'What if my university is not listed?',
      a: 'Enter your university name in your profile. No university partnership is required to use the scholar directory.',
    },
    {
      q: 'Can I exchange skills across different departments?',
      a: 'Yes! A Computer Science student can tutor an Economics student in Python or SQL, and in return receive tutoring in Econometrics or Macroeconomics.',
    },
    {
      q: 'Can I connect with scholars from other universities?',
      a: 'Profiles can include a university name, and signed-in scholars can browse other profiles in the directory.',
    },
    {
      q: 'How do peer sessions take place?',
      a: 'Accepted requests include the meeting link and shared session notes. Credits transfer only after both participants confirm completion.',
    },
  ];

  const displayedCards = realtime ? liveSkillCards : [];

  const filteredSkills =
    selectedCategory === 'all'
      ? displayedCards
      : displayedCards.filter((s) => s.category === selectedCategory);

  return (
    <div id="screen-get-started" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-[#4e4353]/95 backdrop-blur-md shadow-sm border-b border-[#ccc4cd]/20">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#675975] to-[#c5b3d3] flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold text-[#c5b3d3] tracking-tight block leading-none truncate">
                SkillSwap
              </span>
              <span className="hidden min-[360px]:block text-[9px] sm:text-[10px] text-white/75 font-semibold tracking-wider uppercase truncate mt-0.5">
                Academic Exchange
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="header-btn-login"
              type="button"
              onClick={onNavigateToLogin}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer whitespace-nowrap min-h-[38px] flex items-center"
            >
              Sign In
            </button>
            <button
              id="header-btn-get-started"
              type="button"
              onClick={onNavigateToSignUp}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 min-h-[38px]"
            >
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Get Started</span>
              <span className="material-symbols-outlined text-[16px] hidden min-[360px]:inline-block">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-12 pb-14 lg:py-20 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#c5b3d3]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-5 right-10 w-96 h-96 bg-[#ffdada]/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d2c0e0] text-[#52445f] text-[11px] sm:text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">sync_alt</span>
              <span className="truncate">Peer skill exchange</span>
            </div>

            <h1 className="text-[2rem] sm:text-5xl lg:text-[54px] font-extrabold text-[#201a1b] tracking-tight leading-[1.12]">
              Exchange academic skills.{' '}
              <span className="text-[#675975] relative inline-block">
                Use time credits.
                <span className="absolute left-0 bottom-1 w-full h-2.5 bg-[#c5b3d3]/45 -z-10 rounded-sm"></span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#4a454c] leading-relaxed max-w-xl">
              Connect with scholars to exchange tutoring and research skills. Earn time credits by teaching, then use your balance to request sessions with other scholars.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                id="hero-btn-register"
                type="button"
                onClick={onNavigateToSignUp}
                className="px-8 py-3.5 bg-[#675975] hover:bg-[#52445f] text-white font-bold text-sm sm:text-base rounded-full shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started — It's Free</span>
                <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 bg-white hover:bg-[#f7effa] text-[#52445f] font-semibold text-sm rounded-full border border-[#ccc4cd]/70 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] text-[#675975]">login</span>
                <span>Sign In to Account</span>
              </button>

            </div>

            {/* Metrics Row */}
            <div className="pt-6 border-t border-[#ccc4cd]/40 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg overflow-hidden">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#675975]">Live</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">Scholar profiles</div>
              </div>
              <div className="border-l border-[#ccc4cd]/50 pl-2 sm:pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#675975]">1:1</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">Time-Credit Swap</div>
              </div>
              <div className="border-l border-[#ccc4cd]/50 pl-2 sm:pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">Credits</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">For completed sessions</div>
              </div>
            </div>
          </div>

          {/* Right Interactive Hero Card (Two-Way Skill Swap Match) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#ccc4cd]/50 space-y-4 relative z-10 ambient-lift">
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#ccc4cd]/30">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-[#201a1b] tracking-wide uppercase">
                    Peer profiles
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#efdbfd] text-[#4f415c] text-[11px] font-bold">
                  Sign in to browse
                </span>
              </div>

              {/* Live Scholar Feed (display only — not interactive) */}
              {livePeerCards.length > 0 ? (
                <>
                  {/* Scholar 1: Offering */}
                  <div className="p-3.5 bg-[#fcf9fc] rounded-2xl border border-[#eeddf2] pointer-events-none select-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <AvatarImage
                          src={livePeerCards[0].avatarUrl}
                          name={livePeerCards[0].name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#675975]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#201a1b]">{livePeerCards[0].name}</span>
                          </div>
                          <span className="text-[10px] text-[#675975] font-medium">{livePeerCards[0].university || 'University Scholar'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#ffdada] text-[#5c3f40] px-2 py-0.5 rounded-md font-bold uppercase">Skills</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-xl text-xs font-semibold text-[#201a1b] border border-[#ccc4cd]/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#675975]">school</span>
                      <span>{liveSkillLine(livePeerCards[0])}</span>
                    </div>
                  </div>

                  {/* Another current scholar profile, when available. */}
                  <div className="p-3.5 bg-[#fcf9fc] rounded-2xl border border-[#eeddf2] pointer-events-none select-none">
                    {livePeerCards[1] ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <AvatarImage
                              src={livePeerCards[1].avatarUrl}
                              name={livePeerCards[1].name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#c5b3d3]"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#201a1b]">{livePeerCards[1].name}</span>
                              </div>
                              <span className="text-[10px] text-[#675975] font-medium">{livePeerCards[1].university || 'University Scholar'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-[#efdbfd] text-[#4f415c] px-2 py-0.5 rounded-md font-bold uppercase">Skills</span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-xl text-xs font-semibold text-[#201a1b] border border-[#ccc4cd]/30 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#675975]">school</span>
                          <span>{liveSkillLine(livePeerCards[1])}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2.5 text-[#8c7b86] py-1">
                        <span className="material-symbols-outlined text-[22px]">hourglass_empty</span>
                        <div>
                          <div className="text-xs font-bold text-[#705e69]">Browse profiles after signing in</div>
                          <span className="text-[10px] font-medium">Profile data is available to signed-in scholars.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Neutral empty state when no live scholars are online */
                <div className="p-6 bg-[#fcf9fc] rounded-2xl border border-[#eeddf2] text-center space-y-2 pointer-events-none select-none">
                  <span className="material-symbols-outlined text-3xl text-[#b7a4b3] block mx-auto">groups</span>
                  <p className="text-xs font-bold text-[#705e69]">Sign in to browse scholar profiles</p>
                  <p className="text-[11px] text-[#8c7b86] max-w-[260px] mx-auto leading-relaxed">
                    Discover current profiles and skills after creating an account.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="w-full py-3 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
              >
                <span>Join Exchange Network</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Elevated 3-Step Flow) */}
      <section className="py-16 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#675975] uppercase tracking-wider bg-[#efdbfd] px-3 py-1 rounded-full">
            Simple 3-Step Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b]">
            How Academic Swapping Works
          </h2>
          <p className="text-xs sm:text-sm text-[#4a454c]">
            A transparent peer exchange system where everyone can teach and learn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#eeddf2] flex items-center justify-center text-[#675975]">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 01</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Publish Your Strengths</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              List the academic subjects, frameworks, or lab tools you feel confident teaching—like C++, LaTeX drafting, Calculus, or PyTorch.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">Algorithms</span>
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">LaTeX</span>
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">Python</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdada] flex items-center justify-center text-[#5c3f40]">
                <span className="material-symbols-outlined text-[24px]">sync_alt</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 02</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Mentor & Earn Credits</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              Host structured 1-on-1 collaborative sessions. The agreed credits transfer after both scholars confirm completion.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span>Credits transfer after both scholars confirm completion</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#efdbfd] flex items-center justify-center text-[#4f415c]">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 03</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Learn with Earned Credits</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              Use your available credits to request one-on-one coaching from other scholars.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#675975] bg-[#efdbfd] px-2.5 py-1 rounded-lg w-fit">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              <span>Confirm completion to settle credits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills / Mentors */}
      <section className="py-14 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#675975] uppercase tracking-wider">
              Discover Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] mt-1">
              Skills in the scholar directory
            </h2>
            <p className="text-xs sm:text-sm text-[#4a454c] mt-1">
              Sign in to browse current scholar profiles and the skills they offer.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-xs sm:text-sm font-bold text-[#675975] hover:text-[#3c2f47] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Browse Available Topics</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#675975] text-white shadow-md'
                  : 'bg-white text-[#52445f] border border-[#ccc4cd]/60 hover:bg-[#f7effa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 && (
          <div className="mb-6 rounded-2xl border border-dashed border-[#cbbdca] bg-white px-6 py-10 text-center">
            <span className="material-symbols-outlined text-3xl text-[#675975]">login</span>
            <h3 className="mt-2 text-sm font-bold text-[#201a1b]">Real scholar profiles require sign-in</h3>
            <p className="mt-1 text-xs text-[#706672]">Create an account to browse current skills, ratings, and availability.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-5 border border-[#ccc4cd]/50 shadow-xs hover:border-[#675975] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-extrabold text-[#675975] bg-[#eeddf2] px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {skill.category}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>{skill.rating}</span>
                    <span className="text-[10px] text-[#7b757d]">({skill.reviewsCount})</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#201a1b] leading-snug line-clamp-2 min-h-[40px]">
                  {skill.title}
                </h3>

                {/* Mentor Info */}
                <div className="flex items-center gap-2.5 pt-1">
                  <img
                    src={skill.avatarUrl}
                    alt={skill.mentorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#c5b3d3]"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#201a1b] block truncate">
                      {skill.mentorName}
                    </span>
                    <span className="text-[10px] text-[#7b757d] block truncate">
                      {skill.university}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-[#fff8f7] text-[#4a454c] px-2 py-0.5 rounded-md border border-[#ccc4cd]/40 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-[#ccc4cd]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7b757d] block uppercase font-bold">Session terms</span>
                  <span className="text-xs font-extrabold text-[#675975]">Shown in each request</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="px-3 py-1.5 bg-[#f7effa] hover:bg-[#675975] hover:text-white text-[#675975] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Request</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-8 max-w-[840px] mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-[#675975] uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b]">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-[#4a454c]">
            Everything you need to know about SkillSwap's peer-to-peer network.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#ccc4cd]/50 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-[#201a1b] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fff8f7] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#675975]"></span>
                    <span>{item.q}</span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] text-[#675975] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#4a454c] leading-relaxed border-t border-[#ccc4cd]/20 bg-[#fff8f7]/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 px-4 sm:px-8 bg-gradient-to-r from-[#4e4353] to-[#3c2f47] text-white text-center">
        <div className="max-w-[640px] mx-auto space-y-4">
          <span className="text-xs font-bold text-[#efdbfd] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
            Join the Peer Revolution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to exchange academic skills?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Create a real profile, list your skills, and connect with scholars who want to exchange knowledge.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="px-7 py-3 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-full border border-white/20 transition-colors cursor-pointer"
            >
              Scholar Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ebe0e0] w-full py-6 text-xs text-[#4a454c] border-t border-[#ccc4cd]/40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#675975]">SkillSwap Academic</span>
            <span className="text-[11px] text-[#7b757d]">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <button type="button" onClick={onNavigateToPrivacy} className="hover:text-[#675975] hover:underline">
              Privacy
            </button>
            <button type="button" onClick={onNavigateToTerms} className="hover:text-[#675975] hover:underline">
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default GetStartedPage;

