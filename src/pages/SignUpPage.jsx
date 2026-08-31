import React, { useState } from 'react';
import { academicAssets } from '../assets';
import { useAuth } from '../context/AuthContext';

export const SignUpPage = ({
  onSignUpSuccess,
  onNavigateToLogin,
  onOpenSSO,
  onShowToast,
}) => {
  const { signUp, signInWithGoogleOAuth } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Stanford University');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreedTerms) {
      setErrorMessage('Please accept the institutional terms of service to proceed.');
      onShowToast('Please accept the terms of service.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, fullName.trim(), university.trim());
      onShowToast(`Account created for ${result.user.displayName || fullName}! Directing to profile setup...`);
      if (onSignUpSuccess) {
        onSignUpSuccess({
          name: fullName.trim(),
          email: email.trim(),
          university: university.trim(),
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
      onShowToast(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogleOAuth();
      onShowToast(`Welcome, ${result.user.displayName || 'Scholar'}! Account connected.`);
      if (onSignUpSuccess) {
        onSignUpSuccess({
          name: result.user.displayName,
          email: result.user.email,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google account creation cancelled or failed.');
      onShowToast(err.message || 'Google sign-up failed.');
    } finally {
      setGoogleLoading(false);
    }
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
            className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors cursor-pointer"
          >
            Help
          </button>
          <button
            onClick={() =>
              onShowToast(
                'SkillSwap is an inter-university academic skill exchange platform for researchers and scholars.'
              )
            }
            className="text-white/80 font-medium hover:text-[#efdbfd] transition-colors cursor-pointer"
          >
            About
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-grow flex items-center justify-center pt-[90px] pb-16 px-4 sm:px-8">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-6 sm:p-10 lg:p-12 ambient-lift border border-[#ccc4cd]/30 my-6 shadow-xl">
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
                Join <span className="font-bold text-[#675975]">2,400+</span> verified scholars exchanging
                skills this semester.
              </p>
            </div>
          </div>

          {/* Right Column: Sign Up Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold text-[#675975]">Create your account</h1>
              <p className="text-xs text-[#4a454c]">Start your academic skill exchange today.</p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-name"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] text-[18px]">
                    person
                  </span>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Julian Sterling"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                </div>
              </div>

              {/* University Affiliation */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-university"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  University / Academic Institution
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] text-[18px]">
                    domain
                  </span>
                  <input
                    id="signup-university"
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University, MIT, Oxford"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
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
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] text-[18px]">
                    school
                  </span>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@university.edu"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="signup-password"
                  className="text-xs font-semibold text-[#201a1b] block ml-1"
                >
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] text-[18px]">
                    lock
                  </span>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b757d] hover:text-[#675975] p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2.5 pt-1">
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
                  .
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-sm rounded-full transition-all duration-200 ambient-lift active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#3c2f47] border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Account</span>
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    </>
                  )}
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
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading || loading}
                    className="flex items-center justify-center space-x-2 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold hover:bg-[#ebe0e0] transition-colors cursor-pointer bg-white"
                  >
                    {googleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#4e4353] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSSO}
                    className="flex items-center justify-center space-x-2 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold hover:bg-[#ebe0e0] transition-colors cursor-pointer bg-white"
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
                    className="text-[#675975] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign In
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
