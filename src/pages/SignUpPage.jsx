import React, { useState } from 'react';
import { academicAssets } from '../assets';

export const SignUpPage = ({
  onSignUpSuccess,
  onNavigateToLogin,
  onOpenSSO,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      onShowToast('Please accept the institutional terms of service to proceed.');
      return;
    }
    const enteredName = fullName.trim() || 'Alex Rivera';
    const enteredEmail = email.trim() || 'scholar@stanford.edu';
    onShowToast(`Account initialized for ${enteredName}! Redirecting to profile setup...`);
    onSignUpSuccess({ name: enteredName, email: enteredEmail });
  };

  return (
    <div
      id="screen-signup"
      className="bg-[#fff8f7] text-[#201a1b] min-h-screen flex flex-col mesh-academic-bg"
    >
      {/* Top Header */}
      <header className="fixed top-0 w-full h-[72px] bg-[#4e4353] z-50 shadow-sm flex items-center justify-between px-6 sm:px-8 max-w-[1280px] mx-auto left-0 right-0">
        <div className="flex items-center">
          <span
            onClick={onNavigateToLogin}
            className="text-2xl font-bold text-[#c5b3d3] tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
          >
            SkillSwap
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <button
            onClick={() => onShowToast('Campus Liaison Help Desk: support@skillswap.edu')}
            className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors"
          >
            Help
          </button>
          <button
            onClick={() =>
              onShowToast(
                'SkillSwap is an inter-university academic skill exchange platform for researchers and scholars.'
              )
            }
            className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors"
          >
            About
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow flex items-center justify-center pt-[90px] pb-16 px-4 sm:px-8">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-6 sm:p-10 lg:p-12 ambient-lift border border-[#ccc4cd]/30 my-6">
          {/* Left Column: Branding, Imagery & Social Proof */}
          <div className="hidden lg:flex flex-col space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl leading-tight text-[#675975] font-extrabold tracking-tight">
                Empower your academic journey through peer learning.
              </h2>
              <p className="text-sm text-[#4a454c] leading-relaxed max-w-md">
                Join a community of dedicated scholars. Share your expertise in PhD-level research,
                or find a peer to master complex academic skills together.
              </p>
            </div>

            {/* Asymmetric Card Visual Component */}
            <div className="relative h-[380px] w-full flex items-center justify-center">
              {/* Card 1: Library Study Duo */}
              <div className="absolute top-2 left-4 w-64 h-80 rounded-2xl overflow-hidden shadow-xl transform -rotate-3 transition-transform hover:rotate-0 duration-500 z-20 border border-white/60">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${academicAssets.photos.libraryStudy}')`,
                  }}
                ></div>
              </div>

              {/* Card 2: Blueprints & Fountain Pen */}
              <div className="absolute bottom-2 right-4 w-72 h-72 rounded-2xl overflow-hidden shadow-xl transform rotate-6 transition-transform hover:rotate-0 duration-500 z-10 border border-white/60">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${academicAssets.photos.architectureBlueprints}')`,
                  }}
                ></div>
              </div>

              {/* Ambient Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-[#c5b3d3]/30 rounded-full blur-3xl -z-10"></div>
            </div>

            {/* Avatar Stack & Community Stat */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex -space-x-3">
                <img
                  src={academicAssets.avatars.alexRivera}
                  alt="Scholar avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <img
                  src={academicAssets.avatars.sarahKhan}
                  alt="Scholar avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
                <img
                  src={academicAssets.avatars.julianSterling}
                  alt="Scholar avatar"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
              </div>
              <p className="text-xs text-[#4a454c]">
                Join <span className="font-bold text-[#675975]">2,400+</span> scholars exchanging
                skills this semester.
              </p>
            </div>
          </div>

          {/* Right Column: Sign Up Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold text-[#675975]">Create your account</h1>
              <p className="text-xs text-[#4a454c]">Start your skill-swapping journey today.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-name"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d]">
                    person
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name (e.g. Julian Sterling)"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                </div>
              </div>

              {/* University Email */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-email"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  University Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d]">
                    school
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#4a454c]/80 ml-1">
                  Requires a valid .edu or academic domain.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-password"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d]">
                    lock
                  </span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full pl-11 pr-11 py-3 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] hover:text-[#675975] p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2.5 py-1">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#ccc4cd] text-[#675975] focus:ring-[#c5b3d3] cursor-pointer"
                />
                <label
                  htmlFor="signup-terms"
                  className="text-[11px] text-[#4a454c] leading-tight cursor-pointer"
                >
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onShowToast('Terms of Service: Academic Knowledge Exchange')}
                    className="text-[#675975] font-semibold hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onShowToast('Privacy Policy: FERPA compliant data handling')}
                    className="text-[#675975] font-semibold hover:underline"
                  >
                    Privacy Policy
                  </button>
                  . I understand this platform is for academic exchange only.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  id="signup-submit-btn"
                  type="submit"
                  className="w-full py-3.5 bg-[#c5b3d3] hover:bg-[#a992bb] text-[#52445f] font-bold text-sm rounded-full transition-all duration-200 ambient-lift active:scale-[0.98] cursor-pointer"
                >
                  Create Account
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#ccc4cd]/60"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-semibold">
                    <span className="bg-white px-3 text-[#4a454c]">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onShowToast('Connecting with Google Scholar / University Google Workspace...');
                      onSignUpSuccess({
                        name: 'Julian Sterling',
                        email: 'j.sterling@stanford.edu',
                      });
                    }}
                    className="flex items-center justify-center space-x-2 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold hover:bg-[#ebe0e0] transition-colors cursor-pointer"
                  >
                    <img
                      src={academicAssets.icons.google}
                      alt="Google"
                      className="w-4 h-4"
                    />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSSO}
                    className="flex items-center justify-center space-x-2 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold hover:bg-[#ebe0e0] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#201a1b]">
                      account_balance
                    </span>
                    <span>University SSO</span>
                  </button>
                </div>

                <p className="text-center text-xs text-[#4a454c] pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-[#675975] font-bold hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#ebe0e0] w-full py-6 border-t border-[#ccc4cd]/30 text-xs text-[#4a454c]">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 sm:px-8 max-w-[1280px] mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-[#675975]">SkillSwap</span>
            <p className="text-[11px] opacity-75">
              © 2026 SkillSwap Academic. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => onShowToast('Privacy Policy')}
              className="hover:text-[#675975] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('Terms of Service')}
              className="hover:text-[#675975] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('University Partners network')}
              className="hover:text-[#675975] transition-colors"
            >
              University Partners
            </button>
            <button
              onClick={() => onShowToast('Support Desk')}
              className="hover:text-[#675975] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
