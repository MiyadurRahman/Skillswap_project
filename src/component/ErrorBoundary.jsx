import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, details) {
    console.error('SkillSwap application error:', error, details);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-[#fff8f7] px-4 flex items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-[#ccc4cd] bg-white p-8 text-center shadow-xl">
          <span className="material-symbols-outlined text-[42px] text-[#675975]" aria-hidden="true">
            error
          </span>
          <h1 className="mt-3 text-xl font-bold text-[#201a1b]">SkillSwap could not finish loading</h1>
          <p className="mt-2 text-sm leading-6 text-[#4a454c]">
            Reload the page to reconnect. Your saved Firestore data is not changed by reloading.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#675975] px-6 py-3 text-sm font-bold text-white hover:bg-[#52445f]"
          >
            Reload SkillSwap
          </button>
        </section>
      </main>
    );
  }
}
