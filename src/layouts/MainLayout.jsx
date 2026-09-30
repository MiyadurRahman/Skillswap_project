import React from 'react';

export const MainLayout = ({
  children,
  currentScreen,
}) => {
  const showNav = currentScreen === 'dashboard' || currentScreen === 'admin-overview' || currentScreen === 'profile-setup';

  return (
    <div className="min-h-screen bg-[#fff8f7] font-sans antialiased text-[#201a1b] selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* Main Screen Content */}
      <div className={showNav ? 'pt-[72px]' : ''}>
        {children}
      </div>
    </div>
  );
};
