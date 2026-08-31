import React from 'react';

export const Navbar = ({
  onNavigateScreen,
  currentScreen,
  userProfile,
  onShowToast,
}) => {
  return (
    <header className="fixed top-0 w-full h-[72px] bg-[#4e4353] shadow-md z-50">
      <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1280px] mx-auto h-full">
        <div className="flex items-center gap-6 sm:gap-8">
          <span
            onClick={() => onNavigateScreen('dashboard')}
            className="text-2xl font-bold text-[#c5b3d3] tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
          >
            SkillSwap
          </span>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button
              onClick={() => onNavigateScreen('dashboard')}
              className={`pb-1 font-medium transition-colors ${
                currentScreen === 'dashboard'
                  ? 'text-[#d2c0e0] border-b-2 border-[#d2c0e0] font-bold'
                  : 'text-white/80 hover:text-[#efdbfd]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onShowToast('Academic skill catalog with 450+ PhD and undergraduate subjects.')}
              className="text-white/80 hover:text-[#efdbfd] transition-colors"
            >
              Discover
            </button>
            <button
              onClick={() => onShowToast('Showing upcoming academic swap sessions')}
              className="text-white/80 hover:text-[#efdbfd] transition-colors"
            >
              My Sessions
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
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
          <div
            onClick={() => onNavigateScreen('profile-setup')}
            className="flex items-center gap-2.5 pl-2 cursor-pointer group"
            title="View Profile Settings"
          >
            <div className="w-9 h-9 rounded-full border-2 border-[#c5b3d3] overflow-hidden group-hover:border-white transition-colors">
              <img
                src={
                  userProfile?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDO6G8cbuAp-2LMxrLK69_FAO683etxZkNYKSxnqWVjXEOpVUskBDenJqzt4UDpUTacmujIQWfTyfvlb9hOpClMkAeWW7c-Ir8bgu-oI2hZ1JGjMw09r1-koJrc2mY0q2qaTDfYpfz2ixJarx4G1CM85pUri83SzJwUOULa9UeJUDD9sD2iNHLwcY1cdEmoHyzgHkfpikCGutuY_BHUI1YyfaOyPDV9A4mqC4nc1AKhUS6UVEtuSRC_0Q'
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {userProfile?.name || 'Alex Rivera'}
              </p>
              <p className="text-[10px] text-[#efdbfd]/80">
                {userProfile?.academicLevel || 'PhD Scholar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
