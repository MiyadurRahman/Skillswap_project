import { academicAssets } from '../assets';
import { dateFromToday, formatAcademicDate, formatAvailability } from '../utils/dateUtils';

const scheduledAt = (days, hour, minute = 0) => {
  const date = dateFromToday(days);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
};

export const initialSessions = [
  {
    id: 'session-sem-1',
    title: 'Advanced Quantitative Research Methods',
    status: 'Accepted',
    description:
      'This session focuses on the application of structural equation modeling (SEM) in social science research. We will review the core assumptions of SEM and work through a practical example using R.',
    learningGoals: [
      'Master data preparation for SEM',
      'Analyze model fit indices',
      'Interpret latent variable paths',
    ],
    duration: '90 Minutes',
    method: 'Video Call',
    platform: 'SkillSwap Connect',
    date: formatAcademicDate(1, false),
    time: '02:30 PM — 04:00 PM',
    startAt: scheduledAt(1, 14, 30),
    endAt: scheduledAt(1, 16),
    partner: {
      id: 'peer-aris-thorne',
      name: 'Dr. Aris Thorne',
      title: 'Senior Researcher, Data Science',
      avatarUrl: academicAssets.avatars.defaultFemaleScholar,
      isOnline: true,
      badges: ['Statistics', 'R-Programming'],
      skillsTeach: [
        'Advanced Quantitative Methods',
        'Structural Equation Modeling (SEM)',
        'R-Programming',
        'Multivariate Statistics',
        'Psychometrics',
      ],
      skillsWant: [
        'Deep Learning in PyTorch',
        'Qualitative Interview Design',
        'LaTeX Typography',
      ],
      rating: 4.9,
      reviewsCount: 88,
      credentials: ['PhD in Computational Statistics', 'Verified Senior Researcher'],
      responseSpeed: 'Usually responds in 1h',
      availability: `Available: ${formatAvailability(1, '02:30 PM')}`,
      preferredMode: 'Preferred: SkillSwap Connect Video Call',
    },
    notes: [
      {
        id: 'note-1',
        authorName: 'Dr. Aris Thorne',
        authorAvatar: academicAssets.avatars.defaultFemaleScholar,
        timestamp: '2 hours ago',
        text: "I've uploaded the preliminary dataset we'll be using. Please take a look at the variable definitions before our meeting on Wednesday.",
      },
    ],
  },
  {
    id: 'session-elena-1',
    title: 'Behavioral Economics & Heuristic Modeling',
    status: 'Accepted',
    description:
      'Explore cognitive bias frameworks, stochastic choice dynamics, and mathematical modeling of decision-making under uncertainty.',
    learningGoals: [
      'Understand Prospect Theory foundations',
      'Formulate stochastic utility models',
      'Run behavioral simulations in R',
    ],
    duration: '60 Minutes',
    method: 'Video Call',
    platform: 'SkillSwap Connect',
    date: formatAcademicDate(2, false),
    time: '03:00 PM — 04:00 PM',
    startAt: scheduledAt(2, 15),
    endAt: scheduledAt(2, 16),
    partner: {
      id: 'peer-1',
      name: 'Dr. Elena Vance',
      title: 'Senior Fellow in Behavioral Economics',
      avatarUrl: academicAssets.avatars.sarahKhan,
      isOnline: true,
      badges: ['Behavioral Modeling', 'Game Theory'],
      skillsTeach: [
        'Behavioral Modeling',
        'Statistical Analysis (R)',
        'Game Theory',
        'Cognitive Bias Research',
        'Academic Writing',
      ],
      skillsWant: [
        'Advanced Python',
        'Machine Learning Basics',
        'Data Visualization',
        'Public Speaking',
      ],
      rating: 4.9,
      reviewsCount: 124,
      credentials: ['PhD from Oxford', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 2h',
      availability: 'Available: Tue, Thu, Sat',
      preferredMode: 'Preferred: Virtual / Zoom',
    },
    notes: [
      {
        id: 'note-elena-1',
        authorName: 'Dr. Elena Vance',
        authorAvatar: academicAssets.avatars.sarahKhan,
        timestamp: 'Yesterday',
        text: 'Looking forward to our session! Please review chapter 4 on Kahneman-Tversky heuristic models beforehand.',
      },
    ],
  },
  {
    id: 'session-rafiqul-1',
    title: 'Data Structures & Dynamic Programming',
    status: 'Accepted',
    description:
      'Rigorous exploration of optimal substructure, memoization tables, and algorithmic graph partitioning for computational research.',
    learningGoals: [
      'Master dynamic programming recurrence relations',
      'Solve 2D grid path optimizations',
      'Analyze space-time complexity tradeoffs',
    ],
    duration: '90 Minutes',
    method: 'Video Call',
    platform: 'SkillSwap Connect',
    date: formatAcademicDate(3, false),
    time: '02:00 PM — 03:30 PM',
    startAt: scheduledAt(3, 14),
    endAt: scheduledAt(3, 15, 30),
    partner: {
      id: 'mentor-1',
      name: 'Dr. Rafiqul Islam',
      title: 'Professor in Algorithms & Discrete Math',
      avatarUrl: academicAssets.avatars.rafiqulIslam,
      isOnline: true,
      badges: ['Algorithms', 'Graph Theory'],
      skillsTeach: ['Dynamic Programming', 'Graph Theory', 'Algorithms', 'Discrete Math'],
      skillsWant: ['Full-Stack Cloud', 'React Interfaces'],
      rating: 4.9,
      reviewsCount: 124,
      credentials: ['UIU Faculty Lead', 'Verified Algorithmist'],
      responseSpeed: 'Usually responds in 30m',
      availability: formatAvailability(3, '02:00 PM'),
      preferredMode: 'SkillSwap Connect',
    },
    notes: [
      {
        id: 'note-raf-1',
        authorName: 'Dr. Rafiqul Islam',
        authorAvatar: academicAssets.avatars.rafiqulIslam,
        timestamp: '3 hours ago',
        text: 'Session confirmed. Please have your IDE and Python or C++ environment ready for live code execution.',
      },
    ],
  },
];
