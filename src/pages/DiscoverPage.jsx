import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const DiscoverPage = ({
  onNavigateScreen,
  onOpenMentorModal,
  onOpenMeetingModal,
  onOpenWalletModal,
  onShowToast,
  userProfile: propProfile,
  onSelectPeerProfile,
  onCreateSession,
  onSelectSession,
}) => {
  const { currentUser, userProfile: authProfile, logOut } = useAuth();
  const userProfile = authProfile || propProfile || {};

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState('discover');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    'Data Science': false,
    'Academic Writing': true,
    'UI/UX Design': false,
    'Microeconomics': false,
  });
  const [minRating, setMinRating] = useState(4.0);
  const [availability, setAvailability] = useState('Anytime');
  const [academicLevel, setAcademicLevel] = useState('PhD Candidate');
  const [activeTrendingTag, setActiveTrendingTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Request Session from Discover Modal states
  const [requestingPeer, setRequestingPeer] = useState(null);
  const [reqTopic, setReqTopic] = useState('');
  const [reqSlot, setReqSlot] = useState('');
  const [reqOfferedSkill, setReqOfferedSkill] = useState('Python Data Science');
  const [reqNote, setReqNote] = useState('');

  // Comprehensive dataset matching the exact screenshot plus more
  const allPeers = [
    {
      id: 'peer-aris-thorne',
      name: 'Dr. Aris Thorne',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      title: 'Senior Researcher, Data Science',
      rating: 4.9,
      reviewsCount: 88,
      skills: ['STATISTICS', 'R-PROGRAMMING', 'QUANTITATIVE METHODS'],
      primaryField: 'Data Science',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Wednesday, Oct 24 (02:30 PM)',
      isOnline: true,
      institution: 'Stanford Institute for Computational Research',
      bio: 'Senior researcher focused on structural equation modeling (SEM), multivariate psychometrics, and reproducible statistical programming in R.',
      credentials: ['PhD in Computational Statistics', 'Verified Senior Researcher'],
      responseSpeed: 'Usually responds in 1h',
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
      availability: 'Available: Wed, Oct 24 (02:30 PM)',
      preferredMode: 'Preferred: SkillSwap Connect Video Call',
      swapsCount: 88,
      learnersCount: '1.9k',
      hourlyCredits: 1.0,
      reviews: [
        {
          id: 'rev-aris-1',
          name: 'PhD Candidate',
          avatarUrl:
            'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote:
            "Dr. Thorne's SEM breakdown made latent variable modeling immediately actionable for my dissertation dataset.",
          meta: 'Oct 20, 2024 • Swapped for Python Prep',
        },
      ],
    },
    {
      id: 'peer-julian-vance',
      name: 'Dr. Julian Vance',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      title: 'PhD in Quantum Computing • Stanford University',
      rating: 5.0,
      reviewsCount: 450,
      skills: ['QUANTUM MECHANICS', 'QISKIT PROGRAMMING', 'ALGORITHMS'],
      primaryField: 'Data Science',
      academicLevel: 'Postdoctoral Fellow',
      nextAvailable: 'Monday, Oct 28 (09:00 AM)',
      isOnline: true,
      institution: 'Stanford University Department of Physics & Quantum Lab',
      bio: 'Quantum information scientist specializing in Hamiltonian simulation, NISQ error mitigation, and quantum circuit synthesis using Qiskit.',
      credentials: ['PhD from Stanford University', 'Top 1% Mentor 2023', 'Verified Quantum Researcher'],
      responseSpeed: 'Usually responds in 12h',
      skillsTeach: [
        'Quantum Mechanics',
        'Qiskit Programming',
        'Quantum Information Theory',
        'Quantum Error Correction',
      ],
      skillsWant: [
        'Cryogenic Hardware Interfacing',
        'Tensor Networks',
        'Category Theory',
      ],
      availability: 'Available: Mon, Wed, Fri (Morning & Afternoon)',
      preferredMode: 'Preferred: SkillSwap Connect Video Call',
      swapsCount: 450,
      learnersCount: '3.8k',
      hourlyCredits: 2.5,
      cost: 250,
      badge1: 'Top 1% Mentor 2023',
      badge2: '450+ Sessions Completed',
      reviews: [
        {
          id: 'rev-jv-1',
          name: 'Priya Patel',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote:
            "Dr. Vance's explanation of VQE and entanglement distillation was incredible. The session took my quantum circuit from theory into a working simulation.",
          meta: 'Oct 22, 2024 • Quantum Mechanics Swap',
        },
      ],
    },
    {
      id: 'peer-1',
      name: 'Dr. Elena Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      title: 'Senior Fellow in Behavioral Economics',
      rating: 4.9,
      reviewsCount: 124,
      skills: ['BEHAVIORAL MODELING', 'STATISTICAL ANALYSIS (R)', 'GAME THEORY'],
      primaryField: 'Academic Writing',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Available: Tue, Thu, Sat',
      isOnline: true,
      institution: 'Oxford Center for Behavioral Dynamics',
      bio: 'With over 15 years in academic research and cross-disciplinary studies, I specialize in the intersection of cognitive psychology and market dynamics. My goal is to bridge the gap between theoretical frameworks and practical application through collaborative peer-to-peer exchange.',
      credentials: ['PhD from Oxford', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 2h',
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
      availability: 'Available: Tue, Thu, Sat',
      preferredMode: 'Preferred: Virtual / Zoom',
      swapsCount: 48,
      learnersCount: '2.1k',
      hourlyCredits: 1.0,
      reviews: [
        {
          id: 'rev-1',
          name: 'Marcus Thorne',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Elena's session on Game Theory was transformative. She has a way of making complex mathematical concepts feel intuitive. Looking forward to our next swap!",
          meta: 'Oct 14, 2024 • Swapped for Python Intro',
        },
        {
          id: 'rev-2',
          name: 'Dr. Sarah L.',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Fantastic collaboration. Her statistical analysis skills are top-notch. She really helped me refine my research paper methodology.",
          meta: 'Sep 28, 2024 • Swapped for Data Viz',
        },
      ],
    },
    {
      id: 'peer-2',
      name: 'Julian Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
      title: 'Master of Comparative Literature',
      rating: 4.7,
      reviewsCount: 32,
      skills: ['CRITICAL THEORY', 'EDITING', 'PHILOSOPHY'],
      primaryField: 'Academic Writing',
      academicLevel: 'Master\'s Student',
      nextAvailable: 'Wed, 10:00 AM',
      isOnline: false,
      institution: 'Department of Comparative Literature',
      bio: 'Graduate fellow in narrative structures and literary critique. Specializes in thesis editing, continental philosophy, and academic peer argumentation.',
      hourlyCredits: 1.0,
      credentials: ['Master of Letters', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 1h',
      skillsTeach: [
        'Critical Theory',
        'Thesis Editing',
        'Continental Philosophy',
        'Rhetorical Analysis',
        'Academic Peer Review',
      ],
      skillsWant: [
        'Python for Text Mining',
        'Digital Humanities',
        'LaTeX Typesetting',
        'Data Visualization',
      ],
      availability: 'Available: Mon, Wed, Fri',
      preferredMode: 'Preferred: Google Meet / Audio',
      swapsCount: 32,
      learnersCount: '1.4k',
      reviews: [
        {
          id: 'rev-j1',
          name: 'Clara Oswald',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Julian helped restructure my doctoral thesis proposal. His feedback on rhetoric and argumentation gave my research real clarity.",
          meta: 'Nov 02, 2024 • Swapped for Qualitative Methods',
        },
        {
          id: 'rev-j2',
          name: 'David Tennant',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
          rating: 4.8,
          quote: "Incredible literary analysis session. We broke down post-structuralist critique line-by-line.",
          meta: 'Oct 19, 2024 • Swapped for History of Science',
        },
      ],
    },
    {
      id: 'peer-3',
      name: 'Sarah K. Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
      title: 'Senior UI/UX Researcher',
      rating: 5.0,
      reviewsCount: 65,
      skills: ['USER RESEARCH', 'FIGMA', 'UT'],
      primaryField: 'UI/UX Design',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Tue, 2:00 PM',
      isOnline: true,
      institution: 'Human-Computer Interaction Institute',
      bio: 'Doctoral researcher focusing on usability testing methodologies, cognitive accessibility, and academic dashboard experience architectures.',
      hourlyCredits: 1.0,
      credentials: ['PhD Candidate at HCI Institute', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 30m',
      skillsTeach: [
        'User Research',
        'Figma Prototyping',
        'Usability Testing',
        'Design Systems',
        'Information Architecture',
      ],
      skillsWant: [
        'Full-Stack React',
        'Tailwind CSS',
        'Accessible Frontends',
        'Product Analytics',
      ],
      availability: 'Available: Tue, Thu, Sun',
      preferredMode: 'Preferred: Figma Live / Zoom',
      swapsCount: 65,
      learnersCount: '2.8k',
      reviews: [
        {
          id: 'rev-s1',
          name: 'Dr. Michael Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Sarah reviewed our academic portal interface and provided actionable heuristics that boosted our study participant retention.",
          meta: 'Oct 22, 2024 • Swapped for React State Hooks',
        },
        {
          id: 'rev-s2',
          name: 'Maya Lin',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Her mastery of Figma auto-layout and design token semantics is unmatched. Best mentor on SkillSwap!",
          meta: 'Oct 08, 2024 • Swapped for CSS Grid',
        },
      ],
    },
    {
      id: 'peer-4',
      name: 'Markus Zhao',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
      title: 'Graduate Researcher, Robotics',
      rating: 4.8,
      reviewsCount: 41,
      skills: ['C++', 'ROS', 'REINFORCEMENT'],
      primaryField: 'Data Science',
      academicLevel: 'Graduate Researcher',
      nextAvailable: 'Today, 7:00 PM',
      isOnline: true,
      institution: 'Robotics & Autonomous Systems Lab',
      bio: 'Master\'s researcher working on ROS2 locomotion controllers and reinforcement learning algorithms for bipedal robotic motion.',
      hourlyCredits: 1.0,
      credentials: ['Robotics Systems Fellow', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 3h',
      skillsTeach: [
        'Modern C++ (20/23)',
        'ROS2 Architecture',
        'Reinforcement Learning',
        'Gazebo Simulation',
        'Kinematics & Dynamics',
      ],
      skillsWant: [
        'Mathematical Optimization',
        'Kalman Filtering',
        'Research Manuscript Preparation',
      ],
      availability: 'Available: Mon, Thu, Sat',
      preferredMode: 'Preferred: Discord / Zoom Screen Share',
      swapsCount: 41,
      learnersCount: '1.9k',
      reviews: [
        {
          id: 'rev-m1',
          name: 'Ethan Ross',
          avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Markus walked me through debugging ROS2 action servers in real time. Saved me days of troubleshooting.",
          meta: 'Oct 15, 2024 • Swapped for Linear Algebra',
        },
      ],
    },
    {
      id: 'peer-5',
      name: 'Dr. Rafiqul Islam',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=240&auto=format&fit=crop&q=80',
      title: 'Assistant Professor, Algorithms & Discrete Math',
      rating: 4.95,
      reviewsCount: 112,
      skills: ['DYNAMIC PROGRAMMING', 'GRAPH THEORY', 'C++'],
      primaryField: 'Data Science',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Tomorrow, 2:00 PM',
      isOnline: true,
      institution: 'United International University (UIU)',
      bio: 'ICPC coach and algorithms educator. Passionate about helping students break down NP-complete problems, dynamic programming memoization, and graph network flows.',
      hourlyCredits: 1.0,
      credentials: ['PhD in Computer Science', 'ICPC World Finals Coach'],
      responseSpeed: 'Usually responds in 1h',
      skillsTeach: [
        'Dynamic Programming',
        'Advanced Graph Theory',
        'Algorithm Complexity (Big-O)',
        'Competitive C++ Techniques',
        'Combinatorics & Number Theory',
      ],
      skillsWant: [
        'Quantum Computing Basics',
        'Distributed Consensus Protocols',
        'GPU CUDA Acceleration',
      ],
      availability: 'Available: Daily (Evening Slots)',
      preferredMode: 'Preferred: Zoom Whiteboard / Visual Studio Live',
      swapsCount: 112,
      learnersCount: '4.5k',
      reviews: [
        {
          id: 'rev-r1',
          name: 'Tahmid Khan',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Dr. Rafiqul's intuition on tree DP and shortest paths opened up entirely new angles for my research paper algorithms.",
          meta: 'Nov 01, 2024 • Swapped for Neural Networks',
        },
      ],
    },
    {
      id: 'peer-6',
      name: 'Sofia Al-Mansoor',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      title: 'DPhil Candidate in Quantitative Economics',
      rating: 4.92,
      reviewsCount: 39,
      skills: ['ECONOMETRICS', 'R PROGRAMMING', 'CAUSAL INFERENCE'],
      primaryField: 'Microeconomics',
      academicLevel: 'PhD Candidate',
      nextAvailable: 'Thursday, 3:30 PM',
      isOnline: false,
      institution: 'Oxford Department of Economics',
      bio: 'Empirical microeconomics researcher working on randomized control trials, econometric policy evaluations, and panel data econometric models.',
      hourlyCredits: 1.0,
      credentials: ['DPhil at Oxford Economics', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 2h',
      skillsTeach: [
        'Econometric Modeling',
        'R Programming (Tidyverse)',
        'Causal Inference & DiD',
        'Instrumental Variables',
        'Stata Panel Regressions',
      ],
      skillsWant: [
        'Machine Learning in Python',
        'High Performance Computing',
        'Public Policy Briefing',
      ],
      availability: 'Available: Thu, Fri, Sat',
      preferredMode: 'Preferred: Zoom / Overleaf Live',
      swapsCount: 39,
      learnersCount: '1.6k',
      reviews: [
        {
          id: 'rev-so1',
          name: 'James Harrington',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Sofia explained difference-in-differences estimators with unparalleled clarity. Superb peer scholar.",
          meta: 'Oct 29, 2024 • Swapped for Macro Models',
        },
      ],
    },
    {
      id: 'peer-7',
      name: 'Mahir Faisal',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      title: 'Graduate Researcher in NLP & Transformers',
      rating: 4.88,
      reviewsCount: 54,
      skills: ['TRANSFORMERS', 'PYTORCH', 'LATEX'],
      primaryField: 'Academic Writing',
      academicLevel: 'Master\'s Student',
      nextAvailable: 'Friday, 11:00 AM',
      isOnline: true,
      institution: 'UIU NLP Center',
      bio: 'Researcher in low-resource language processing, transformer distillation, attention mechanisms, and peer academic paper formatting.',
      hourlyCredits: 1.0,
      credentials: ['NLP Research Scholar', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 45m',
      skillsTeach: [
        'Transformer Architectures',
        'PyTorch Model Fine-Tuning',
        'Hugging Face Pipelines',
        'LaTeX Academic Formatting',
        'Attention Visualization',
      ],
      skillsWant: [
        'MLOps Infrastructure',
        'Vector Databases (Milvus/Pinecone)',
        'Latent Diffusion Models',
      ],
      availability: 'Available: Mon, Wed, Sat',
      preferredMode: 'Preferred: Google Meet / Colab',
      swapsCount: 54,
      learnersCount: '2.3k',
      reviews: [
        {
          id: 'rev-ma1',
          name: 'Nadia Ahmed',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Mahir solved our GPU out-of-memory errors during transformer training in under 20 minutes!",
          meta: 'Oct 24, 2024 • Swapped for Cloud Deployments',
        },
      ],
    },
    {
      id: 'peer-8',
      name: 'Abrar Zahin',
      avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=240&auto=format&fit=crop&q=80',
      title: 'Systems & Cloud Infrastructure Engineer',
      rating: 4.85,
      reviewsCount: 78,
      skills: ['REACT', 'NODE.JS', 'DOCKER'],
      primaryField: 'Data Science',
      academicLevel: 'Undergraduate Senior',
      nextAvailable: 'Tomorrow, 5:00 PM',
      isOnline: true,
      institution: 'UIU Software Engineering Club',
      bio: 'Peer tutor in distributed systems, full-stack reactive design, containerized research pipelines, and microservice architectures.',
      hourlyCredits: 1.0,
      credentials: ['Cloud Systems Lead', 'Verified Scholar'],
      responseSpeed: 'Usually responds in 2h',
      skillsTeach: [
        'Full-Stack React & Vite',
        'Node.js Microservices',
        'Docker Containers',
        'CI/CD GitHub Actions',
        'RESTful & GraphQL API Design',
      ],
      skillsWant: [
        'Kubernetes Cluster Admin',
        'Rust Programming',
        'System Security Hardening',
      ],
      availability: 'Available: Tue, Wed, Fri',
      preferredMode: 'Preferred: Zoom / VS Code Live',
      swapsCount: 78,
      learnersCount: '3.1k',
      reviews: [
        {
          id: 'rev-ab1',
          name: 'Fariha Yasmin',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
          rating: 5,
          quote: "Abrar set up our containerized dev environment seamlessly. Clear explanations and great patience.",
          meta: 'Oct 18, 2024 • Swapped for UI Design',
        },
      ],
    },
  ];

  const trendingTags = [
    'Quantum Mechanics',
    'Digraphities',
    'Bioinformatics',
    'Machine Learning',
    'Academic Writing',
  ];

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleTagClick = (tag) => {
    if (activeTrendingTag === tag) {
      setActiveTrendingTag('');
      setSearchQuery('');
    } else {
      setActiveTrendingTag(tag);
      setSearchQuery(tag);
      onShowToast(`Filtering peers for "${tag}"`);
    }
  };

  // Filter peers
  const filteredPeers = useMemo(() => {
    const activeCheckedFields = Object.keys(selectedFields).filter((k) => selectedFields[k]);

    return allPeers.filter((peer) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = peer.name.toLowerCase().includes(q);
        const matchesTitle = peer.title.toLowerCase().includes(q);
        const matchesSkills = peer.skills.some((s) => s.toLowerCase().includes(q));
        const matchesField = peer.primaryField.toLowerCase().includes(q);
        const matchesBio = peer.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesSkills && !matchesField && !matchesBio) {
          return false;
        }
      }

      // 2. Checked Fields (If any selected, must match at least one)
      if (activeCheckedFields.length > 0) {
        const matchesField = activeCheckedFields.includes(peer.primaryField);
        const matchesSkill = peer.skills.some((skill) =>
          activeCheckedFields.some((f) => skill.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!matchesField && !matchesSkill) {
          return false;
        }
      }

      // 3. Minimum Rating
      if (peer.rating < minRating) {
        return false;
      }

      // 4. Academic Level (if not set to "Any" or matches)
      if (academicLevel && academicLevel !== 'Any Level' && peer.academicLevel) {
        if (academicLevel === 'PhD Candidate' && !peer.academicLevel.includes('PhD') && !peer.title.includes('PhD')) {
          // allow close matches or strictly filter
        }
      }

      return true;
    });
  }, [allPeers, searchQuery, selectedFields, minRating, academicLevel]);

  // Paginated peers (4 per page to match exact 2x2 grid layout from screenshot)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredPeers.length / itemsPerPage) || 1;
  const paginatedPeers = filteredPeers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenPeer = (peer) => {
    if (onSelectPeerProfile) {
      onSelectPeerProfile({
        id: peer.id,
        name: peer.name,
        title: peer.title,
        rating: peer.rating,
        reviewsCount: peer.reviewsCount || 48,
        avatarUrl: peer.avatarUrl,
        isOnline: peer.isOnline,
        bio: peer.bio,
        credentials: peer.credentials || ['Verified Scholar', peer.academicLevel || 'PhD Researcher'],
        responseSpeed: peer.responseSpeed || 'Usually responds in 2h',
        skillsTeach: peer.skillsTeach || (peer.skills ? peer.skills.map(s => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())) : ['Peer Tutoring', 'Academic Research']),
        skillsWant: peer.skillsWant || ['Advanced Python', 'Machine Learning Basics', 'Data Visualization', 'Public Speaking'],
        availability: peer.availability || (peer.nextAvailable ? `Available: ${peer.nextAvailable}` : 'Available: Tue, Thu, Sat'),
        preferredMode: peer.preferredMode || 'Preferred: Virtual / Zoom',
        swapsCount: peer.swapsCount || (peer.reviewsCount ? Math.floor(peer.reviewsCount * 0.4) : 48),
        learnersCount: peer.learnersCount || '1.8k',
        reviews: peer.reviews || [
          {
            id: 'rev-1',
            name: 'Marcus Thorne',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
            rating: 5,
            quote: `Outstanding collaboration session with ${peer.name}. Deep academic rigor and clear explanations.`,
            meta: 'Recent • Swapped for Peer Exchange',
          },
          {
            id: 'rev-2',
            name: 'Dr. Sarah L.',
            avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
            rating: 5,
            quote: `High quality academic feedback and methodology review. Helped strengthen our paper analysis.`,
            meta: '2 weeks ago • Swapped for Research Consulting',
          },
        ],
      });
    }
    onNavigateScreen('public-profile');
  };

  const handleOpenRequestModal = (peer) => {
    setRequestingPeer(peer);
    setReqTopic(peer.skillsTeach?.[0] || peer.skills?.[0] || 'Quantitative Methods');
    setReqSlot(peer.nextAvailable || 'Wednesday, Oct 24 (02:30 PM)');
    setReqOfferedSkill('Python Data Science');
    setReqNote('');
  };

  const handleConfirmDiscoverSession = (e) => {
    e.preventDefault();
    if (!requestingPeer) return;

    const newSession = {
      id: `session-${Date.now()}`,
      title: reqTopic || requestingPeer.skillsTeach?.[0] || 'Academic Peer Session',
      status: 'Accepted',
      description: `Collaborative academic peer session focusing on ${reqTopic || requestingPeer.skillsTeach?.[0]} with ${requestingPeer.name}.`,
      learningGoals: (requestingPeer.skillsTeach || ['Methodological Rigor', 'Statistical Modeling']).slice(0, 3).map((s) => `Master core foundations of ${s}`),
      duration: '90 Minutes',
      method: 'Video Call',
      platform: 'SkillSwap Connect',
      date: reqSlot.includes('(') ? reqSlot.split('(')[0].trim() : reqSlot.includes(',') ? reqSlot.split(',')[0].trim() : 'Wednesday, Oct 24',
      time: reqSlot.includes('(') ? reqSlot.split('(')[1].replace(')', '').trim() : '02:30 PM — 04:00 PM',
      partner: {
        id: requestingPeer.id,
        name: requestingPeer.name,
        title: requestingPeer.title,
        avatarUrl: requestingPeer.avatarUrl,
        isOnline: requestingPeer.isOnline,
        badges: (requestingPeer.badges || requestingPeer.skills || ['Scholar']).slice(0, 2),
        skillsTeach: requestingPeer.skillsTeach || [],
        skillsWant: requestingPeer.skillsWant || [],
        rating: requestingPeer.rating,
        reviewsCount: requestingPeer.reviewsCount,
        credentials: requestingPeer.credentials || ['Verified Scholar'],
        responseSpeed: requestingPeer.responseSpeed || 'Usually responds in 1h',
        availability: requestingPeer.availability || 'Available on request',
        preferredMode: requestingPeer.preferredMode || 'SkillSwap Connect Video Call',
      },
      notes: reqNote ? [
        {
          id: `note-${Date.now()}`,
          authorName: userProfile?.name || 'You',
          authorAvatar: userAvatar,
          timestamp: 'Just now',
          text: reqNote,
        },
      ] : [
        {
          id: `note-${Date.now()}`,
          authorName: requestingPeer.name,
          authorAvatar: requestingPeer.avatarUrl,
          timestamp: 'Just now',
          text: `Session confirmed for ${reqTopic}! Looking forward to our collaborative swap.`,
        },
      ],
    };

    if (onCreateSession) {
      onCreateSession(newSession);
    } else {
      onShowToast(`✨ Session scheduled with ${requestingPeer.name}!`);
      onNavigateScreen('session-details');
    }
    setRequestingPeer(null);
  };

  const handleFindPeerCTA = () => {
    onShowToast(`Found ${filteredPeers.length} verified academic peers matching your criteria.`);
  };

  const userAvatar =
    userProfile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=240&auto=format&fit=crop&q=80';

  return (
    <div id="screen-discover" className="min-h-screen bg-[#fff8f7] text-[#201a1b] flex flex-col font-sans selection:bg-[#c5b3d3] selection:text-[#22162e]">
      {/* 1. TOP NAVBAR (matching the dark plum navbar with white/lilac accents) */}
      <header className="sticky top-0 w-full h-[68px] bg-[#3e313f] shadow-md z-40">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-[1360px] mx-auto h-full">
          {/* Brand & Nav items */}
          <div className="flex items-center gap-8">
            <span
              onClick={() => onNavigateScreen('dashboard')}
              className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
              id="nav-brand-logo"
            >
              SkillSwap
            </span>

            <nav className="hidden md:flex items-center gap-7 text-sm">
              <button
                onClick={() => onNavigateScreen('dashboard')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigateScreen('skill-manager')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-skill-manager"
              >
                Skill Manager
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className="text-white font-bold border-b-2 border-white pb-0.5 tracking-wide"
                id="nav-tab-discover"
              >
                Discover
              </button>
              <button
                onClick={() => onNavigateScreen('requests')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1 flex items-center gap-1.5"
                id="nav-tab-requests"
              >
                <span>Requests</span>
                <span className="w-2 h-2 rounded-full bg-[#f0b2aa]"></span>
              </button>
              <button
                onClick={() => onNavigateScreen('session-details')}
                className="text-white/80 hover:text-white transition-colors font-medium py-1"
                id="nav-tab-sessions"
              >
                My Sessions
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onShowToast('Notifications: Dr. Elena Vance accepted your research paper review request.')}
              className="p-2 text-white/80 hover:text-white transition-colors relative"
              title="Notifications"
              id="btn-nav-notifications"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f0b2aa] rounded-full"></span>
            </button>

            <button
              onClick={() => onOpenWalletModal && onOpenWalletModal()}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Academic Credit Ledger"
              id="btn-nav-wallet"
            >
              <span className="material-symbols-outlined text-[21px]">account_balance_wallet</span>
            </button>

            {/* Profile Avatar & Label */}
            <div
              onClick={() => onNavigateScreen('profile-setup')}
              className="flex items-center gap-2 pl-2 cursor-pointer group"
              title="View & Edit Scholar Profile"
              id="nav-user-profile-btn"
            >
              <span className="hidden sm:inline text-xs font-semibold text-white/90 group-hover:text-white">
                Profile
              </span>
              <div className="w-8 h-8 rounded-full border-2 border-white/40 overflow-hidden group-hover:border-white transition-colors">
                <img
                  src={userAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN DISCOVER CONTAINER */}
      <div className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-7 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: SEARCH FILTERS SIDEBAR (framed with soft pastel blush background) */}
        <aside
          className="w-full md:w-64 lg:w-72 shrink-0 bg-[#fdf3f0] border border-[#eedfdc] rounded-2xl p-5 flex flex-col justify-between shadow-xs self-start"
          id="sidebar-search-filters"
        >
          <div className="space-y-6">
            {/* Sidebar Title */}
            <div>
              <h2 className="text-xs font-bold text-[#5c4a55] uppercase tracking-wider">
                SEARCH FILTERS
              </h2>
            </div>

            {/* Filter Section: Field / Topic Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#66545f] block">
                Field
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'data-science', label: 'Data Science' },
                  { id: 'academic-writing', label: 'Academic Writing' },
                  { id: 'uiux-design', label: 'UI/UX Design' },
                  { id: 'microeconomics', label: 'Microeconomics' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#3b2e38] select-none hover:text-[#22162e] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(selectedFields[item.label])}
                      onChange={() => handleFieldToggle(item.label)}
                      className="w-4 h-4 rounded border-[#c9b7be] text-[#473b4b] focus:ring-[#473b4b] accent-[#473b4b] cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Minimum Rating */}
            <div className="space-y-2.5 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#473b4b] gap-0.5 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => {
                        setMinRating(star);
                        onShowToast(`Filter set: ${star}.0+ star rating`);
                      }}
                      className={`material-symbols-outlined text-[18px] transition-transform hover:scale-110 ${
                        star <= Math.floor(minRating) ? 'fill text-[#473b4b]' : 'text-[#c2b2b9]'
                      }`}
                      style={{ fontVariationSettings: star <= Math.floor(minRating) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#473b4b]">
                  {minRating.toFixed(1)}+
                </span>
              </div>
            </div>

            {/* Filter Section: Availability Dropdown */}
            <div className="space-y-2 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Availability
              </label>
              <div className="relative">
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-white border border-[#ddcbca] text-xs text-[#201a1b] font-medium rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-[#473b4b] cursor-pointer shadow-2xs"
                >
                  <option value="Anytime">Anytime</option>
                  <option value="Today">Available Today</option>
                  <option value="This Week">This Week</option>
                  <option value="Weekends">Weekends Only</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#776670] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Filter Section: Academic Level Dropdown */}
            <div className="space-y-2 pt-1 border-t border-[#ebd8d4]">
              <label className="text-xs font-semibold text-[#66545f] block">
                Academic Level
              </label>
              <div className="relative">
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full bg-white border border-[#ddcbca] text-xs text-[#201a1b] font-medium rounded-xl px-3.5 py-2.5 appearance-none focus:outline-none focus:border-[#473b4b] cursor-pointer shadow-2xs"
                >
                  <option value="PhD Candidate">PhD Candidate</option>
                  <option value="Master's Student">Master's Student</option>
                  <option value="Undergraduate Senior">Undergraduate Senior</option>
                  <option value="Postdoctoral Researcher">Postdoctoral Researcher</option>
                  <option value="Any Level">All Academic Levels</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#776670] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Sidebar Action Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={handleFindPeerCTA}
              className="w-full py-3 bg-[#4b3c4a] hover:bg-[#382b37] text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              id="btn-find-peer-sidebar"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Find a Peer</span>
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: EXPLORE KNOWLEDGE PEERS MAIN CATALOG */}
        <main className="flex-1 flex flex-col justify-between" id="main-peer-catalog">
          <div className="space-y-6">
            
            {/* Header Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#201a1b] tracking-tight">
                Explore Knowledge Peers
              </h1>
            </div>

            {/* Search Input Bar with embedded mauve Search button */}
            <div className="relative flex items-center">
              <div className="w-full bg-white border border-[#e4d4d1] rounded-2xl pl-11 pr-28 py-3 shadow-xs flex items-center focus-within:border-[#473b4b] focus-within:ring-2 focus-within:ring-[#473b4b]/10 transition-all">
                <span className="material-symbols-outlined absolute left-4 text-[#8a7a83] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search for skills like 'Quantitative Research', 'Python', or 'Medieval History'..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#201a1b] placeholder-[#9a8b93] focus:outline-none"
                  id="input-peer-search"
                />
              </div>
              <button
                onClick={() => {
                  onShowToast(`Filtered for: "${searchQuery || 'All peers'}"`);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#bda7c5] hover:bg-[#a991b3] text-[#2c1d30] rounded-xl text-xs font-bold transition-colors shadow-2xs"
                id="btn-search-action"
              >
                Search
              </button>
            </div>

            {/* Trending Tags Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#705e69] mr-1 select-none">
                Trending:
              </span>
              {trendingTags.map((tag) => {
                const isActive = activeTrendingTag === tag || searchQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#e49b8e] text-[#2f130f] font-bold shadow-2xs'
                        : 'bg-[#f7d6cd] hover:bg-[#f2c2b7] text-[#5e3831]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {(searchQuery || activeTrendingTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTrendingTag('');
                  }}
                  className="text-xs text-[#705e69] hover:text-[#201a1b] underline font-medium ml-2"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* PEER CARDS 2x2 GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2" id="peers-grid-container">
              {paginatedPeers.map((peer) => (
                <div
                  key={peer.id}
                  onClick={() => handleOpenPeer(peer)}
                  className="bg-white border border-[#ebd8d4] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#bfa8c7] transition-all flex flex-col justify-between group cursor-pointer"
                  id={`peer-card-${peer.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenPeer(peer);
                    }
                  }}
                >
                  <div>
                    {/* Top: Avatar, Name, Rating Badge & Title */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={peer.avatarUrl}
                            alt={peer.name}
                            referrerPolicy="no-referrer"
                            className="w-13 h-13 rounded-full object-cover border-2 border-[#eedfdc] shadow-2xs group-hover:border-[#473b4b] transition-colors"
                          />
                          {peer.isOnline ? (
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                              title="Online now for peer swap"
                            ></span>
                          ) : (
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full"
                              title="Currently offline"
                            ></span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#201a1b] group-hover:text-[#473b4b] transition-colors leading-snug">
                            {peer.name}
                          </h3>
                          <p className="text-xs text-[#63535d] font-medium line-clamp-1 mt-0.5">
                            {peer.title}
                          </p>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-1 bg-[#fbf2ef] border border-[#edd7d2] px-2.5 py-1 rounded-lg shrink-0">
                        <span
                          className="material-symbols-outlined text-[15px] text-[#473b4b]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-xs font-bold text-[#201a1b]">
                          {peer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Specialized Skill Badges (Soft terracotta pills with uppercase text) */}
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      {peer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded bg-[#f7d6cd] text-[#5e3831]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Next availability & View Profile CTA */}
                  <div className="pt-3.5 border-t border-[#f4e7e4] flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#705f69]">
                      <span className="material-symbols-outlined text-[16px] text-[#8e7d87]">
                        schedule
                      </span>
                      <span>Next available: {peer.nextAvailable}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRequestModal(peer);
                        }}
                        className="px-3.5 py-2 bg-[#eeddf2] hover:bg-[#e2c7e8] text-[#47364d] rounded-xl text-xs font-bold tracking-wide transition-colors shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                        id={`btn-request-session-${peer.id}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          calendar_add_on
                        </span>
                        <span>Request Session</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPeer(peer);
                        }}
                        className="px-4 py-2 bg-[#473b4b] hover:bg-[#342738] text-white rounded-xl text-xs font-bold tracking-wide transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        id={`btn-view-profile-${peer.id}`}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if search returned zero matches */}
            {filteredPeers.length === 0 && (
              <div className="bg-white border border-[#ebd8d4] rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#fdf3f0] text-[#5e3831] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">search_off</span>
                </div>
                <h3 className="text-base font-bold text-[#201a1b]">No knowledge peers found</h3>
                <p className="text-xs text-[#705f69] max-w-md mx-auto">
                  Try adjusting your search terms or unchecking some filter fields to explore more verified scholars.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFields({
                      'Data Science': false,
                      'Academic Writing': true,
                      'UI/UX Design': false,
                      'Microeconomics': false,
                    });
                    setMinRating(4.0);
                  }}
                  className="px-4 py-2 bg-[#473b4b] text-white rounded-xl text-xs font-bold hover:bg-[#342738] transition-colors inline-block mt-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* 3. PAGINATION CONTROLS (matching < (1) 2 3 ... 12 >) */}
          <div className="flex items-center justify-center gap-2 py-8 select-none" id="pagination-controls">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {/* Page 1 */}
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 1
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              1
            </button>

            {/* Page 2 */}
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 2
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              2
            </button>

            {/* Page 3 */}
            <button
              onClick={() => setCurrentPage(3)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 3
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              3
            </button>

            <span className="text-xs text-[#9a8992] px-1">...</span>

            {/* Page 12 */}
            <button
              onClick={() => setCurrentPage(12)}
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentPage === 12
                  ? 'bg-[#473b4b] text-white shadow-xs'
                  : 'bg-white border border-[#ebd8d4] text-[#705f69] hover:border-[#473b4b]'
              }`}
            >
              12
            </button>

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(12, p + 1))}
              disabled={currentPage === 12}
              className="w-8 h-8 rounded-full border border-[#ebd8d4] bg-white text-[#705f69] hover:text-[#201a1b] hover:border-[#473b4b] flex items-center justify-center text-xs transition-colors disabled:opacity-40 disabled:hover:border-[#ebd8d4]"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </main>
      </div>

      {/* 4. FOOTER (Matching the soft warm blush footer with quick links & FAB button) */}
      <footer className="w-full bg-[#f4eae7] border-t border-[#eedfdc] py-5 mt-auto relative" id="discover-footer">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#705f69]">
          <div>
            <span className="font-bold text-[#3e313f] block sm:inline">SkillSwap Academic</span>
            <span className="hidden sm:inline mx-2 text-[#bda7b2]">•</span>
            <span>© 2026 SkillSwap Academic. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <button
              onClick={() => onShowToast('Institutional Privacy & Academic Integrity Policy')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('SkillSwap Academic Terms of Service')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('Participating Universities: UIU, Stanford, MIT, Harvard, Oxford, BUET')}
              className="hover:text-[#201a1b] transition-colors"
            >
              University Partners
            </button>
            <button
              onClick={() => onShowToast('Contact Academic Support: support@skillswap.edu')}
              className="hover:text-[#201a1b] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Floating Action Button (FAB) at bottom-right */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => {
              handleOpenRequestModal(allPeers[0]);
            }}
            className="w-12 h-12 rounded-2xl bg-[#c5b3d3] hover:bg-[#b39dc3] text-[#2c1d30] shadow-lg flex items-center justify-center text-2xl font-bold transition-transform active:scale-95 border border-white/40"
            title="Create / Request a Skill Swap"
            id="fab-create-swap"
          >
            <span className="material-symbols-outlined text-[24px]">add</span>
          </button>
        </div>
      </footer>

      {/* DYNAMIC REQUEST SESSION MODAL IN DISCOVER */}
      {requestingPeer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#eddcd8] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header with Peer Preview */}
            <div className="flex items-start justify-between border-b border-[#f4e8e5] pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={requestingPeer.avatarUrl}
                  alt={requestingPeer.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#ebd8d4]"
                />
                <div>
                  <h3 className="font-bold text-base text-[#201a1b]">
                    Request Session with {requestingPeer.name}
                  </h3>
                  <p className="text-xs text-[#705e69]">
                    {requestingPeer.title} • ★ {requestingPeer.rating}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequestingPeer(null)}
                className="text-[#8c7b86] hover:text-[#201a1b] p-1 rounded-lg hover:bg-[#fbf4f2]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Request Form */}
            <form onSubmit={handleConfirmDiscoverSession} className="space-y-4 text-xs">
              {/* Topic Select */}
              <div>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Academic Focus / Topic:
                </label>
                <input
                  type="text"
                  value={reqTopic}
                  onChange={(e) => setReqTopic(e.target.value)}
                  placeholder="e.g. Structural Equation Modeling (SEM) in R"
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                  required
                />
              </div>

              {/* Proposed Slot */}
              <div>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Preferred Time Slot:
                </label>
                <input
                  type="text"
                  value={reqSlot}
                  onChange={(e) => setReqSlot(e.target.value)}
                  placeholder="e.g. Wednesday, Oct 24 (02:30 PM)"
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                  required
                />
                <p className="text-[11px] text-[#705e69] mt-1">
                  Peer availability: {requestingPeer.nextAvailable || 'Flexible schedule'}
                </p>
              </div>

              {/* What You Offer */}
              <div>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Knowledge You Offer in Exchange:
                </label>
                <input
                  type="text"
                  value={reqOfferedSkill}
                  onChange={(e) => setReqOfferedSkill(e.target.value)}
                  placeholder="e.g. Python Data Science / LaTeX Typesetting"
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl px-3.5 py-2.5 text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                />
              </div>

              {/* Pre-Session Notes */}
              <div>
                <label className="block font-bold text-[#201a1b] mb-1.5">
                  Pre-Session Note or Agenda (Optional):
                </label>
                <textarea
                  rows={3}
                  value={reqNote}
                  onChange={(e) => setReqNote(e.target.value)}
                  placeholder="Add specific dataset links, hypothesis questions, or syllabus references..."
                  className="w-full bg-[#fcf6f5] border border-[#eddcd8] rounded-xl p-3 text-xs text-[#201a1b] focus:outline-none focus:border-[#57445f]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-[#f4e8e5]">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPeer(requestingPeer);
                    setRequestingPeer(null);
                  }}
                  className="text-xs font-semibold text-[#57445f] hover:underline"
                >
                  View Full Scholar Profile ›
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestingPeer(null)}
                    className="px-4 py-2 text-xs font-semibold text-[#705e69] hover:text-[#201a1b]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#473b4b] hover:bg-[#342738] text-white font-bold text-xs rounded-xl shadow-xs active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                    id="btn-confirm-discover-request"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      event_available
                    </span>
                    <span>Confirm & View Details</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
