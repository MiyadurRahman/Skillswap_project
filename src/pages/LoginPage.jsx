import React, { useState, useEffect, useRef } from 'react';
import { academicAssets } from '../assets';

export const LoginPage = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onOpenSSO,
  onShowToast,
}) => {
  const [email, setEmail] = useState('scholar@university.edu');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef(null);

  // Mouse parallax interaction on the glass card
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const xAxis = (cardCenterX - e.clientX) / 45;
      const yAxis = (cardCenterY - e.clientY) / 45;
      setTilt({
        rotateX: Math.max(-8, Math.min(8, yAxis)),
        rotateY: Math.max(-8, Math.min(8, -xAxis)),
      });
    };

    const handleMouseLeave = () => {
      setTilt({ rotateX: 0, rotateY: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onShowToast('Welcome back, Alex Rivera! Loading dashboard...');
    onLoginSuccess();
  };

  return (
    <div
      id="screen-scholar-login"
      className="min-h-screen flex flex-col justify-center items-center overflow-x-hidden relative mesh-academic-bg px-4 py-12"
    >
      {/* Decorative ambient background glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c5b3d3]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ffdada]/30 rounded-full blur-3xl"></div>
      </div>

      {/* Main Login Container */}
      <main className="w-full max-w-[480px] z-10 transition-all">
        {/* Brand Identity Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#d2c0e0] tracking-tight mb-2 bg-[#4e4353] inline-block px-5 py-1.5 rounded-xl shadow-md">
            SkillSwap
          </h1>
          <p className="text-sm text-[#4a454c] opacity-90 mt-1 font-medium">
            Advancing academic excellence through peer collaboration.
          </p>
        </div>

        {/* Login Card with 3D subtle tilt */}
        <div
          ref={cardRef}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
          className="academic-glass rounded-2xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40 bg-white/85 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#201a1b] mb-1">Scholar Login</h2>
            <p className="text-xs text-[#4a454c]">
              Access your institutional skill dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* University Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-[#4a454c] block tracking-wide"
              >
                University Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] opacity-70">
                  school
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@university.edu"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-sm text-[#201a1b] focus:outline-none input-focus-glow transition-all"
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
                  onClick={() =>
                    onShowToast('Password reset link sent to scholar@university.edu')
                  }
                  className="text-xs text-[#675975] hover:text-[#4e4353] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] opacity-70">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-sm text-[#201a1b] focus:outline-none input-focus-glow transition-all"
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
              className="w-full bg-[#c5b3d3] hover:bg-[#a992bb] text-[#52445f] hover:text-[#22162e] font-semibold text-sm py-3.5 rounded-full shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer mt-2"
            >
              Log In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#ccc4cd]/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-white/95 px-3 text-[#4a454c] font-semibold">
                Continue with
              </span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-login-sso"
              type="button"
              onClick={onOpenSSO}
              className="flex items-center justify-center gap-2 px-3 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold text-[#201a1b] hover:bg-[#ebe0e0] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#675975]">
                account_balance
              </span>
              University SSO
            </button>
            <button
              id="btn-login-eduid"
              type="button"
              onClick={onOpenSSO}
              className="flex items-center justify-center gap-2 px-3 py-2.5 border border-[#ccc4cd] rounded-full text-xs font-semibold text-[#201a1b] hover:bg-[#ebe0e0] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#675975]">
                badge
              </span>
              EduID
            </button>
          </div>
        </div>

        {/* Footer Meta */}
        <footer className="mt-8 text-center space-y-3">
          <p className="text-xs text-[#4a454c]">
            New to SkillSwap?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-[#675975] font-bold hover:underline cursor-pointer"
            >
              Request an Invitation
            </button>
          </p>
          <div className="flex justify-center gap-5 text-[11px] text-[#4a454c]/70">
            <button
              onClick={() => onShowToast('Academic Privacy Policy (FERPA & GDPR compliant)')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('Institutional Skill Exchange Terms')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Institutional Terms
            </button>
            <button
              onClick={() => onShowToast('Contacting Campus Liaison Help Desk')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Help Center
            </button>
          </div>
        </footer>
      </main>

      {/* Side Image Decor (Institutional Aesthetic) */}
      <div
        id="login-quote-card"
        className="hidden xl:block fixed right-10 bottom-10 w-[300px] h-[380px] rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 z-10 border border-white/40"
      >
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: `url('${academicAssets.photos.inspirationalLibrary}')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#4e4353]/90 via-[#4e4353]/40 to-transparent flex flex-col justify-end p-6">
            <p className="text-white text-sm font-medium leading-relaxed italic">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
            <span className="text-white/80 text-xs mt-2 font-semibold">— B.B. King</span>
          </div>
        </div>
      </div>
    </div>
  );
};
