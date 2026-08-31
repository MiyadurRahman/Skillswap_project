import React from 'react';
import { Navbar } from './Navbar';
import { ScreenSwitcher } from '../component/ScreenSwitcher';

export const MainLayout = ({
  children,
  currentScreen,
  onNavigateScreen,
  userProfile,
  toastMessage,
  onShowToast,
  onOpenQuickDemo,
}) => {
  const showNav = currentScreen === 'dashboard' || currentScreen === 'admin-overview' || currentScreen === 'profile-setup';

  return (
    <div className="min-h-screen bg-[#fff8f7] font-sans antialiased text-[#201a1b] selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] bg-[#352f2f]/95 text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-medium backdrop-blur-md animate-bounce"
        >
          <span className="material-symbols-outlined text-[18px] text-[#efdbfd]">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Screen Content */}
      <div className={showNav ? 'pt-[72px]' : ''}>
        {children}
      </div>

      {/* Persistent Screen Switcher Dock */}
      <ScreenSwitcher
        currentScreen={currentScreen}
        onSelectScreen={onNavigateScreen}
        onOpenQuickDemo={onOpenQuickDemo}
      />
    </div>
  );
};
