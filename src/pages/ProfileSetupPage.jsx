import React, { useState, useEffect, useRef } from 'react';
import { academicAssets, resolveAvatarForName } from '../assets';
import { useAuth } from '../context/AuthContext';

export const ProfileSetupPage = ({
  userProfile,
  onUpdateProfile,
  onNavigateScreen,
  onShowToast,
}) => {
  const { currentUser, logOut, updateProfileData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('Tanvir');
  const [lastName, setLastName] = useState('Ahmed');
  const [university, setUniversity] = useState('United International University (UIU)');
  const [academicLevel, setAcademicLevel] = useState('BSc in Computer Science & Engineering');
  const [bio, setBio] = useState(
    "Undergraduate researcher at United International University (UIU) specializing in Data Structures, Algorithms, and System Design. Passionate about academic peer learning."
  );
  const [avatarPreview, setAvatarPreview] = useState(academicAssets.avatars.tanvirAhmed);
  const [saving, setSaving] = useState(false);

  const [expertise, setExpertise] = useState([
    'Data Structures',
    'Algorithms',
    'C++',
    'Python',
  ]);
  const [learningGoals, setLearningGoals] = useState([
    'Machine Learning',
    'Artificial Intelligence',
    'Cloud Systems',
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) {
        const parts = userProfile.name.split(' ');
        setFirstName(parts[0] || 'Scholar');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (userProfile.university) setUniversity(userProfile.university);
      if (userProfile.academicLevel) setAcademicLevel(userProfile.academicLevel);
      if (userProfile.bio) setBio(userProfile.bio);
      if (userProfile.avatarUrl) {
        setAvatarPreview(userProfile.avatarUrl);
      } else {
        setAvatarPreview(resolveAvatarForName(userProfile.name || firstName || 'Scholar', academicAssets.avatars.defaultMaleScholar));
      }
      if (userProfile.expertiseAreas && userProfile.expertiseAreas.length > 0) {
        setExpertise(userProfile.expertiseAreas);
      }
      if (userProfile.learningGoals && userProfile.learningGoals.length > 0) {
        setLearningGoals(userProfile.learningGoals);
      }
    }
  }, [userProfile]);

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

  const handleRemoveExpertise = (skill) => {
    setExpertise(expertise.filter((s) => s !== skill));
    onShowToast(`Removed skill: ${skill}`);
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim() && !learningGoals.includes(newGoalInput.trim())) {
      setLearningGoals([...learningGoals, newGoalInput.trim()]);
      setNewGoalInput('');
      setShowGoalInput(false);
      onShowToast(`Added learning goal: ${newGoalInput.trim()}`);
    }
  };

  const handleRemoveGoal = (goal) => {
    setLearningGoals(learningGoals.filter((g) => g !== goal));
    onShowToast(`Removed goal: ${goal}`);
  };

  const handleContinue = async () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      setSaving(true);
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = {
        name: fullName || 'Scholar',
        university,
        academicLevel,
        bio,
        avatarUrl: avatarPreview,
        expertiseAreas: expertise,
        learningGoals,
      };

      try {
        if (currentUser) {
          await updateProfileData(payload);
        }
        if (onUpdateProfile) {
          onUpdateProfile(payload);
        }
        onShowToast('Academic profile updated & saved successfully!');
        onNavigateScreen('dashboard');
      } catch (err) {
        onShowToast('Profile saved locally.');
        if (onUpdateProfile) onUpdateProfile(payload);
        onNavigateScreen('dashboard');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      onShowToast('Signed out of scholar session.');
      onNavigateScreen('login');
    } catch (err) {
      onShowToast('Logged out.');
      onNavigateScreen('login');
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
                className="text-white/80 hover:text-[#efdbfd] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="hidden sm:inline text-xs text-[#c5b3d3] font-medium">
                {currentUser.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Form Container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Step Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-[#201a1b]">
              Scholar Profile Setup
            </h1>
            <span className="text-xs font-bold text-[#675975] bg-[#ebd9f8] px-3 py-1 rounded-full">
              Step {currentStep} of 3
            </span>
          </div>

          <div className="w-full bg-[#e6dddd] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#675975] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 text-center text-xs font-medium text-[#7b757d] mt-2">
            <span className={currentStep >= 1 ? 'text-[#675975] font-bold' : ''}>
              1. Scholar Identity
            </span>
            <span className={currentStep >= 2 ? 'text-[#675975] font-bold' : ''}>
              2. Skills & Exchange
            </span>
            <span className={currentStep >= 3 ? 'text-[#675975] font-bold' : ''}>
              3. Verification
            </span>
          </div>
        </div>

        <main>
          {/* STEP 1: Academic Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#ccc4cd]/30">
                <div className="relative group">
                  <img
                    src={avatarPreview}
                    alt="Scholar avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#c5b3d3] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                  >
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    <span>Change</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-base font-bold text-[#201a1b]">Profile Photo</h3>
                  <p className="text-xs text-[#4a454c]">
                    Upload a high-resolution academic headshot or institutional photo.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#675975] font-bold hover:underline cursor-pointer"
                  >
                    Upload Image File
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#4a454c] block mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none input-focus-glow"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4a454c] block mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none input-focus-glow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#4a454c] block mb-1">
                    Academic Institution
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none input-focus-glow"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4a454c] block mb-1">
                    Degree / Status
                  </label>
                  <select
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none input-focus-glow"
                  >
                    <option value="Undergraduate">Undergraduate Student</option>
                    <option value="Master's Student">Master's Student</option>
                    <option value="PhD Candidate">PhD Candidate / Researcher</option>
                    <option value="Postdoctoral Fellow">Postdoctoral Fellow</option>
                    <option value="Assistant Professor">Faculty / Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4a454c] block mb-1">
                  Academic Focus & Research Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your research area, thesis topic, and study interests..."
                  className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#ccc4cd] rounded-xl text-xs text-[#201a1b] focus:outline-none input-focus-glow"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills Offered & Needed */}
          {currentStep === 2 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40 shadow-sm">
              {/* Skills Offered */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#675975]">
                      Skills You Can Mentor & Teach
                    </h3>
                    <p className="text-xs text-[#4a454c]">
                      Disciplines, software, lab methodologies, or topics you feel confident coaching.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSkillInput(true)}
                    className="px-3 py-1.5 bg-[#675975] text-white rounded-full text-xs font-semibold hover:bg-[#52445f] transition-colors cursor-pointer"
                  >
                    + Add Skill
                  </button>
                </div>

                {showSkillInput && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="e.g. Statistical Analysis in R, LaTeX typesetting"
                      className="flex-1 px-3 py-2 border border-[#ccc4cd] rounded-xl text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExpertise()}
                    />
                    <button
                      type="button"
                      onClick={handleAddExpertise}
                      className="px-4 py-2 bg-[#675975] text-white rounded-xl text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSkillInput(false)}
                      className="px-3 py-2 border border-[#ccc4cd] rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eeddf2] text-[#6c6071] rounded-full text-xs font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(skill)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="pt-6 border-t border-[#ccc4cd]/30">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#5c3f40]">
                      Topics & Skills You Wish to Learn
                    </h3>
                    <p className="text-xs text-[#4a454c]">
                      Academic disciplines or research tools you want peer coaching in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoalInput(true)}
                    className="px-3 py-1.5 bg-[#5c3f40] text-white rounded-full text-xs font-semibold hover:bg-[#43292a] transition-colors cursor-pointer"
                  >
                    + Add Goal
                  </button>
                </div>

                {showGoalInput && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newGoalInput}
                      onChange={(e) => setNewGoalInput(e.target.value)}
                      placeholder="e.g. Deep Learning, Bayesian Inference"
                      className="flex-1 px-3 py-2 border border-[#ccc4cd] rounded-xl text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                    />
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="px-4 py-2 bg-[#5c3f40] text-white rounded-xl text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGoalInput(false)}
                      className="px-3 py-2 border border-[#ccc4cd] rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {learningGoals.map((goal, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffdada] text-[#5c3f40] rounded-full text-xs font-medium"
                    >
                      <span>{goal}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(goal)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Final Verification */}
          {currentStep === 3 && (
            <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-8 ambient-lift border border-[#ccc4cd]/40 shadow-sm">
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
                  {currentUser?.email && (
                    <p className="text-[11px] text-[#7b757d]">{currentUser.email}</p>
                  )}
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
                className="px-6 py-2.5 border border-[#ccc4cd] hover:bg-[#ebe0e0] text-[#201a1b] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="px-8 py-3 bg-[#c5b3d3] hover:bg-[#b59ec5] text-[#3c2f47] rounded-full text-xs font-bold transition-all duration-200 ambient-lift cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#3c2f47] border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving profile...</span>
                </>
              ) : (
                <span>{currentStep === 3 ? 'Save & Go to Dashboard' : 'Continue to Next Step'}</span>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
