import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';
import { useReviews } from '../hooks/useReviews';
import { getAchievementBadges, subscribeUserProfile } from '../services/realtime';
import { resolveAvatarForName } from '../assets';

export const PublicProfilePage = ({
  onNavigateScreen,
  onOpenWalletModal,
  onShowToast,
  userProfile: currentLoggedProfile,
  profileData: customProfile,
  onMessageMentor,
  onRequestRealtime,
  blockedUserIds = [],
  onBlockScholar,
  onUnblockScholar,
  onReportScholar,
}) => {
  const { currentUser, userProfile: authProfile } = useAuth();
  const activeUser = authProfile || currentLoggedProfile || {};

  // Message Dialog state (real chat is opened via the global drawer)

  // Reviews expansion state
  const [showAllReviews, setShowAllReviews] = useState(false);
  const profileUid = customProfile?.uid || customProfile?.id || null;
  const isOwnProfile = Boolean(currentUser?.uid && currentUser.uid === profileUid);
  const isBlocked = Boolean(profileUid && blockedUserIds.includes(profileUid));
  const [liveProfile, setLiveProfile] = useState(customProfile || null);

  useEffect(() => {
    if (!profileUid) return undefined;
    return subscribeUserProfile(profileUid, setLiveProfile);
  }, [profileUid]);

  const emptyProfile = {
    id: null,
    name: 'Scholar',
    title: 'Peer Scholar',
    rating: 0,
    reviewsCount: 0,
    avatarUrl: resolveAvatarForName('Scholar'),
    isOnline: false,
    bio: 'This scholar has not added a biography yet.',
    credentials: [],
    responseSpeed: 'Not enough response data',
    skillsTeach: [],
    skillsWant: [],
    availability: 'Availability not provided',
    preferredMode: 'Preferred mode not provided',
    swapsCount: 0,
    learnersCount: 0,
    reviews: [],
  };
  const profileSource = liveProfile || customProfile;
  const ratingCount = Number(profileSource?.ratingCount ?? profileSource?.reviewsCount ?? 0);
  const ratingSum = Number(profileSource?.ratingSum ?? 0);
  const profile = !profileSource
    ? emptyProfile
    : {
      ...emptyProfile,
      ...profileSource,
      id: profileUid,
      uid: profileUid,
      name: profileSource.name || 'Scholar',
      title: profileSource.title || profileSource.academicLevel || 'Peer Scholar',
      rating: ratingCount > 0
        ? Number(profileSource.ratingAverage ?? ratingSum / ratingCount)
        : 0,
      reviewsCount: ratingCount,
      avatarUrl: profileSource.avatarUrl || resolveAvatarForName(profileSource.name || 'Scholar'),
      skillsTeach: profileSource.skillsTeach || profileSource.expertiseAreas || [],
      skillsWant: profileSource.skillsWant || profileSource.learningGoals || [],
      swapsCount: Number(profileSource.completedSwaps ?? profileSource.swapsCount ?? 0),
      learnersCount: Number(profileSource.uniquePartners ?? 0),
      credentials: profileSource.credentials || [],
      achievementBadges: getAchievementBadges(profileSource),
      reviews: [],
      };

  const displayedReviews = showAllReviews ? profile.reviews : profile.reviews.slice(0, 2);

  const reviewTargetUid = profileUid;
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
  const displayedBadges = [...(profile.achievementBadges || []), ...(profile.credentials || [])];

  const handleRequestSession = () => {
    if (!onRequestRealtime || !profileUid) {
      onShowToast?.('This scholar is not available for a session request.');
      return;
    }
    onRequestRealtime(profile);
  };

  const userAvatar = activeUser?.avatarUrl || resolveAvatarForName(activeUser?.name || 'Scholar');

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
              onClick={() => {
                if (onOpenWalletModal) onOpenWalletModal();
                else onShowToast('The credit ledger is unavailable right now.', 'warning');
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
                    {displayedBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#e6d3cf] text-[#4a3b47] px-3.5 py-1.5 rounded-full text-xs font-medium shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#695665]">
                          {badge.toLowerCase().includes('phd') ? 'school' : 'workspace_premium'}
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
                {currentUser && !isOwnProfile && (
                  <div className="flex justify-center gap-4 text-[11px]">
                    <button
                      type="button"
                      onClick={() => onReportScholar?.({ uid: profileUid, name: profile.name, source: 'profile' })}
                      className="text-[#705e69] underline underline-offset-2 hover:text-[#342738]"
                    >Report scholar</button>
                    <button
                      type="button"
                      onClick={() => isBlocked ? onUnblockScholar?.(profileUid) : onBlockScholar?.(profileUid)}
                      className="text-[#705e69] underline underline-offset-2 hover:text-[#342738]"
                    >{isBlocked ? 'Unblock scholar' : 'Block scholar'}</button>
                  </div>
                )}
                <button
                  disabled={isBlocked}
                  onClick={handleRequestSession}
                  className="w-full py-3.5 px-4 bg-[#bfa8c7] hover:bg-[#a992b4] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-[0.98]"
                  id="btn-request-session"
                >
                  REQUEST SESSION
                </button>

                <button
                  disabled={isBlocked}
                  onClick={() => {
                    if (onMessageMentor) {
                      onMessageMentor({
                        uid: profile.uid || profile.id,
                        name: profile.name || 'Scholar',
                        title: profile.title || 'Peer Scholar',
                        avatarUrl: profile.avatarUrl,
                      });
                    } else {
                      onShowToast('Messaging is unavailable for this scholar right now.', 'warning');
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-white hover:bg-[#fbf0ee] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#4a3b47] text-[#4a3b47] rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
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
              © {new Date().getFullYear()} SkillSwap Academic. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

      {/* Direct Message opens the global Firestore-backed chat drawer. */}

    </div>
  );
};
