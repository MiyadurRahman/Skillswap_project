export const drJulianVance = {
  id: 'mentor-julian-vance',
  name: 'Dr. Julian Vance',
  title: 'PhD in Quantum Computing • Stanford University',
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  isOnline: true,
  badge1: 'Top 1% Mentor 2023',
  badge2: '450+ Sessions Completed',
  skills: [
    {
      id: 'qm',
      name: 'Quantum Mechanics',
      level: 'Advanced Level • 60 min',
      duration: '60 min',
    },
    {
      id: 'qp',
      name: 'Qiskit Programming',
      level: 'Intermediate Level • 45 min',
      duration: '45 min',
    },
  ],
  cost: 250,
  bookingPolicy: [
    'Requests are usually confirmed within 12 hours.',
    'Rescheduling is free up to 24 hours before the session.',
    'Credits are only deducted once the mentor accepts.',
  ],
};

export const initialIncomingRequests = [
  {
    id: 'req-in-1',
    requester: {
      id: 'scholar-sarah-chen',
      name: 'Sarah Chen',
      title: 'Master’s Candidate in Computational Biology',
      university: 'Harvard University',
      avatarUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      rating: 4.95,
      completedSwaps: 28,
      isOnline: true,
    },
    requestedSkill: 'Applied Math & High-Energy Stochastic Modeling',
    skillLevel: 'Advanced Level • 60 min',
    offeredExchange: '250 Academic Credits',
    offeredSkill: 'Deep Learning with PyTorch & Multi-Omic Analysis',
    preferredDate: '2024-10-26',
    formattedDate: 'Saturday, Oct 26, 2024',
    preferredTimeSlot: 'Morning (09:00 - 12:00)',
    goals:
      'I am modeling latent gene expression networks under high noise. I need guidance on solving stochastic differential equations and validating convergence before submitting to Nature Methods.',
    status: 'pending', // 'pending' | 'accepted' | 'declined' | 'rescheduled'
    urgency: 'Expires in 10 hours',
    submittedAt: '2 hours ago',
    creditsOffered: 250,
  },
  {
    id: 'req-in-2',
    requester: {
      id: 'scholar-liam-oconnor',
      name: 'Liam O’Connor',
      title: 'Doctoral Researcher in Econometrics',
      university: 'Cambridge University',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      rating: 4.88,
      completedSwaps: 19,
      isOnline: true,
    },
    requestedSkill: 'Fourier Analysis & Signal Decomposition',
    skillLevel: 'Intermediate Level • 60 min',
    offeredExchange: '250 Academic Credits',
    offeredSkill: 'R-Studio Econometric Regressions & IV Estimation',
    preferredDate: '2024-10-27',
    formattedDate: 'Sunday, Oct 27, 2024',
    preferredTimeSlot: 'Afternoon (13:00 - 16:00)',
    goals:
      'Applying Fourier series transforms to high-frequency econometric series. Looking to test discrete wavelets and high-pass filtering diagnostics for our QJE resubmission.',
    status: 'pending',
    urgency: 'Expires in 18 hours',
    submittedAt: '5 hours ago',
    creditsOffered: 250,
  },
  {
    id: 'req-in-3',
    requester: {
      id: 'scholar-maya-patel',
      name: 'Maya Patel',
      title: 'Postdoctoral Fellow in Human-AI Interaction',
      university: 'MIT Media Lab',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      rating: 5.0,
      completedSwaps: 44,
      isOnline: false,
    },
    requestedSkill: 'Python Scientific Computing & High-Performance Optimization',
    skillLevel: 'Advanced Level • 90 min',
    offeredExchange: 'Direct Swap + 100 Academic Credits',
    offeredSkill: 'Figma for Scientific Posters & Interactive Web Canvases',
    preferredDate: '2024-10-29',
    formattedDate: 'Tuesday, Oct 29, 2024',
    preferredTimeSlot: 'Evening (17:00 - 20:00)',
    goals:
      'Optimizing high-dimensional t-SNE and custom loss functions in NumPy for an interactive scientific simulation canvas for our upcoming conference presentation.',
    status: 'pending',
    urgency: 'Expires in 22 hours',
    submittedAt: '1 day ago',
    creditsOffered: 100,
  },
  {
    id: 'req-in-4',
    requester: {
      id: 'scholar-marcus-brody',
      name: 'Marcus Brody',
      title: 'Senior Scholar, Department of Physics',
      university: 'Stanford University',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      rating: 4.75,
      completedSwaps: 14,
      isOnline: true,
    },
    requestedSkill: 'LaTeX Typesetting & Mathematical Proof Formatting',
    skillLevel: 'Intermediate Level • 45 min',
    offeredExchange: '200 Academic Credits',
    offeredSkill: 'Introductory Quantum Circuit Simulation',
    preferredDate: '2024-10-24',
    formattedDate: 'Thursday, Oct 24, 2024',
    preferredTimeSlot: 'Afternoon (13:00 - 16:00)',
    goals:
      'Formatting my physics honors thesis in LaTeX with complex TikZ commutative diagrams and custom biblatex citations.',
    status: 'accepted',
    urgency: 'Confirmed',
    submittedAt: '2 days ago',
    creditsOffered: 200,
  },
];

export const initialOutgoingRequests = [
  {
    id: 'req-out-1',
    mentor: drJulianVance,
    requestedSkill: 'Quantum Mechanics',
    skillLevel: 'Advanced Level • 60 min',
    cost: 250,
    preferredDate: '2024-10-28',
    formattedDate: 'Monday, Oct 28, 2024',
    preferredTimeSlot: 'Morning (09:00 - 12:00)',
    goals:
      'Working on quantum error correction circuits and state decoherence models in superconducting qubits.',
    status: 'pending',
    submittedAt: 'Just now',
  },
  {
    id: 'req-out-2',
    mentor: {
      id: 'peer-aris-thorne',
      name: 'Dr. Aris Thorne',
      title: 'Senior Researcher, Data Science',
      university: 'Stanford Institute for Computational Research',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      badge1: 'Verified Senior Researcher',
      badge2: '88 Reviews • ★ 4.9',
    },
    requestedSkill: 'Structural Equation Modeling (SEM) in R',
    skillLevel: 'Advanced Level • 90 min',
    cost: 250,
    preferredDate: '2024-10-24',
    formattedDate: 'Wednesday, Oct 24, 2024',
    preferredTimeSlot: 'Afternoon (02:30 PM)',
    goals:
      'Reviewing assumptions of latent variable models and working through practical fit diagnostics.',
    status: 'accepted',
    submittedAt: '3 days ago',
  },
];
