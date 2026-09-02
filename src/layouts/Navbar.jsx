import React from 'react';
import { resolveAvatarForName } from '../assets';

export const Navbar = ({
  onNavigateScreen,
  currentScreen,
  userProfile,
  onShowToast,
  onOpenWalletModal,
}) => {
  return (
    <header className="sticky top-0 w-full h-[68px] bg-[#3e313f] shadow-md z-50">
      <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1360px] mx-auto h-full">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-8">
          <span
            onClick={() => onNavigateScreen('discover')}
            className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
          >
            SkillSwap
          </span>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <button
              onClick={() => onNavigateScreen('dashboard')}
              className={`font-medium transition-colors py-1 ${
                currentScreen === 'dashboard'
                  ? 'text-white font-bold border-b-2 border-white pb-0.5'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigateScreen('skill-manager')}
              className={`font-medium transition-colors py-1 ${
                currentScreen === 'skill-manager'
                  ? 'text-white font-bold border-b-2 border-white pb-0.5'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Skill Manager
            </button>
            <button
              onClick={() => onNavigateScreen('discover')}
              className={`font-medium transition-colors py-1 ${
                currentScreen === 'discover'
                  ? 'text-white font-bold border-b-2 border-white pb-0.5'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => {
                onShowToast('Showing upcoming academic swap sessions');
                onNavigateScreen('dashboard');
              }}
              className="text-white/80 hover:text-white transition-colors font-medium py-1"
            >
              My Sessions
            </button>
            <button
              onClick={() => onShowToast('You have 2 pending peer exchange requests')}
              className="text-white/80 hover:text-white transition-colors font-medium py-1"
            >
              Requests
            </button>
          </nav>
        </div>

        {/* Right: Notifications, Wallet, and Profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onShowToast('Notifications: 2 pending peer exchange invites')}
            className="p-2 text-white/80 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
          </button>
          <button
            onClick={() => {
              if (onOpenWalletModal) onOpenWalletModal();
              else onShowToast('Academic Credit Ledger');
            }}
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Credit Ledger & Wallet"
          >
            <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
          </button>
          
          <div
            onClick={() => onNavigateScreen('profile-setup')}
            className="flex items-center gap-2 pl-2 cursor-pointer group"
            title="View Profile Settings"
          >
            <span className="hidden sm:inline text-xs font-semibold text-white/90 group-hover:text-white">
              Profile
            </span>
            <div className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors">
              <img
                src={
                  userProfile?.avatarUrl ||
                  resolveAvatarForName(userProfile?.name || 'Scholar', 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80')
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

