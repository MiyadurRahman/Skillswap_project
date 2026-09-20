import React, { useEffect, useRef, useState } from 'react';

// Reusable mobile navigation drawer.
// - The hamburger trigger renders only below the `md` breakpoint.
// - Either pass `items` (simple link list) or `children` as a render function
//   that receives a `close` callback (used by Dashboard to reuse its sidebar).
export const MobileNav = ({ title = 'SkillSwap', accent = '#4e4353', items = [], children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const trigger = triggerRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (previouslyFocused === trigger) trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -ml-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[104] bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        />
      )}

      <div
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-[107] w-80 max-w-[85vw] bg-[#fdf1f1] shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className="h-16 shrink-0 flex items-center justify-between px-5"
          style={{ backgroundColor: accent }}
        >
          <span className="text-xl font-bold text-[#efdbfd] tracking-tight">{title}</span>
          <button
            ref={closeRef}
            onClick={() => setOpen(false)}
            className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-y-auto scrollbar-none">
          {typeof children === 'function' ? (
            children(() => setOpen(false))
          ) : (
            <nav className="p-4 space-y-1">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-[#eeddf2] text-[#6c6071]'
                      : 'text-[#4a454c] hover:bg-[#ebe0e0]'
                  }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                  {item.badge && <span className="ml-auto w-2 h-2 rounded-full bg-[#f0b2aa]"></span>}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
};
