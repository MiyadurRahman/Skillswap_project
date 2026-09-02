import React, { useState } from 'react';
import { academicAssets } from '../assets';

export const GetStartedPage = ({
  onNavigateToSignUp,
  onNavigateToLogin,
  onShowToast,
  onOpenSSO,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(0);

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
      title: 'Data Structures & Dynamic Programming',
      mentorName: 'Tanvir Ahmed',
      university: 'United International University (UIU)',
      tags: ['C++', 'Dynamic Programming', 'Graph Theory'],
      rating: 4.95,
      reviewsCount: 128,
      avatarUrl: academicAssets.avatars.tanvirAhmed,
      status: 'Online Now',
    },
    {
      id: 2,
      category: 'math',
      title: 'LaTeX Research Paper Drafting & Formatting',
      mentorName: 'Abrar Zahin',
      university: 'United International University (UIU)',
      tags: ['LaTeX', 'Overleaf', 'Academic Writing'],
      rating: 5.0,
      reviewsCount: 94,
      avatarUrl: academicAssets.avatars.abrarZahin,
      status: 'Available Today',
    },
    {
      id: 3,
      category: 'bio',
      title: 'Computational Genomics with Biopython',
      mentorName: 'Sarah Khan',
      university: 'University of Dhaka',
      tags: ['Bioinformatics', 'Biopython', 'Genetics'],
      rating: 4.88,
      reviewsCount: 67,
      avatarUrl: academicAssets.avatars.sarahKhan,
      status: 'Online Now',
    },
    {
      id: 4,
      category: 'eng',
      title: 'Embedded Robotics & Control Systems with ROS',
      mentorName: 'Shakib Chowdhury',
      university: 'BUET Robotics Lab',
      tags: ['Robotics', 'C++', 'Control Systems'],
      rating: 4.92,
      reviewsCount: 110,
      avatarUrl: academicAssets.avatars.shakibChowdhury,
      status: 'Tomorrow, 10:00 AM',
    },
  ];

  const faqs = [
    {
      q: 'How does the Time Credit economy work?',
      a: 'One hour of peer mentoring earns you 1.0 Time Credit in your local ledger. You can spend that credit anytime to learn any academic skill from another university peer. No monetary transactions required.',
    },
    {
      q: 'Do I have to be from a partner university to join?',
      a: 'Any enrolled undergraduate or graduate student with an institutional .edu or .ac.bd email address can register for free.',
    },
    {
      q: 'Can I exchange skills across different departments?',
      a: 'Yes! A Computer Science student can tutor an Economics student in Python or SQL, and in return receive tutoring in Econometrics or Macroeconomics.',
    },
    {
      q: 'Is cross-campus peer exchange supported?',
      a: 'Yes! You can connect with students and mentors from UIU, BUET, Dhaka University, Stanford, MIT, Oxford, and other partner campuses.',
    },
    {
      q: 'How do peer sessions take place?',
      a: 'Sessions happen directly inside our built-in academic workspace equipped with a live timer, shared notes, code sharing, and automatic time-credit transfer upon completion.',
    },
  ];

  const filteredSkills =
    selectedCategory === 'all'
      ? featuredSkills
      : featuredSkills.filter((s) => s.category === selectedCategory);

  return (
    <div id="screen-get-started" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-[#4e4353]/95 backdrop-blur-md shadow-sm border-b border-[#ccc4cd]/20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 sm:h-[70px] flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#675975] to-[#c5b3d3] flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-extrabold text-[#c5b3d3] tracking-tight block leading-none truncate">
                SkillSwap
              </span>
              <span className="text-[10px] text-white/75 font-semibold tracking-wider uppercase truncate block mt-0.5">
                Academic Exchange
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="header-btn-login"
              type="button"
              onClick={onNavigateToLogin}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer whitespace-nowrap min-h-[38px] flex items-center"
            >
              Sign In
            </button>
            <button
              id="header-btn-get-started"
              type="button"
              onClick={onNavigateToSignUp}
              className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 min-h-[38px]"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-20 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#c5b3d3]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-5 right-10 w-96 h-96 bg-[#ffdada]/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d2c0e0] text-[#52445f] text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Inter-University Knowledge Network • UIU & Partners</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#201a1b] tracking-tight leading-[1.12]">
              Exchange academic skills.{' '}
              <span className="text-[#675975] relative inline-block">
                Learn for free.
                <span className="absolute left-0 bottom-1 w-full h-2.5 bg-[#c5b3d3]/45 -z-10 rounded-sm"></span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#4a454c] leading-relaxed max-w-xl">
              Connect with fellow university scholars to swap peer tutoring and research skills. Teach what you excel in, earn local time credits, and book 1-on-1 peer sessions with zero fees.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                id="hero-btn-register"
                type="button"
                onClick={onNavigateToSignUp}
                className="px-8 py-3.5 bg-[#675975] hover:bg-[#52445f] text-white font-bold text-sm sm:text-base rounded-full shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started — It's Free</span>
                <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-6 py-3.5 bg-white hover:bg-[#f7effa] text-[#52445f] font-semibold text-sm rounded-full border border-[#ccc4cd]/70 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] text-[#675975]">login</span>
                <span>Sign In to Account</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="pt-6 border-t border-[#ccc4cd]/40 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#675975]">2,400+</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">Verified Scholars</div>
              </div>
              <div className="border-l border-[#ccc4cd]/50 pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#675975]">1:1</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">Time-Credit Swap</div>
              </div>
              <div className="border-l border-[#ccc4cd]/50 pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">100%</div>
                <div className="text-[11px] font-medium text-[#7b757d] mt-0.5">Zero Tuition Fees</div>
              </div>
            </div>
          </div>

          {/* Right Interactive Hero Card (Two-Way Skill Swap Match) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#ccc4cd]/50 space-y-4 relative z-10 ambient-lift">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#ccc4cd]/30">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-[#201a1b] tracking-wide uppercase">
                    Live Peer Exchange
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#efdbfd] text-[#4f415c] text-[11px] font-bold">
                  1 Hr = 1 Credit
                </span>
              </div>

              {/* Scholar 1: Offering */}
              <div className="p-3.5 bg-[#fcf9fc] rounded-2xl border border-[#eeddf2] transition-all hover:border-[#c5b3d3]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={academicAssets.avatars.tanvirAhmed}
                      alt="Tanvir Ahmed"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#675975]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#201a1b]">Tanvir Ahmed</span>
                        <span className="material-symbols-outlined text-[14px] text-[#675975]" title="Verified UIU Scholar">verified</span>
                      </div>
                      <span className="text-[10px] text-[#675975] font-medium">UIU • Computer Science</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#ffdada] text-[#5c3f40] px-2 py-0.5 rounded-md font-bold uppercase">
                    Teaching
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-xs font-semibold text-[#201a1b] border border-[#ccc4cd]/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#675975]">code</span>
                  <span>Data Structures & Algorithms in C++</span>
                </div>
              </div>

              {/* Animated Exchange Connector */}
              <div className="flex items-center justify-center -my-2 relative z-20">
                <div className="bg-[#675975] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 border-2 border-white">
                  <span className="material-symbols-outlined text-[13px]">sync_alt</span>
                  <span>Direct Skill Exchange</span>
                </div>
              </div>

              {/* Scholar 2: Receiving / Returning */}
              <div className="p-3.5 bg-[#fcf9fc] rounded-2xl border border-[#eeddf2] transition-all hover:border-[#c5b3d3]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={academicAssets.avatars.sarahKhan}
                      alt="Sarah Khan"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#c5b3d3]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#201a1b]">Sarah Khan</span>
                        <span className="material-symbols-outlined text-[14px] text-[#675975]" title="Verified DU Scholar">verified</span>
                      </div>
                      <span className="text-[10px] text-[#675975] font-medium">Univ of Dhaka • Genetics</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#efdbfd] text-[#4f415c] px-2 py-0.5 rounded-md font-bold uppercase">
                    Returning
                  </span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-xs font-semibold text-[#201a1b] border border-[#ccc4cd]/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#675975]">biotech</span>
                  <span>Computational Genomics & Python</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="w-full py-3 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
              >
                <span>Join Exchange Network</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Elevated 3-Step Flow) */}
      <section className="py-16 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#675975] uppercase tracking-wider bg-[#efdbfd] px-3 py-1 rounded-full">
            Simple 3-Step Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b]">
            How Academic Swapping Works
          </h2>
          <p className="text-xs sm:text-sm text-[#4a454c]">
            A fair, university-verified peer exchange system where everyone learns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#eeddf2] flex items-center justify-center text-[#675975]">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 01</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Publish Your Strengths</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              List the academic subjects, frameworks, or lab tools you feel confident teaching—like C++, LaTeX drafting, Calculus, or PyTorch.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">Algorithms</span>
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">LaTeX</span>
              <span className="text-[10px] bg-[#fff8f7] border border-[#ccc4cd]/30 text-[#4a454c] px-2 py-0.5 rounded-md font-semibold">Python</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#ffdada] flex items-center justify-center text-[#5c3f40]">
                <span className="material-symbols-outlined text-[24px]">sync_alt</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 02</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Mentor & Earn Credits</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              Host structured 1-on-1 collaborative sessions. Every 60 minutes of verified mentoring transfers 1.0 Time Credit into your scholar ledger.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span>1 Hour Tutored = +1.0 Credit</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white border border-[#ccc4cd]/40 shadow-xs space-y-4 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#efdbfd] flex items-center justify-center text-[#4f415c]">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <span className="text-xs font-black text-[#7b757d] uppercase tracking-wider">STEP 03</span>
            </div>
            <h3 className="text-base font-bold text-[#201a1b]">Learn Any Skill for Free</h3>
            <p className="text-xs text-[#4a454c] leading-relaxed">
              Redeem your accumulated credits to receive 1-on-1 coaching from peers and research scholars across partner universities with zero fees.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#675975] bg-[#efdbfd] px-2.5 py-1 rounded-lg w-fit">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              <span>Zero Tuition • Peer Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills / Mentors */}
      <section className="py-14 px-4 sm:px-8 max-w-[1240px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#675975] uppercase tracking-wider">
              Discover Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] mt-1">
              Top Peer Skills Available Now
            </h2>
            <p className="text-xs sm:text-sm text-[#4a454c] mt-1">
              Connect with top tutors and peer researchers ready for exchanges.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-xs sm:text-sm font-bold text-[#675975] hover:text-[#3c2f47] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Browse All 240+ Topics</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#675975] text-white shadow-md'
                  : 'bg-white text-[#52445f] border border-[#ccc4cd]/60 hover:bg-[#f7effa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-5 border border-[#ccc4cd]/50 shadow-xs hover:border-[#675975] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-extrabold text-[#675975] bg-[#eeddf2] px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {skill.category}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    <span>{skill.rating}</span>
                    <span className="text-[10px] text-[#7b757d]">({skill.reviewsCount})</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#201a1b] leading-snug line-clamp-2 min-h-[40px]">
                  {skill.title}
                </h3>

                {/* Mentor Info */}
                <div className="flex items-center gap-2.5 pt-1">
                  <img
                    src={skill.avatarUrl}
                    alt={skill.mentorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#c5b3d3]"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#201a1b] block truncate">
                      {skill.mentorName}
                    </span>
                    <span className="text-[10px] text-[#7b757d] block truncate">
                      {skill.university}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-[#fff8f7] text-[#4a454c] px-2 py-0.5 rounded-md border border-[#ccc4cd]/40 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-[#ccc4cd]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7b757d] block uppercase font-bold">Standard Rate</span>
                  <span className="text-xs font-extrabold text-[#675975]">1.0 Credit / Hr</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToSignUp}
                  className="px-3 py-1.5 bg-[#f7effa] hover:bg-[#675975] hover:text-white text-[#675975] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Request</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-8 max-w-[840px] mx-auto w-full">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-[#675975] uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b]">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-[#4a454c]">
            Everything you need to know about SkillSwap's peer-to-peer network.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#ccc4cd]/50 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-[#201a1b] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fff8f7] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#675975]"></span>
                    <span>{item.q}</span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] text-[#675975] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#4a454c] leading-relaxed border-t border-[#ccc4cd]/20 bg-[#fff8f7]/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 px-4 sm:px-8 bg-gradient-to-r from-[#4e4353] to-[#3c2f47] text-white text-center">
        <div className="max-w-[640px] mx-auto space-y-4">
          <span className="text-xs font-bold text-[#efdbfd] uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
            Join the Peer Revolution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to exchange academic skills?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Join hundreds of scholars from UIU, BUET, and partner universities exchanging skills this semester with zero financial cost.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="px-7 py-3 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-full border border-white/20 transition-colors cursor-pointer"
            >
              Scholar Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ebe0e0] w-full py-6 text-xs text-[#4a454c] border-t border-[#ccc4cd]/40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#675975]">SkillSwap Academic</span>
            <span className="text-[11px] text-[#7b757d]">© 2026 Academic Peer Exchange</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onShowToast && onShowToast('Privacy & FERPA Academic Guidelines')}
              className="hover:text-[#675975] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onShowToast && onShowToast('Terms of Academic Knowledge Exchange')}
              className="hover:text-[#675975] transition-colors cursor-pointer"
            >
              Institutional Terms
            </button>
            <button
              type="button"
              onClick={onOpenSSO}
              className="hover:text-[#675975] transition-colors cursor-pointer"
            >
              University SSO
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default GetStartedPage;

