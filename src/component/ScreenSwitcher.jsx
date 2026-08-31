import React from 'react';

export const ScreenSwitcher = ({
  currentScreen,
  onSelectScreen,
  onOpenQuickDemo,
}) => {
  const screens = [
    { id: 'login', label: '1. Sign In', icon: 'login', badge: 'Auth' },
    { id: 'signup', label: '2. Sign Up', icon: 'person_add', badge: 'Register' },
    { id: 'dashboard', label: '3. Dashboard', icon: 'dashboard', badge: 'Main' },
    { id: 'profile-setup', label: '4. Profile', icon: 'badge', badge: 'Profile' },
  ];

  return (
    <div
      id="screen-switcher-nav"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-[96vw] bg-[#352f2f]/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-1.5 transition-all overflow-x-auto scrollbar-none"
    >
      <div className="flex items-center gap-2 pl-2 pr-3 border-r border-white/20 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-semibold tracking-wide text-[#efdbfd]">
          SkillSwap Preview
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {screens.map((screen) => {
          const isActive = currentScreen === screen.id;
          return (
            <button
              key={screen.id}
              id={`screen-btn-${screen.id}`}
              onClick={() => onSelectScreen(screen.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#c5b3d3] text-[#22162e] font-bold shadow-md scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {screen.icon}
              </span>
              <span>{screen.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#52445f] text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {screen.badge}
              </span>
            </button>
          );
        })}
      </div>

      {onOpenQuickDemo && (
        <div className="flex items-center gap-1 pl-2 border-l border-white/20 shrink-0">
          <button
            onClick={() => onOpenQuickDemo('wallet')}
            className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 rounded-lg text-[#efdbfd] transition-colors flex items-center gap-1"
            title="Open Time Credit Wallet"
          >
            <span className="material-symbols-outlined text-[14px]">
              account_balance_wallet
            </span>
            Wallet
          </button>
          <button
            onClick={() => onOpenQuickDemo('meeting')}
            className="px-2.5 py-1 text-[11px] bg-[#675975] hover:bg-[#7b6b8b] rounded-lg text-white font-medium transition-colors flex items-center gap-1"
            title="Launch Mock Meeting"
          >
            <span className="material-symbols-outlined text-[14px]">
              videocam
            </span>
            Live Call
          </button>
        </div>
      )}
    </div>
  );
};
