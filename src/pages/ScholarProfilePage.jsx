import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';
import { useReviews } from '../hooks/useReviews';
import { formatAcademicDate, toDateInput } from '../utils/dateUtils';

const PROFILE_SLOTS = [
  { value: `${toDateInput(2)}|03:00 PM`, label: `${formatAcademicDate(2, false)} · 3:00 PM – 4:00 PM` },
  { value: `${toDateInput(2)}|05:00 PM`, label: `${formatAcademicDate(2, false)} · 5:00 PM – 6:00 PM` },
  { value: `${toDateInput(4)}|11:00 AM`, label: `${formatAcademicDate(4, false)} · 11:00 AM – 12:00 PM` },
];

export const PublicProfilePage = ({
  onNavigateScreen,
  onOpenWalletModal,
  onShowToast,
  userProfile: currentLoggedProfile,
  profileData: customProfile,
  onCreateSession,
  onMessageMentor,
}) => {
  const { userProfile: authProfile } = useAuth();
  const activeUser = authProfile || currentLoggedProfile || {};

  // Message Dialog state (real chat is opened via the global drawer)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(PROFILE_SLOTS[0].value);
  const [offeredSkill, setOfferedSkill] = useState('Python Data Science');
  const [sessionTopic, setSessionTopic] = useState('Introduction to Behavioral Economics and Market Heuristics');

  // Reviews expansion state
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [requestSeed] = useState(Date.now);

  // Profile data defaults to Dr. Elena Vance matching exact uploaded screenshot
  const defaultElenaProfile = {
    id: 'elena-vance',
    name: 'Dr. Elena Vance',
    title: 'Senior Fellow in Behavioral Economics',
    rating: 4.9,
    reviewsCount: 124,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    isOnline: true,
    bio: 'With over 15 years in academic research and cross-disciplinary studies, I specialize in the intersection of cognitive psychology and market dynamics. My goal is to bridge the gap between theoretical frameworks and practical application through collaborative peer-to-peer exchange.',
    credentials: ['PhD from Oxford', 'Verified Scholar'],
    responseSpeed: 'Usually responds in 2h',
    skillsTeach: [
      'Behavioral Modeling',
      'Statistical Analysis (R)',
      'Game Theory',
      'Cognitive Bias Research',
      'Academic Writing',
    ],
    skillsWant: [
      'Advanced Python',
      'Machine Learning Basics',
      'Data Visualization',
      'Public Speaking',
    ],
    availability: 'Available: Tue, Thu, Sat',
    preferredMode: 'Preferred: Virtual / Zoom',
    swapsCount: 48,
    learnersCount: '2.1k',
    reviews: [
      {
        id: 'rev-1',
        name: 'Marcus Thorne',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        rating: 5,
        quote: "Elena's session on Game Theory was transformative. She has a way of making complex mathematical concepts feel intuitive. Looking forward to our next swap!",
        meta: 'Oct 14, 2024 • Swapped for Python Intro',
      },
      {
        id: 'rev-2',
        name: 'Dr. Sarah L.',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
        rating: 5,
        quote: "Fantastic collaboration. Her statistical analysis skills are top-notch. She really helped me refine my research paper methodology.",
        meta: 'Sep 28, 2024 • Swapped for Data Viz',
      },
      {
        id: 'rev-3',
        name: 'Prof. Julian V.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
        rating: 5,
        quote: 'Insightful exploration of stochastic choice theory. Highly recommended peer mentor for researchers preparing manuscript publications.',
        meta: 'Sep 12, 2024 • Swapped for Statistical Modeling',
      },
    ],
  };

  const profile = !customProfile
    ? defaultElenaProfile
    : {
      id: customProfile.id || defaultElenaProfile.id,
      name: customProfile.name || defaultElenaProfile.name,
      title: customProfile.title || defaultElenaProfile.title,
      rating: customProfile.rating || defaultElenaProfile.rating,
      reviewsCount: customProfile.reviewsCount || defaultElenaProfile.reviewsCount,
      avatarUrl: customProfile.avatarUrl || defaultElenaProfile.avatarUrl,
      isOnline: customProfile.isOnline !== undefined ? customProfile.isOnline : true,
      bio: customProfile.bio || defaultElenaProfile.bio,
      credentials: customProfile.credentials && customProfile.credentials.length > 0 ? customProfile.credentials : defaultElenaProfile.credentials,
      responseSpeed: customProfile.responseSpeed || defaultElenaProfile.responseSpeed,
      skillsTeach: customProfile.skillsTeach && customProfile.skillsTeach.length > 0 ? customProfile.skillsTeach : defaultElenaProfile.skillsTeach,
      skillsWant: customProfile.skillsWant && customProfile.skillsWant.length > 0 ? customProfile.skillsWant : defaultElenaProfile.skillsWant,
      availability: customProfile.availability || defaultElenaProfile.availability,
      preferredMode: customProfile.preferredMode || defaultElenaProfile.preferredMode,
      swapsCount: customProfile.swapsCount || defaultElenaProfile.swapsCount,
      learnersCount: customProfile.learnersCount || defaultElenaProfile.learnersCount,
      reviews: customProfile.reviews && customProfile.reviews.length > 0 ? customProfile.reviews : defaultElenaProfile.reviews,
      };

  const displayedReviews = showAllReviews ? profile.reviews : profile.reviews.slice(0, 2);

  // Live reviews for realtime Firestore profiles; demo profiles keep the
  // seeded review list.
  const reviewTargetUid = customProfile?.uid || customProfile?.id || null;
  const {
    reviews: liveReviews,
    count: liveCount,
    average: liveAverage,
    hasReviews,
  } = useReviews(reviewTargetUid);
  const isLiveProfile = Boolean(reviewTargetUid);

  const reviewsToShow = isLiveProfile
    ? (hasReviews
        ? liveReviews.map((r) => ({
            id: r.id,
            name: r.authorName || 'Scholar',
            avatarUrl: r.authorAvatar,
            rating: r.rating,
            quote: r.comment || 'No written comment.',
            meta: r.meta || 'Recent review',
          }))
        : [])
    : displayedReviews;

  const shownRating = isLiveProfile
    ? hasReviews
      ? liveAverage.toFixed(1)
      : 'New'
    : profile.rating.toFixed(1);
  const shownReviewCount = isLiveProfile ? (hasReviews ? liveCount : 0) : profile.reviewsCount;

  const handleSendSessionRequest = (e) => {
    e.preventDefault();
    setIsRequestModalOpen(false);

    const newSession = {
      id: `session-${requestSeed}`,
      title: sessionTopic || (profile.skillsTeach && profile.skillsTeach[0]) || 'Academic Peer Exchange',
      status: 'Accepted',
      description: `In-depth collaborative academic session on ${sessionTopic || (profile.skillsTeach && profile.skillsTeach[0]) || 'academic peer tutoring'}. Exchange focused on practical modeling and theoretical foundations.`,
      learningGoals: (profile.skillsTeach || ['Methodological Rigor', 'Statistical Modeling']).slice(0, 3).map((s) => `Master core foundations of ${s}`),
      duration: '90 Minutes',
      method: 'Video Call',
      platform: 'SkillSwap Connect',
      date: selectedSlot.split('|')[0],
      time: selectedSlot.split('|')[1] || '02:30 PM',
      partner: {
        id: profile.id,
        name: profile.name,
        title: profile.title,
        avatarUrl: profile.avatarUrl,
        isOnline: profile.isOnline,
        badges: (profile.skillsTeach || ['Peer Scholar']).slice(0, 2),
        skillsTeach: profile.skillsTeach || [],
        skillsWant: profile.skillsWant || [],
        rating: profile.rating,
        reviewsCount: profile.reviewsCount,
        credentials: profile.credentials || ['Verified Scholar'],
        responseSpeed: profile.responseSpeed || 'Usually responds in 2h',
        availability: profile.availability || 'Available on request',
        preferredMode: profile.preferredMode || 'SkillSwap Connect Video Call',
      },
      notes: [
        {
          id: `note-${requestSeed}`,
          authorName: profile.name,
          authorAvatar: profile.avatarUrl,
          timestamp: 'Just now',
          text: `Looking forward to our session! I'll share the preliminary reading materials and references for ${sessionTopic || profile.skillsTeach?.[0] || 'our discussion'} shortly.`,
        },
      ],
    };

    if (onCreateSession) {
      onCreateSession(newSession);
    } else {
      onShowToast(`✨ Session scheduled with ${profile.name}!`);
      onNavigateScreen('session-details');
    }
  };

  const userAvatar =
    activeUser?.avatarUrl ||
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80';

  return (
    <div id="screen-public-profile" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 w-full h-[68px] bg-[#3e313f] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1320px] mx-auto h-full">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#3e313f"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Discover', icon: 'explore', onClick: () => onNavigateScreen('discover') },
                { label: 'Requests', icon: 'inbox', onClick: () => onNavigateScreen('requests') },
                { label: 'My Sessions', icon: 'calendar_today', onClick: () => onNavigateScreen('session-details') },
                { label: 'Skill Manager', icon: 'school', onClick: () => onNavigateScreen('skill-manager') },
              ]}
            />
            <span
              onClick={() => onNavigateScreen('discover')}
              className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
              id="public-profile-brand-logo"
            >
              SkillSwap
            </span>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="public-nav-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateScreen('discover')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="public-nav-discover"
              >
                Discover
              </button>
              <button
                onClick={() => onNavigateScreen('requests')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1 flex items-center gap-1.5"
                id="public-nav-requests"
              >
                <span>Requests</span>
                <span className="w-2 h-2 rounded-full bg-[#f0b2aa]"></span>
              </button>
              <button
                onClick={() => onNavigateScreen('session-details')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="public-nav-sessions"
              >
                My Sessions
              </button>
            </nav>
          </div>

          {/* Right: Notification bell, ledger icon, and profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast('Notifications: 2 new skill match recommendations')}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              title="Notifications"
              id="btn-public-notifs"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
            </button>

            <button
              onClick={() => {
                if (onOpenWalletModal) onOpenWalletModal();
                else onShowToast('Academic Credit Ledger: 24.5 Hours Available');
              }}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Academic Ledger"
              id="btn-public-ledger"
            >
              <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
            </button>

            {/* Profile Avatar + Text */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="Profile Settings"
              id="btn-public-user-profile"
            >
              <div className="relative w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors">
                <img
                  src={userAvatar}
                  alt="My Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-white/90 group-hover:text-white hidden sm:inline">
                Profile
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb / Back button bar */}
      <div className="bg-[#fcf3f0] border-b border-[#eddcd8] px-4 sm:px-8 py-2.5">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={() => onNavigateScreen('discover')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65525e] hover:text-[#201a1b] transition-colors"
            id="btn-back-to-discover"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Discover Peers</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-[#7a6773] uppercase tracking-wider bg-white/70 px-2.5 py-0.5 rounded-full border border-[#ecd6d0]">
              Public Scholar Profile
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN APP CONTAINER */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-8" id="main-public-profile">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLUMNS: Bio, Badges, Skills & Peer Reviews */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Primary Profile Card */}
            <div className="bg-white rounded-3xl border border-[#ecd9d5] p-6 sm:p-8 shadow-xs relative" id="card-scholar-primary">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                
                {/* Large Circular Avatar with dark ring border & green online badge */}
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[3.5px] border-[#3e313f] shadow-xs">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {profile.isOnline && (
                    <span
                      className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                      title="Online for Academic Exchange"
                    ></span>
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0 space-y-3">
                  
                  {/* Top Row: Name and Rating pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight">
                      {profile.name}
                    </h1>

                    {/* Rating Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#fbf0ea] border border-[#f1ddd5] text-[#201a1b] px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
                      <span className="material-symbols-outlined text-[16px] text-[#e0892d]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#201a1b]">
                        {shownRating}{' '}
                        <span className="font-normal text-[#6c5a66]">
                          ({shownReviewCount} reviews)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Subtitle / Role */}
                  <p className="text-sm sm:text-base font-medium text-[#65525e]">
                    {profile.title}
                  </p>

                  {/* Bio statement */}
                  <p className="text-xs sm:text-sm text-[#4b3d46] leading-relaxed font-normal">
                    {profile.bio}
                  </p>

                  {/* Credentials / Badges Row */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    {profile.credentials?.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#e6d3cf] text-[#4a3b47] px-3.5 py-1.5 rounded-full text-xs font-medium shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#695665]">
                          {badge.toLowerCase().includes('phd') ? 'school' : 'verified'}
                        </span>
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>

                  {/* Response Speed pill */}
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1.5 bg-white border border-[#e6d3cf] text-[#4a3b47] px-3.5 py-1.5 rounded-full text-xs font-medium shadow-2xs">
                      <span className="material-symbols-outlined text-[16px] text-[#695665]">
                        schedule
                      </span>
                      <span>{profile.responseSpeed}</span>
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* TWO SKILLS CARDS GRID: "Skills I Teach" & "Skills I Want" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Card: Skills I Teach */}
              <div className="bg-white rounded-3xl border border-[#ecd9d5] p-6 shadow-xs flex flex-col justify-between" id="card-public-skills-teach">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[22px] text-[#4a3b47]">
                      psychology
                    </span>
                    <h2 className="text-base font-bold text-[#201a1b]">
                      Skills I Teach
                    </h2>
                  </div>

                  {/* Lilac / Mauve pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.skillsTeach.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block bg-[#ebdfea] text-[#483348] text-xs font-medium px-3.5 py-1.5 rounded-full border border-[#ded0dd] transition-transform hover:scale-105"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Card: Skills I Want */}
              <div className="bg-white rounded-3xl border border-[#ecd9d5] p-6 shadow-xs flex flex-col justify-between" id="card-public-skills-want">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[22px] text-[#4a3b47]">
                      search
                    </span>
                    <h2 className="text-base font-bold text-[#201a1b]">
                      Skills I Want
                    </h2>
                  </div>

                  {/* Soft terracotta / dusty peach pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.skillsWant.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-block bg-[#f4dbd5] text-[#55322b] text-xs font-medium px-3.5 py-1.5 rounded-full border border-[#ebd0c9] transition-transform hover:scale-105"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* PEER REVIEWS SECTION */}
            <div className="space-y-4 pt-2" id="section-peer-reviews">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#201a1b]">
                  Peer Reviews
                </h2>
                <button
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="text-xs font-semibold text-[#65525e] hover:text-[#201a1b] transition-colors cursor-pointer"
                  id="btn-view-all-reviews"
                >
                  {isLiveProfile ? '' : showAllReviews ? 'Show Fewer' : 'View All'}
                </button>
              </div>

              {/* Reviews Cards List */}
              <div className="space-y-4">
                {reviewsToShow.length === 0 && (
                  <p className="text-xs text-[#8c7b86] italic bg-white rounded-2xl border border-[#ecd9d5] p-5">
                    No reviews yet — be the first to swap with {profile.name}.
                  </p>
                )}
                {reviewsToShow.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-[#ecd9d5] p-5 shadow-xs space-y-2.5 hover:border-[#cfb3be] transition-colors"
                  >
                    {/* Top Row: Reviewer Avatar + Name and Gold Stars */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatarUrl}
                          alt={rev.name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-10 h-10 rounded-full object-cover border border-[#ecd9d5]"
                        />
                        <span className="font-bold text-sm text-[#201a1b]">
                          {rev.name}
                        </span>
                      </div>

                      {/* Stars (filled to the reviewer's rating) */}
                      <div className="flex items-center gap-0.5 text-base select-none">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={i <= Number(rev.rating || 0) ? 'text-[#e0892d]' : 'text-[#e7dde2]'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Review Quote Text */}
                    <p className="text-xs sm:text-sm text-[#4e4049] italic leading-relaxed">
                      "{rev.quote}"
                    </p>

                    {/* Meta info footer */}
                    <p className="text-[11px] text-[#786571] font-medium pt-1">
                      {rev.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Sticky Session Rate & Platform Impact */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. SESSION RATE CARD */}
            <div className="bg-white rounded-3xl border border-[#ecd9d5] p-6 sm:p-7 shadow-xs text-center flex flex-col items-center" id="card-session-rate">
              <span className="text-[11px] font-bold tracking-widest text-[#786571] uppercase">
                SESSION RATE
              </span>
              <h2 className="text-2xl font-extrabold text-[#201a1b] mt-1.5">
                Skill Credit Swap
              </h2>
              <p className="text-xs text-[#786571] mt-1 font-normal">
                Mutually beneficial exchange of knowledge
              </p>

              {/* Info Box */}
              <div className="w-full bg-[#fbf0ee] rounded-2xl p-4 mt-5 space-y-2.5 text-left border border-[#ecd6d0]">
                <div className="flex items-center gap-2.5 text-xs font-medium text-[#40333d]">
                  <span className="material-symbols-outlined text-[18px] text-[#5e4956]">
                    event
                  </span>
                  <span>{profile.availability}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-[#40333d]">
                  <span className="material-symbols-outlined text-[18px] text-[#5e4956]">
                    videocam
                  </span>
                  <span>{profile.preferredMode}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-3">
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#bfa8c7] hover:bg-[#a992b4] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-[0.98]"
                  id="btn-request-session"
                >
                  REQUEST SESSION
                </button>

                <button
                  onClick={() => {
                    if (onMessageMentor) {
                      onMessageMentor({
                        uid: profile.uid || profile.id,
                        name: profile.name || 'Scholar',
                        title: profile.title || 'Peer Scholar',
                        avatarUrl: profile.avatarUrl,
                      });
                    } else {
                      onShowToast(`Opening chat with ${profile.name}...`);
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-white hover:bg-[#fbf0ee] border-2 border-[#4a3b47] text-[#4a3b47] rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
                  id="btn-message-scholar"
                >
                  MESSAGE {profile.name.toUpperCase().replace('DR. ', '').replace('PROF. ', '')}
                </button>
              </div>

              {/* Guidelines Disclaimer */}
              <p className="text-[11px] text-[#8a7783] mt-5 leading-tight px-3">
                By requesting a session, you agree to SkillSwap's peer exchange guidelines.
              </p>
            </div>

            {/* 2. PLATFORM IMPACT CARD */}
            <div className="w-full bg-[#fbf0ee] rounded-3xl p-5 border border-[#ecd9d5] shadow-2xs" id="card-platform-impact">
              <h3 className="text-sm font-bold text-[#201a1b] mb-3.5">
                Platform Impact
              </h3>

              {/* 2 Stat Boxes */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white rounded-2xl p-4 text-center border border-[#eddcd8] shadow-2xs">
                  <div className="text-2xl sm:text-3xl font-black text-[#201a1b]">
                    {profile.swapsCount}
                  </div>
                  <div className="text-xs text-[#786571] font-semibold mt-0.5">
                    Swaps
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 text-center border border-[#eddcd8] shadow-2xs">
                  <div className="text-2xl sm:text-3xl font-black text-[#201a1b]">
                    {profile.learnersCount}
                  </div>
                  <div className="text-xs text-[#786571] font-semibold mt-0.5">
                    Learners
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full bg-[#faece8] border-t border-[#ecd6d1] py-8 px-4 sm:px-8 mt-12">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-sm text-[#201a1b] block">
              SkillSwap Academic
            </span>
            <span className="text-xs text-[#786571] mt-0.5 block">
              © 2026 SkillSwap Academic. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#63515d]">
            <button
              onClick={() => onShowToast('SkillSwap Privacy Policy: Academic privacy & data sovereignty guaranteed')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('Terms of Service: Standard Academic Credit Barter Agreement')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('Partner Universities: Stanford, Oxford, UIU, Cambridge, MIT')}
              className="hover:text-[#201a1b] transition-colors"
            >
              University Partners
            </button>
            <button
              onClick={() => onShowToast('Contact Support: support@skillswap.edu')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      {/* REQUEST SESSION MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#ecd9d5] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#f4e7e4] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4a3b47]">calendar_month</span>
                <h3 className="font-bold text-base text-[#201a1b]">
                  Request Exchange with {profile.name}
                </h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-[#8e7a87] hover:text-[#201a1b] p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendSessionRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#453742] block mb-1">
                  Choose Available Slot ({profile.availability})
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-[#fdf8f7] border border-[#e2d0cd] rounded-xl px-3 py-2 text-[#201a1b] font-medium focus:outline-none focus:border-[#4a3b47]"
                >
                  <option value="Tue, 2:00 PM">Tue, 2:00 PM - 3:00 PM</option>
                  <option value="Tue, 4:30 PM">Tue, 4:30 PM - 5:30 PM</option>
                  {PROFILE_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#453742] block mb-1">
                  Skill You Can Offer in Return
                </label>
                <input
                  type="text"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  placeholder="e.g. Python Data Science, Academic Writing"
                  className="w-full bg-[#fdf8f7] border border-[#e2d0cd] rounded-xl px-3 py-2 text-[#201a1b] focus:outline-none focus:border-[#4a3b47]"
                />
              </div>

              <div>
                <label className="font-bold text-[#453742] block mb-1">
                  Topic / Objectives
                </label>
                <textarea
                  rows={3}
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full bg-[#fdf8f7] border border-[#e2d0cd] rounded-xl p-3 text-[#201a1b] focus:outline-none focus:border-[#4a3b47]"
                ></textarea>
              </div>

              <div className="bg-[#fbf0ee] p-3 rounded-xl text-[11px] text-[#786571] flex items-center justify-between">
                <span>Session Fee:</span>
                <span className="font-bold text-[#4a3b47]">1.0 Skill Credit (Swap)</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#786571] hover:text-[#201a1b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4a3b47] hover:bg-[#342738] text-white font-bold rounded-xl transition-colors shadow-xs"
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT MESSAGE opens the real global chat drawer (no fake modal) */}

    </div>
  );
};
