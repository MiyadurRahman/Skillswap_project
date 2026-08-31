import React, { useState, useRef } from 'react';
import { academicAssets } from '../assets';

export const ProfileSetupPage = ({
  userProfile,
  onUpdateProfile,
  onNavigateScreen,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('Julian');
  const [lastName, setLastName] = useState('Sterling');
  const [university, setUniversity] = useState('Stanford University');
  const [academicLevel, setAcademicLevel] = useState('PhD Candidate');
  const [bio, setBio] = useState(
    "Doctoral candidate focusing on high-energy mathematical physics and stochastic modeling. Passionate about cross-disciplinary peer tutoring and helping graduate students bridge the gap between abstract algebra and computational ML algorithms."
  );
  const [avatarPreview, setAvatarPreview] = useState(academicAssets.avatars.defaultScholar);

  const [expertise, setExpertise] = useState([
    'Applied Math',
    'LaTeX',
    'Python',
    'Fourier Analysis',
  ]);
  const [learningGoals, setLearningGoals] = useState([
    'Game Theory',
    'R-Studio',
    'CRISPR Data Analysis',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result);
          onShowToast('Profile photo uploaded and processed.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExpertise = () => {
    if (newSkillInput.trim() && !expertise.includes(newSkillInput.trim())) {
      setExpertise([...expertise, newSkillInput.trim()]);
      setNewSkillInput('');
      setShowSkillInput(false);
      onShowToast(`Added expertise: ${newSkillInput.trim()}`);
    }
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim() && !learningGoals.includes(newGoalInput.trim())) {
      setLearningGoals([...learningGoals, newGoalInput.trim()]);
      setNewGoalInput('');
      setShowGoalInput(false);
      onShowToast(`Added learning goal: ${newGoalInput.trim()}`);
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      onUpdateProfile({
        name: `${firstName} ${lastName}`,
        university,
        academicLevel,
        bio,
        avatarUrl: avatarPreview,
        expertiseAreas: expertise,
        learningGoals,
      });
      onShowToast('Academic Profile successfully submitted & verified on-chain!');
      onNavigateScreen('dashboard');
    }
  };

  return (
    <div id="screen-profile-setup" className="bg-[#fff8f7] text-[#201a1b] min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-[#4e4353] h-[72px] w-full sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1280px] mx-auto h-full">
          <div className="flex items-center gap-8">
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-[#c5b3d3] cursor-pointer hover:opacity-90 transition-opacity"
            >
              SkillSwap
            </span>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-[#efdbfd] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-[#efdbfd] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                SEARCH
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onShowToast('No unread notifications')}
              className="text-[#c5b3d3] p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button
              onClick={() => onShowToast('Your scholar inbox is up to date.')}
              className="text-[#c5b3d3] p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </button>
            <div className="w-9 h-9 rounded-full border-2 border-[#c5b3d3] overflow-hidden">
              <img
                src={avatarPreview}
                alt="Scholar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-[1280px] mx-auto">
        {/* SideNavBar */}
        <aside className="w-64 bg-[#fdf1f1] border-r border-[#ccc4cd]/30 min-h-[calc(100vh-72px)] p-6 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-[#7b757d] uppercase tracking-wider">
                Profile Setup
              </p>
              <h2 className="text-base font-bold text-[#675975]">Scholar Onboarding</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  currentStep === 1
                    ? 'bg-[#c5b3d3] text-[#52445f] font-bold shadow-xs'
                    : 'text-[#4a454c]'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span>Basic Information</span>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  currentStep === 2
                    ? 'bg-[#c5b3d3] text-[#52445f] font-bold shadow-xs'
                    : 'text-[#4a454c]'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span>Skills & Disciplines</span>
              </div>
              <div
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  currentStep === 3
                    ? 'bg-[#c5b3d3] text-[#52445f] font-bold shadow-xs'
                    : 'text-[#4a454c]'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <span>Review & Verification</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/70 rounded-2xl border border-[#ccc4cd]/30 text-[11px] text-[#4a454c] space-y-2">
            <p className="font-semibold text-[#675975] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              FERPA Compliant
            </p>
            <p>
              Your academic profile is only shared with verified peers across participating university nodes.
            </p>
          </div>
        </aside>

        {/* Form Main Stage */}
        <main className="flex-1 p-6 sm:p-10 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#675975] uppercase tracking-wider">
                Step {currentStep} of 3
              </span>
              <span className="text-xs text-[#7b757d]">
                {currentStep === 1 && 'Identity & Department'}
                {currentStep === 2 && 'Exchanges & Goals'}
                {currentStep === 3 && 'Final Verification'}
              </span>
            </div>
            {/* Step Progress Bar */}
            <div className="w-full h-2 bg-[#ebe0e0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#675975] transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40">
              <h2 className="text-xl font-bold text-[#201a1b]">Identity & Academic Bio</h2>

              {/* Photo Upload Area */}
              <div className="flex items-center gap-6 pb-6 border-b border-[#ccc4cd]/30">
                <div className="relative group">
                  <img
                    src={avatarPreview}
                    alt="Scholar avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#efdbfd] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer"
                  >
                    Change
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#201a1b]">Profile Portrait</h3>
                  <p className="text-xs text-[#7b757d] mt-0.5">
                    Clear scholarly headshot recommended for verification.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2.5 px-3 py-1 bg-[#fdf1f1] hover:bg-[#f7ebeb] text-[#675975] rounded-full text-xs font-semibold transition-colors border border-[#ccc4cd]/40"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a454c]">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a454c]">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow"
                  />
                </div>
              </div>

              {/* Academic Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a454c]">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4a454c]">Academic Standing</label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow"
                  >
                    <option>PhD Candidate</option>
                    <option>Postdoctoral Fellow</option>
                    <option>Master's Student</option>
                    <option>Undergraduate Researcher</option>
                    <option>Faculty / Professor</option>
                  </select>
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4a454c]">
                  Research Bio & Focus
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills & Disciplines */}
          {currentStep === 2 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40">
              <div>
                <h2 className="text-xl font-bold text-[#201a1b]">Disciplines & Exchanges</h2>
                <p className="text-xs text-[#4a454c] mt-1">
                  Specify what you can teach and what you are eager to learn from other researchers.
                </p>
              </div>

              {/* Teaching Expertise */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#675975] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    Skills You Can Mentor (Offer)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSkillInput(true)}
                    className="text-xs font-bold text-[#675975] hover:underline flex items-center gap-1"
                  >
                    + Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-[#fdf1f1] rounded-2xl border border-[#ccc4cd]/30">
                  {expertise.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eeddf2] text-[#6c6071] rounded-full text-xs font-semibold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setExpertise(expertise.filter((s) => s !== skill))}
                        className="hover:text-red-700 p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {showSkillInput && (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddExpertise()}
                        placeholder="Type skill..."
                        className="px-3 py-1 bg-white border border-[#675975] rounded-full text-xs focus:outline-none w-32"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddExpertise}
                        className="p-1 bg-[#675975] text-white rounded-full text-xs"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Goals */}
              <div className="space-y-3 pt-4 border-t border-[#ccc4cd]/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#675975] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Skills You Want to Learn (Request)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGoalInput(true)}
                    className="text-xs font-bold text-[#675975] hover:underline flex items-center gap-1"
                  >
                    + Add Goal
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-[#fdf1f1] rounded-2xl border border-[#ccc4cd]/30">
                  {learningGoals.map((goal, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffdada] text-[#5c3f40] rounded-full text-xs font-semibold"
                    >
                      {goal}
                      <button
                        type="button"
                        onClick={() => setLearningGoals(learningGoals.filter((g) => g !== goal))}
                        className="hover:text-red-700 p-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {showGoalInput && (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={newGoalInput}
                        onChange={(e) => setNewGoalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                        placeholder="Type goal..."
                        className="px-3 py-1 bg-white border border-[#675975] rounded-full text-xs focus:outline-none w-32"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddGoal}
                        className="p-1 bg-[#675975] text-white rounded-full text-xs"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Final Verification */}
          {currentStep === 3 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40">
              <div className="flex items-center gap-4 pb-6 border-b border-[#ccc4cd]/30">
                <img
                  src={avatarPreview}
                  alt="Review Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#675975]"
                />
                <div>
                  <h2 className="text-xl font-bold text-[#201a1b]">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-xs text-[#675975] font-semibold">
                    {academicLevel} • {university}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#7b757d] uppercase tracking-wider mb-2">
                  Academic Focus
                </h3>
                <p className="text-xs text-[#4a454c] leading-relaxed bg-[#fdf1f1] p-4 rounded-xl">
                  {bio}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#675975] uppercase tracking-wider mb-2">
                    Mentoring Expertise ({expertise.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {expertise.map((s, i) => (
                      <span key={i} className="text-xs bg-[#eeddf2] text-[#6c6071] px-2.5 py-1 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#5c3f40] uppercase tracking-wider mb-2">
                    Learning Goals ({learningGoals.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {learningGoals.map((g, i) => (
                      <span key={i} className="text-xs bg-[#ffdada] text-[#5c3f40] px-2.5 py-1 rounded-full font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-6 py-2.5 border border-[#ccc4cd] hover:bg-[#ebe0e0] text-[#201a1b] rounded-full text-xs font-bold transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              type="button"
              onClick={handleContinue}
              className="px-8 py-3 bg-[#c5b3d3] hover:bg-[#a992bb] text-[#52445f] hover:text-[#22162e] rounded-full text-xs font-bold transition-all duration-200 ambient-lift cursor-pointer"
            >
              {currentStep === 3 ? 'Complete Verification' : 'Continue to Next Step'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
