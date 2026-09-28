import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';
import { AvatarImage } from '../component/AvatarImage';
import { resolveAvatarForName } from '../assets';

const medalClass = (rank) =>
  rank === 1
    ? 'bg-amber-100 border-amber-300 text-amber-700'
    : rank === 2
      ? 'bg-slate-100 border-slate-300 text-slate-600'
      : 'bg-orange-100 border-orange-300 text-orange-700';

export const LeaderboardPage = ({
  onNavigateScreen,
  onOpenWalletModal,
  onShowToast: _onShowToast,
  onSelectPeerProfile,
  realtime = false,
  realtimeUsers = [],
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('swaps');

  const roster = useMemo(() => {
    const mapPeer = (p, index) => ({
      id: p.uid || p.id || `peer-${p.name}-${index}`,
      uid: p.uid || p.id,
      isMe: Boolean(currentUser?.uid && (p.uid === currentUser.uid || p.id === currentUser.uid)),
      name: p.name || 'Scholar',
      title: p.title || p.primaryField || 'Peer Scholar',
      university: p.university || p.institution || 'University',
      avatarUrl: p.avatarUrl || resolveAvatarForName(p.name),
      isOnline: p.isOnline === true,
      bio: p.bio || '',
      rating: Number(p.rating ?? 0),
      reviewsCount: Number(p.reviewsCount ?? p.ratingCount ?? 0),
      swapsCount: Number(p.completedSwaps ?? p.swapsCount ?? 0),
      creditsEarned: Number(p.creditsEarned ?? p.swapsCount ?? 0),
      skillsTeach: Array.isArray(p.skillsTeach) ? p.skillsTeach : [],
      skillsWant: Array.isArray(p.skillsWant) ? p.skillsWant : [],
      raw: p,
    });

    const source = realtime ? realtimeUsers : [];
    return source
      .map(mapPeer)
      .filter((p) => p.name && p.name.toLowerCase() !== 'scholar');
  }, [realtime, realtimeUsers, currentUser]);

  const ranked = useMemo(() => {
    if (activeTab === 'rated') {
      const rated = roster
        .filter((p) => p.rating > 0)
        .sort((a, b) => {
          const aQualified = a.reviewsCount >= 3;
          const bQualified = b.reviewsCount >= 3;
          if (aQualified !== bQualified) return aQualified ? -1 : 1;
          return b.rating - a.rating;
        });
      const unrated = roster.filter((p) => p.rating <= 0);
      return [
        ...rated.map((p, i) => ({ ...p, rank: i + 1 })),
        ...unrated.map((p) => ({ ...p, rank: null })),
      ];
    }

    const value = (p) => activeTab === 'swaps' ? p.swapsCount : p.creditsEarned;
    return [...roster]
      .sort((a, b) => value(b) - value(a))
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [roster, activeTab]);

  const podium = activeTab === 'rated'
    ? ranked.filter((p) => p.rating > 0).slice(0, 3)
    : ranked.slice(0, 3);
  const podiumIds = new Set(podium.map((p) => p.id));
  const rest = activeTab === 'rated'
    ? ranked.filter((p) => !podiumIds.has(p.id))
    : ranked.slice(3);

  const stats = useMemo(() => {
    const total = roster.length;
    const swaps = roster.reduce((s, p) => s + p.swapsCount, 0);
    const rated = roster.filter((p) => p.rating > 0);
    const avg = rated.length
      ? Math.round((rated.reduce((s, p) => s + p.rating, 0) / rated.length) * 10) / 10
      : 0;
    return { total, swaps, avg };
  }, [roster]);

  // Navigate to the peer's full public profile (same shape Discover uses).
  const openProfile = (peer) => {
    const p = peer.raw || peer;
    if (onSelectPeerProfile) {
      onSelectPeerProfile({ ...p, uid: peer.uid, id: peer.id });
    }
    onNavigateScreen('public-profile');
  };

  const metricLabel =
    activeTab === 'swaps' ? 'Swaps' : activeTab === 'earned' ? 'Credits Earned' : 'Rating';
  const formatMetric = (p) =>
    activeTab === 'earned' ? `${(p.creditsEarned || 0).toFixed(1)}h` : activeTab === 'swaps' ? p.swapsCount : p.rating ? p.rating.toFixed(1) : '—';

  return (
    <div
      id="screen-leaderboard"
      className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]"
    >
      {/* TOP NAVBAR */}
      <header className="sticky top-0 w-full h-[68px] bg-[#473b4b] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1320px] mx-auto h-full">
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
            >
              SkillSwap
            </span>
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-white/80">
              <button onClick={() => onNavigateScreen('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                DASHBOARD
              </button>
              <button onClick={() => onNavigateScreen('discover')} className="hover:text-white transition-colors cursor-pointer">
                SEARCH
              </button>
              <button onClick={() => onNavigateScreen('requests')} className="hover:text-white transition-colors cursor-pointer">
                REQUESTS
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onOpenWalletModal && onOpenWalletModal()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Academic Ledger"
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </button>
          </div>
        </div>
      </header>

      {/* PAGE HEADING */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#705e69]">
            Academic Exchange
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight">
            SkillSwap Leaderboard
          </h1>
          <p className="text-xs text-[#705e69] mt-1 max-w-xl">
            See where you rank among scholars by completed swaps, credits earned, and peer ratings.
          </p>
        </div>

        {/* VOLUME STATS */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[
            { label: 'Scholars', value: stats.total },
            { label: 'Swaps Completed', value: stats.swaps },
            { label: 'Avg. Peer Rating', value: stats.avg ? stats.avg.toFixed(1) : '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#ebd8d4] p-4 sm:p-5 text-center shadow-xs">
              <div className="text-xl sm:text-3xl font-black text-[#473b4b]">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-[#786571] font-semibold mt-0.5 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* TAB SWITCHER */}
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto bg-[#f7ebeb] p-1 rounded-xl w-full sm:w-fit scrollbar-none">
          {[
            { key: 'swaps', label: 'Most Swaps' },
            { key: 'earned', label: 'Credits Earned' },
            { key: 'rated', label: 'Highest Rated' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                activeTab === t.key
                  ? 'bg-white text-[#675975] shadow-xs'
                  : 'text-[#7b757d] hover:text-[#201a1b]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'rated' && (
          <p className="-mt-4 text-[11px] text-[#8c7b86]">
            Scholars with 3 or more reviews rank first. Other rated scholars follow; unrated scholars remain listed below without a rank.
          </p>
        )}

        {/* PODIUM TOP 3 */}
        {podium.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {podium.map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl border p-5 sm:p-6 shadow-xs relative overflow-hidden ${
                  p.isMe ? 'border-[#675975] bg-[#fdf1ff]' : 'border-[#ebd8d4] bg-white'
                }`}
              >
                <span className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border ${medalClass(p.rank)}`}>
                  {p.rank}
                </span>
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <AvatarImage
                      src={p.avatarUrl}
                      name={p.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#efdbfd]"
                    />
                    {p.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#201a1b] truncate">
                      {p.name}
                      {p.isMe && (
                        <span className="ml-1.5 text-[10px] font-black uppercase tracking-wide text-[#675975]">You</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#705e69] truncate">{p.university}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#f4e8e5] flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-black text-[#473b4b]">{formatMetric(p)}</div>
                    <div className="text-[10px] text-[#786571] font-semibold uppercase tracking-wider">
                      {metricLabel}
                    </div>
                  </div>
                  <button
                    onClick={() => openProfile(p)}
                    className="text-xs font-bold text-[#57445f] hover:text-[#201a1b] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Profile
                    <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RANKED TABLE */}
        <div className="bg-white rounded-3xl border border-[#ebd8d4] shadow-xs overflow-hidden">
          <div className="grid grid-cols-[44px_1fr_auto] sm:grid-cols-[56px_1.4fr_1fr_auto] items-center gap-3 px-4 sm:px-6 py-3 bg-[#fcf5f3] border-b border-[#ebd8d4] text-[10px] font-bold uppercase tracking-widest text-[#786571]">
            <span>Rank</span>
            <span>Scholar</span>
            <span className="hidden sm:block text-right">{metricLabel}</span>
            <span className="text-right">Rating</span>
          </div>

          {activeTab === 'rated' && podium.length === 0 && roster.length > 0 && (
            <p className="px-4 pt-4 text-xs text-[#8c7b86]">
              No scholars have peer ratings yet. All profiles are listed below.
            </p>
          )}

          {rest.length === 0 && podium.length === 0 && (
            <p className="p-6 text-xs text-[#8c7b86] italic">
              {activeTab === 'rated'
                ? 'No scholars have peer ratings yet.'
                : 'No scholars ranked yet — the leaderboard fills as swaps are completed.'}
            </p>
          )}

          {rest.map((p) => (
            <div
              key={p.id}
              className={`grid grid-cols-[44px_1fr_auto] sm:grid-cols-[56px_1.4fr_1fr_auto] items-center gap-3 px-4 sm:px-6 py-3 border-b border-[#f4e8e5] last:border-b-0 hover:bg-[#fdf7f6] transition-colors ${
                p.isMe ? 'bg-[#fdf1ff]' : ''
              }`}
            >
              <span className="text-xs font-bold text-[#786571]">
                {p.rank ? `#${p.rank}` : '—'}
              </span>
              <button
                onClick={() => openProfile(p)}
                className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
              >
                <AvatarImage
                  src={p.avatarUrl}
                  name={p.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#ebd8d4] shrink-0"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-[#201a1b] truncate">
                    {p.name}
                    {p.isMe && (
                      <span className="ml-1.5 text-[9px] font-black uppercase tracking-wide text-[#675975]">You</span>
                    )}
                  </span>
                  <span className="block text-[11px] text-[#705e69] truncate">{p.university}</span>
                </span>
              </button>
              <span className="hidden sm:block text-xs font-bold text-[#473b4b] text-right">
                {formatMetric(p)}
              </span>
              <span className="text-xs font-bold text-amber-600 text-right">
                {p.rating ? p.rating.toFixed(1) : '—'}
                {p.rating ? <span className="text-[#e0892d]"> ★</span> : ''}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#8c7b86] text-center pt-2">
          Updated from current peer exchange profiles and completed sessions.
        </p>
      </main>
    </div>
  );
};
