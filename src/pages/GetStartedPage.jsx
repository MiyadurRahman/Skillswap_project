import React, { useState } from 'react';
import { academicAssets } from '../assets';

export const GetStartedPage = ({
  onNavigateToSignUp,
  onNavigateToLogin,
  onShowToast,
  onOpenSSO,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  const categories = [
    { id: 'all', label: 'All Fields', icon: 'auto_stories' },
    { id: 'cs', label: 'Computer Science', icon: 'terminal' },
    { id: 'math', label: 'Applied Math', icon: 'functions' },
    { id: 'bio', label: 'Bio Sciences', icon: 'biotech' },
    { id: 'eng', label: 'Engineering', icon: 'precision_manufacturing' },
  ];

  const featuredSkills = [
    {
      id: 1,
      category: 'cs',
      title: 'Data Structures & Algorithms',
      mentorName: 'Tanvir Ahmed',
      university: 'United International University (UIU)',
      tags: ['C++', 'Dynamic Programming', 'Trees'],
      rating: 4.95,
      avatarUrl: academicAssets.avatars.tanvirAhmed,
    },
    {
      id: 2,
      category: 'math',
      title: 'LaTeX Research Paper Drafting',
      mentorName: 'Abrar Zahin',
      university: 'United International University (UIU)',
      tags: ['LaTeX', 'Python', 'Calculus'],
      rating: 5.0,
      avatarUrl: academicAssets.avatars.abrarZahin,
    },
    {
      id: 3,
      category: 'bio',
      title: 'Genomic Sequence Pipelines',
      mentorName: 'Mahir Faisal',
      university: 'University of Dhaka',
      tags: ['R-Studio', 'Bioinformatics'],
      rating: 4.92,
      avatarUrl: academicAssets.avatars.mahirFaisal,
    },
    {
      id: 4,
      category: 'eng',
      title: 'MATLAB Simulation & Modeling',
      mentorName: 'Shakib Chowdhury',
      university: 'BUET',
      tags: ['MATLAB', 'Simulink'],
      rating: 4.97,
      avatarUrl: academicAssets.avatars.shakibChowdhury,
    },
  ];

  const filteredSkills =
    selectedCategory === 'all'
      ? featuredSkills
      : featuredSkills.filter((s) => s.category === selectedCategory);

  const faqs = [
    {
      q: 'How does time-banking work?',
      a: 'Every 1 hour you spend teaching a peer earns you 1 Time Credit. You can spend that credit to learn any subject from any other student across universities with zero fees.',
    },
    {
      q: 'Who can join SkillSwap?',
      a: 'Any student, researcher, or faculty member with a verified university email or academic login.',
    },
    {
      q: 'Can I exchange skills across different universities?',
      a: 'Yes! You can connect with students and mentors from UIU, Stanford, MIT, Oxford, and other partner campuses.',
    },
    {
      q: 'How do peer sessions take place?',
      a: 'Sessions happen in our built-in video room equipped with a live timer, shared notes, and time-credit transfer upon completion.',
    },
  ];

  return (
    <div id="screen-get-started" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 w-full bg-[#4e4353]/95 backdrop-blur-md shadow-sm border-b border-[#ccc4cd]/20">
        <div className="max-w-[1180px] mx-auto px-3.5 sm:px-6 md:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#675975] to-[#c5b3d3] flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[18px] sm:text-[22px]">school</span>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-bold text-[#c5b3d3] tracking-tight block leading-none truncate">
                SkillSwap
              </span>
              <span className="text-[9px] sm:text-[10px] text-white/70 font-medium tracking-wide uppercase truncate block mt-0.5">
                Academic Exchange
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              id="header-btn-login"
              type="button"
              onClick={onNavigateToLogin}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer whitespace-nowrap min-h-[36px] flex items-center"
            >
              Sign In
            </button>
            <button
              id="header-btn-get-started"
              type="button"
              onClick={onNavigateToSignUp}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 min-h-[36px]"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <section className="py-14 sm:py-18 px-5 sm:px-8 max-w-[1180px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7effa] border border-[#d2c0e0] text-[#52445f] text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-[#675975]">verified</span>
              <span>Inter-University Academic Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#675975] tracking-tight leading-tight">
              Exchange academic skills.{' '}
              <span className="text-[#3c2f47] underline decoration-[#c5b3d3] decoration-4 underline-offset-4">
                Learn for free.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#4a454c] leading-relaxed max-w-xl">
              Connect with university students and researchers to swap knowledge. Teach what you know, earn time credits, and learn new skills with zero fees.
            </p>

            {/* Clean Single Action Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                id="hero-btn-register"
                type="button"
                onClick={onNavigateToSignUp}
                className="px-7 py-3 bg-[#675975] hover:bg-[#52445f] text-white font-bold text-sm sm:text-base rounded-full shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started — It's Free</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-6 py-3 bg-white hover:bg-[#f7effa] text-[#52445f] font-semibold text-sm rounded-full border border-[#ccc4cd]/60 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>I have an account</span>
              </button>
            </div>

            {/* Simple Metrics */}
            <div className="pt-5 border-t border-[#ccc4cd]/30 flex items-center gap-8">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#675975]">2,400+</div>
                <div className="text-[11px] text-[#7b757d]">Students & Mentors</div>
              </div>
              <div className="h-8 w-px bg-[#ccc4cd]/40"></div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#675975]">1:1</div>
                <div className="text-[11px] text-[#7b757d]">Time Credit Banking</div>
              </div>
              <div className="h-8 w-px bg-[#ccc4cd]/40"></div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#675975]">Free</div>
                <div className="text-[11px] text-[#7b757d]">Zero Tuition Fees</div>
              </div>
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-[#ccc4cd]/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ccc4cd]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#675975]">swap_horiz</span>
                  <span className="text-xs font-bold text-[#675975]">Live Exchange Preview</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  1 hr = 1 Credit
                </span>
              </div>

              <div className="bg-[#f7effa] rounded-xl p-3.5 space-y-2 border border-[#d2c0e0]/40">
                <div className="flex items-center gap-2.5">
                  <img
                    src={academicAssets.avatars.tanvirAhmed}
                    alt="Tanvir Ahmed - UIU Student"
                    className="w-10 h-10 rounded-full object-cover border border-[#675975]/30"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#201a1b] block">Tanvir Ahmed (UIU)</span>
                    <span className="text-[10px] text-[#675975]">United International University</span>
                  </div>
                </div>
                <div className="text-xs bg-white p-2.5 rounded-lg border border-[#ccc4cd]/30">
                  <span className="text-[10px] uppercase font-bold text-[#7b757d] block">Teaching:</span>
                  <span className="font-semibold text-[#201a1b]">Data Structures & Algorithms in C++</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="w-full py-2.5 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Join SkillSwap with UIU or University Email</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Simple 3 Steps) */}
      <section className="py-12 bg-white border-y border-[#ccc4cd]/30">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-9 space-y-1">
            <h2 className="text-2xl font-bold text-[#675975]">How It Works</h2>
            <p className="text-xs sm:text-sm text-[#4a454c]">
              Three simple steps to start swapping academic knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#fff8f7] border border-[#ccc4cd]/40 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#c5b3d3] flex items-center justify-center text-[#3c2f47] font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-[#675975]">List Your Skills</h3>
              <p className="text-xs text-[#4a454c] leading-relaxed">
                Add the topics you are confident in, like C++, Python, Math, or LaTeX.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#fff8f7] border border-[#ccc4cd]/40 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#675975] flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-[#675975]">Teach & Earn Credits</h3>
              <p className="text-xs text-[#4a454c] leading-relaxed">
                Host 1-on-1 sessions. Every hour you mentor earns 1 Time Credit in your wallet.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#fff8f7] border border-[#ccc4cd]/40 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4e4353] flex items-center justify-center text-[#efdbfd] font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-[#675975]">Learn for Free</h3>
              <p className="text-xs text-[#4a454c] leading-relaxed">
                Spend your credits to book sessions with peers across partner universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills / Mentors */}
      <section className="py-12 px-5 sm:px-8 max-w-[1180px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#675975]">Explore Topics</h2>
            <p className="text-xs text-[#4a454c]">Skills taught by students and researchers.</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-xs font-bold text-[#675975] hover:text-[#3c2f47] flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#675975] text-white shadow-sm'
                  : 'bg-white text-[#52445f] border border-[#ccc4cd]/50 hover:bg-[#f7effa]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-xl p-4 border border-[#ccc4cd]/40 shadow-sm hover:border-[#675975] transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-[#675975] bg-[#f7effa] px-2 py-0.5 rounded">
                    {skill.category.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[13px]">star</span>
                    {skill.rating}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#201a1b] line-clamp-2">{skill.title}</h3>

                <div className="flex items-center gap-2 pt-1">
                  <img
                    src={skill.avatarUrl}
                    alt={skill.mentorName}
                    className="w-7 h-7 rounded-full object-cover border border-[#ccc4cd]/50"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#201a1b] block truncate">
                      {skill.mentorName}
                    </span>
                    <span className="text-[9px] text-[#7b757d] block truncate">
                      {skill.university}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] bg-[#fff8f7] text-[#4a454c] px-1.5 py-0.5 rounded border border-[#ccc4cd]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#ccc4cd]/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#675975]">1.0 Credit/hr</span>
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="text-[11px] font-bold text-[#675975] hover:text-[#3c2f47] cursor-pointer"
                >
                  Request Swap →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple FAQ Section */}
      <section className="py-12 px-5 sm:px-8 max-w-[760px] mx-auto w-full">
        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold text-[#675975]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#ccc4cd]/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left font-bold text-xs sm:text-sm text-[#201a1b] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#fff8f7]"
                >
                  <span>{item.q}</span>
                  <span
                    className={`material-symbols-outlined text-[16px] text-[#675975] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 pt-1 text-xs text-[#4a454c] leading-relaxed border-t border-[#ccc4cd]/20">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Simple Bottom Banner */}
      <section className="py-10 px-5 sm:px-8 bg-[#4e4353] text-white text-center">
        <div className="max-w-[600px] mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Start exchanging skills today.</h2>
          <p className="text-xs text-white/80">
            Join students from UIU and partner universities across the globe.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="px-6 py-2.5 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer"
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-full transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-[#ebe0e0] w-full py-5 text-center text-xs text-[#4a454c]">
        <div className="max-w-[1180px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#675975]">SkillSwap Academic</span>
            <span className="text-[10px] text-[#7b757d]">© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => onShowToast && onShowToast('Privacy & FERPA Guidelines')}
              className="hover:text-[#675975] cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onShowToast && onShowToast('Terms of Academic Knowledge Exchange')}
              className="hover:text-[#675975] cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={onOpenSSO}
              className="hover:text-[#675975] cursor-pointer"
            >
              University SSO
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
