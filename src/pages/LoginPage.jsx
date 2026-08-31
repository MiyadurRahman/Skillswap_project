import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AUTH_CONFIG } from '../config/authConfig';

export const LoginPage = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onNavigateToGetStarted,
  onOpenSSO,
  onShowToast,
}) => {
  const { signIn, signInWithGoogleOAuth, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleQuickDemoLogin = async (demoType = 'uiu') => {
    setErrorMessage('');
    const demoEmail = 'unknown@bscse.uiu.ac.bd';
    const demoPassword = 'password123';
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const result = await signIn(demoEmail, demoPassword);
      onShowToast(`Welcome, ${result.profile?.fullName || 'UIU Scholar'}!`);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate demo account.');
      onShowToast(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoType) => {
    if (demoType === 'uiu') {
      setEmail('unknown@bscse.uiu.ac.bd');
      setPassword('password123');
      onShowToast('Loaded UIU credentials. Click "Sign In" or "Quick Sign In".');
    } else {
      setEmail('');
      setPassword('');
      onShowToast('Cleared form fields.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      onShowToast(`Welcome back, ${result.profile?.fullName || result.user?.displayName || 'Scholar'}!`);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate.');
      onShowToast(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogleOAuth();
      onShowToast(`Signed in with Google as ${res.user.displayName || res.user.email}!`);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
      onShowToast(err.message || 'Google sign-in cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      onShowToast('Please enter your university email to receive a reset link.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      onShowToast(`Password reset link sent to ${resetEmail.trim()}! Check your inbox.`);
      setResetModalOpen(false);
      setResetEmail('');
    } catch (err) {
      onShowToast(err.message || 'Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      id="screen-scholar-login"
      className="min-h-screen flex flex-col justify-center items-center bg-[#fff8f7] px-4 py-12"
    >
      {/* Main Login Container - Clean & Static (No Parallax Animation) */}
      <main className="w-full max-w-[460px] z-10">
        {/* Brand Identity Section */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <button
              type="button"
              onClick={onNavigateToGetStarted}
              className="text-2xl font-bold text-[#d2c0e0] tracking-tight mb-2 bg-[#4e4353] hover:bg-[#3c2f47] transition-all px-5 py-1.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2 mx-auto"
              title="Return to Get Started overview"
            >
              <span className="material-symbols-outlined text-[20px]">school</span>
              <span>SkillSwap</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#4a454c] opacity-90 mt-1 font-medium">
            Advancing academic excellence through peer collaboration.
          </p>
          {onNavigateToGetStarted && (
            <button
              type="button"
              onClick={onNavigateToGetStarted}
              className="text-[11px] text-[#675975] hover:text-[#3c2f47] font-semibold underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">arrow_back</span>
              <span>Back to Get Started & Platform Overview</span>
            </button>
          )}
        </div>

        {/* Login Card - Solid & Stable */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ccc4cd]/60 shadow-lg">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#201a1b] mb-1">Scholar Sign In</h2>
            <p className="text-xs text-[#4a454c]">
              Access your institutional research & tutoring dashboard.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              id="login-error-banner"
              className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">
                error
              </span>
              <div className="flex-1">
                <span className="font-semibold block">Authentication Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* University Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-[#4a454c] block tracking-wide"
              >
                University Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] opacity-70 text-[18px]">
                  school
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. unknown@bscse.uiu.ac.bd"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs sm:text-sm text-[#201a1b] focus:outline-none input-focus-glow disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold text-[#4a454c] block tracking-wide"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || '');
                    setResetModalOpen(true);
                  }}
                  className="text-xs text-[#675975] hover:text-[#4e4353] font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] opacity-70 text-[18px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs sm:text-sm text-[#201a1b] focus:outline-none input-focus-glow disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] opacity-70 hover:opacity-100 transition-opacity p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] font-bold text-xs sm:text-sm py-3 rounded-full shadow-md transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#3c2f47] border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ccc4cd]/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white px-3 text-[#4a454c] font-semibold">
                Or Continue With
              </span>
            </div>
          </div>

          {/* One-Click Google Auth */}
          <div>
            <button
              id="btn-login-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold text-[#201a1b] hover:bg-[#ebe0e0] transition-colors cursor-pointer bg-white"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-[#4e4353] border-t-transparent rounded-full animate-spin"></div>
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
              <span>Continue with Google Account</span>
            </button>
          </div>

          {/* Quick Demo Login Downside of Continue With */}
          {AUTH_CONFIG.ENABLE_INSTANT_SIGN_IN && (
            <div className="mt-5 pt-4 border-t border-[#ccc4cd]/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#675975] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                  Demo Quick Login:
                </span>
                <button
                  type="button"
                  onClick={() => handleFillDemo('clear')}
                  className="text-[10px] text-[#7b757d] hover:text-[#201a1b] underline cursor-pointer"
                >
                  Clear Fields
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  id="demo-login-uiu"
                  type="button"
                  onClick={() => handleFillDemo('uiu')}
                  title="Fill input fields"
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                    email === AUTH_CONFIG.DEMO_ACCOUNT.email
                      ? 'bg-[#675975] text-white border-[#675975] shadow-sm'
                      : 'bg-[#f7effa] hover:bg-[#ebd9f8] text-[#52445f] border-[#d2c0e0]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">school</span>
                    <span>{AUTH_CONFIG.DEMO_ACCOUNT.label}</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">
                    {AUTH_CONFIG.DEMO_ACCOUNT.email}
                  </span>
                </button>

                <button
                  id="btn-instant-demo-login"
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemoLogin('uiu')}
                  className="px-3.5 py-2 bg-[#675975] hover:bg-[#52445f] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">login</span>
                  <span>Instant Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <footer className="mt-6 text-center space-y-3">
          <p className="text-xs text-[#4a454c]">
            Don't have a scholar account yet?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-[#675975] font-bold hover:underline cursor-pointer ml-1"
            >
              Sign Up for Free
            </button>
          </p>
          <div className="flex justify-center gap-5 text-[11px] text-[#4a454c]/70">
            <button
              onClick={() => onShowToast('FERPA & Institutional privacy standards enabled.')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('SkillSwap academic honor code and peer guidelines.')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Institutional Terms
            </button>
            <button
              onClick={() => onShowToast('Campus Liaison Help Desk: support@skillswap.edu')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Help Center
            </button>
          </div>
        </footer>
      </main>

      {/* Forgot Password Dialog */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#ccc4cd]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#675975] text-[22px]">
                  lock_reset
                </span>
                <h3 className="text-base font-bold text-[#201a1b]">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-[#7b757d] hover:text-[#201a1b] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-[#4a454c] mb-4">
              Enter your registered academic email and we will send you a secure link to reset your password.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="scholar@university.edu"
                required
                className="w-full px-4 py-2.5 border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none focus:border-[#675975]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 border border-[#ccc4cd] rounded-xl text-xs font-semibold text-[#4a454c] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 bg-[#675975] hover:bg-[#52445f] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
