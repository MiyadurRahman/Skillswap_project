import React from 'react';

const toastStyles = {
  success: {
    icon: 'check_circle',
    iconClass: 'bg-emerald-100 text-emerald-700',
    borderClass: 'border-l-emerald-500',
  },
  error: {
    icon: 'error',
    iconClass: 'bg-red-100 text-red-700',
    borderClass: 'border-l-red-500',
  },
  warning: {
    icon: 'warning',
    iconClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-l-amber-500',
  },
  info: {
    icon: 'info',
    iconClass: 'bg-violet-100 text-[#675975]',
    borderClass: 'border-l-[#675975]',
  },
};

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;
  const isError = toast.type === 'error';

  return (
    <div
      id="toast-notification"
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`fixed left-4 right-4 top-4 z-[120] sm:left-auto sm:right-5 sm:w-full sm:max-w-[420px] ${
        toast.closing ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <div className={`flex items-start gap-3 rounded-2xl border border-[#e5dce3] border-l-4 ${style.borderClass} bg-white px-4 py-3.5 shadow-[0_16px_45px_rgba(55,40,52,0.16)]`}>
        <span className={`material-symbols-outlined grid h-8 w-8 shrink-0 place-items-center rounded-full text-[18px] ${style.iconClass}`} aria-hidden="true">
          {style.icon}
        </span>
        <p className="min-w-0 flex-1 pt-1 text-sm font-medium leading-5 text-[#352f35]">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#7b757d] transition-colors hover:bg-[#f5edef] hover:text-[#352f35] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a992bb] cursor-pointer"
          aria-label="Dismiss notification"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  );
}
