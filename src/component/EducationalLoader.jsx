import React from 'react';

export const EducationalLoader = ({
  label = 'Preparing your learning space…',
  className = '',
}) => (
  <div
    className={`educational-loader min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fff8f7] text-[#57445f] ${className}`}
    role="status"
    aria-live="polite"
  >
    <div className="educational-loader__mark" aria-hidden="true">
      <span className="educational-loader__orbit" />
      <svg
        className="educational-loader__book"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 7.5C10.6 6.3 8.9 5.7 7 5.7H4.8c-.7 0-1.3.6-1.3 1.3v11c0 .7.6 1.3 1.3 1.3H7c1.9 0 3.6.6 5 1.7V7.5Z" />
        <path d="M12 7.5c1.4-1.2 3.1-1.8 5-1.8h2.2c.7 0 1.3.6 1.3 1.3v11c0 .7-.6 1.3-1.3 1.3H17c-1.9 0-3.6.6-5 1.7V7.5Z" />
        <path d="M6.5 9.2h2M6.5 12h2M15.5 9.2h2M15.5 12h2" />
      </svg>
    </div>
    <span className="text-sm font-semibold tracking-wide">{label}</span>
  </div>
);

export default EducationalLoader;
