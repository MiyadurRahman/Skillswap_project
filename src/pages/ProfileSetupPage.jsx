import React, { useEffect, useState, useRef } from 'react';
import { academicAssets, resolveAvatarForName } from '../assets';
import { useAuth } from '../context/auth';
import { MobileNav } from '../component/MobileNav';

export const ProfileSetupPage = ({
  userProfile,
  onUpdateProfile,
  onNavigateScreen,
  onShowToast,
}) => {
  const { currentUser, logOut, updateProfileData } = useAuth();
  const nameParts = (userProfile?.name || '').split(' ');
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState(() => nameParts[0] || '');
  const [lastName, setLastName] = useState(() => nameParts.slice(1).join(' '));
  const [university, setUniversity] = useState(() => userProfile?.university || '');
  const [academicLevel, setAcademicLevel] = useState(
    () => userProfile?.academicLevel || ''
  );
  const [isCustomAcademicLevel, setIsCustomAcademicLevel] = useState(false);
  const [isAcademicLevelMenuOpen, setIsAcademicLevelMenuOpen] = useState(false);
  const [academicLevelSearch, setAcademicLevelSearch] = useState('');
  const academicLevelMenuRef = useRef(null);
  const [bio, setBio] = useState(() => userProfile?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(
    () =>
      userProfile?.avatarUrl ||
      resolveAvatarForName(userProfile?.name || 'Scholar', academicAssets.avatars.defaultMaleScholar)
  );
  const [saving, setSaving] = useState(false);

  const [expertise, setExpertise] = useState(() => [...(userProfile?.expertiseAreas || [])]);
  const [learningGoals, setLearningGoals] = useState(
    () => [...(userProfile?.learningGoals || [])]
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);

  const fileInputRef = useRef(null);
  const academicLevels = [
    { value: 'College / HSC Student', label: 'College / HSC Student' },
    { value: 'Diploma Student', label: 'Diploma Student' },
    { value: 'BSc in Computer Science & Engineering', label: 'BSc in Computer Science & Engineering' },
    { value: 'Undergraduate', label: "Undergraduate / Bachelor's Student" },
    { value: "Master's Student", label: "Master's Student" },
    { value: 'MPhil Student', label: 'MPhil Student' },
    { value: 'PhD Candidate', label: 'PhD Student / Candidate' },
    { value: 'Postdoctoral Fellow', label: 'Postdoctoral Researcher / Fellow' },
    { value: 'Researcher', label: 'Researcher' },
    { value: 'Lecturer', label: 'Lecturer' },
    { value: 'Assistant Professor', label: 'Assistant Professor' },
    { value: 'Associate Professor', label: 'Associate Professor' },
    { value: 'Professor', label: 'Professor' },
    { value: 'Graduate', label: 'Graduate / Alumni' },
  ];

  useEffect(() => {
    if (!isAcademicLevelMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!academicLevelMenuRef.current?.contains(event.target)) setIsAcademicLevelMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsAcademicLevelMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isAcademicLevelMenuOpen]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      onShowToast('Please choose an image file.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        const MAX = 500;
        let { width, height } = img;
        if (width > height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height >= width && height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        try {
          setAvatarPreview(canvas.toDataURL('image/jpeg', 0.8));
          onShowToast('Photo selected. Save your profile to apply the change.', 'info');
        } catch {
          setAvatarPreview(src);
          onShowToast('Photo selected. Save your profile to apply the change.', 'info');
        }
      };
      img.onerror = () => {
        setAvatarPreview(src);
        onShowToast('Photo selected. Save your profile to apply the change.', 'info');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleAddExpertise = () => {
    if (newSkillInput.trim() && !expertise.includes(newSkillInput.trim())) {
      setExpertise([...expertise, newSkillInput.trim()]);
      setNewSkillInput('');
      setShowSkillInput(false);
      onShowToast(`Added expertise: ${newSkillInput.trim()}`, 'success');
    }
  };

  const handleRemoveExpertise = (skill) => {
    setExpertise(expertise.filter((s) => s !== skill));
    onShowToast(`Removed skill: ${skill}`, 'success');
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim() && !learningGoals.includes(newGoalInput.trim())) {
      setLearningGoals([...learningGoals, newGoalInput.trim()]);
      setNewGoalInput('');
      setShowGoalInput(false);
      onShowToast(`Added learning goal: ${newGoalInput.trim()}`, 'success');
    }
  };

  const handleRemoveGoal = (goal) => {
    setLearningGoals(learningGoals.filter((g) => g !== goal));
    onShowToast(`Removed goal: ${goal}`, 'success');
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
        skillsTeach: expertise,
        skillsWant: learningGoals,
      };

      try {
        if (currentUser) {
          await updateProfileData(payload);
        }
        if (onUpdateProfile) {
          onUpdateProfile(payload);
        }
        onShowToast('Academic profile saved successfully.', 'success');
        onNavigateScreen('dashboard');
      } catch (error) {
        console.warn('Profile save failed:', error);
        onShowToast(error?.message || 'Could not save your profile. Please try again.', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      onShowToast('Signed out of scholar session.', 'success');
      onNavigateScreen('login');
    } catch (error) {
      console.error('Sign out failed:', error);
      onShowToast('Could not sign out. Please try again.', 'error');
    }
  };

  return (
    <div id="screen-profile-setup" className="bg-[#fff8f7] text-[#201a1b] min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-[#4e4353] h-[72px] w-full sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1280px] mx-auto h-full">
          <div className="flex items-center gap-2 sm:gap-8">
            <MobileNav
              accent="#4e4353"
              items={[
                { label: 'Dashboard', icon: 'dashboard', onClick: () => onNavigateScreen('dashboard') },
                { label: 'Skill Manager', icon: 'school', onClick: () => onNavigateScreen('skill-manager') },
                { label: 'Discover', icon: 'explore', onClick: () => onNavigateScreen('discover') },
                { label: 'Requests', icon: 'inbox', onClick: () => onNavigateScreen('requests') },
                { label: 'My Sessions', icon: 'calendar_today', onClick: () => onNavigateScreen('session-details') },
              ]}
            />
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
                  <label htmlFor="profile-academic-level" className="text-xs font-semibold text-[#4a454c] block mb-1">
                    Degree / Status
                  </label>
                  <div className="relative" ref={academicLevelMenuRef}>
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b757d] text-[18px]">
                      school
                    </span>
                    {isCustomAcademicLevel ? (
                      <div className="space-y-1.5">
                        <input
                          id="profile-academic-level"
                          type="text"
                          value={academicLevel}
                          onChange={(event) => setAcademicLevel(event.target.value)}
                          placeholder="Enter your degree or academic status"
                          disabled={saving}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-xs sm:text-sm focus:outline-none input-focus-glow transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomAcademicLevel(false);
                            setAcademicLevel('');
                          }}
                          className="text-[11px] font-semibold text-[#675975] hover:underline cursor-pointer"
                        >
                          Choose from degree/status list
                        </button>
                      </div>
                    ) : (
                      <button
                        id="profile-academic-level"
                        type="button"
                        onClick={() => {
                          setIsAcademicLevelMenuOpen((open) => !open);
                          setAcademicLevelSearch('');
                        }}
                        disabled={saving}
                        aria-haspopup="listbox"
                        aria-expanded={isAcademicLevelMenuOpen}
                        className="w-full flex items-center justify-between gap-3 pl-10 pr-3 py-2.5 bg-white border border-[#ccc4cd] rounded-xl text-left text-xs sm:text-sm focus:outline-none input-focus-glow transition-all cursor-pointer"
                      >
                        <span className={academicLevel ? 'truncate text-[#201a1b]' : 'text-[#7b757d]'}>
                          {academicLevels.find((level) => level.value === academicLevel)?.label || academicLevel || 'Select your degree / status'}
                        </span>
                        <span className={`material-symbols-outlined shrink-0 text-[18px] text-[#7b757d] transition-transform ${isAcademicLevelMenuOpen ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                    )}
                    {isAcademicLevelMenuOpen && (
                      <div
                        role="listbox"
                        aria-label="Degree or academic status"
                        className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-[#d9cbd7] bg-white p-1.5 shadow-xl"
                      >
                        <div className="relative mb-1.5">
                          <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#887580]">
                            search
                          </span>
                          <input
                            type="search"
                            value={academicLevelSearch}
                            onChange={(e) => setAcademicLevelSearch(e.target.value)}
                            placeholder="Search degree or status..."
                            autoFocus
                            className="w-full rounded-lg border border-[#e1d6df] bg-[#fff8f7] py-2 pl-8 pr-3 text-xs text-[#201a1b] outline-none focus:border-[#a992bb]"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          <button
                            type="button"
                            role="option"
                            aria-selected={false}
                            onClick={() => {
                              setAcademicLevel('');
                              setIsCustomAcademicLevel(true);
                              setIsAcademicLevelMenuOpen(false);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#675975] hover:bg-[#f7eeee] cursor-pointer"
                          >
                            My degree/status isn’t listed — enter it manually
                          </button>
                          {academicLevels
                            .filter((level) => level.label.toLowerCase().includes(academicLevelSearch.trim().toLowerCase()))
                            .map((level) => (
                              <button
                                key={level.value}
                                type="button"
                                role="option"
                                aria-selected={academicLevel === level.value}
                                onClick={() => {
                                  setAcademicLevel(level.value);
                                  setIsAcademicLevelMenuOpen(false);
                                }}
                                className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                                  academicLevel === level.value
                                    ? 'bg-[#eeddf2] font-semibold text-[#473b4b]'
                                    : 'text-[#4a454c] hover:bg-[#f7eeee]'
                                }`}
                              >
                                {level.label}
                              </button>
                            ))}
                          {academicLevels.every(
                            (level) => !level.label.toLowerCase().includes(academicLevelSearch.trim().toLowerCase())
                          ) && (
                            <p className="px-3 py-4 text-center text-xs text-[#7b757d]">No degree or status found.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
