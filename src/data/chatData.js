// Demo-mode chat seed data (persisted to localStorage like sessions/requests).

const DEMO_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

export const initialMessages = {
  'Algometer__Dr. Elena Vance': [
    {
      id: 'msg-demo-1',
      conversationId: 'Algometer__Dr. Elena Vance',
      participantIds: ['demo-uiu-scholar', 'mentor-elena-vance'],
      fromUid: 'mentor-elena-vance',
      toUid: 'demo-uiu-scholar',
      text: 'Hi! I saw your session request for Applied Math. Happy to help with any preparation questions before we meet.',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      read: false,
    },
    {
      id: 'msg-demo-2',
      conversationId: 'Algometer__Dr. Elena Vance',
      participantIds: ['demo-uiu-scholar', 'mentor-elena-vance'],
      fromUid: 'demo-uiu-scholar',
      toUid: 'mentor-elena-vance',
      text: 'Thank you! I will share my preliminary dataset tonight.',
      createdAt: Date.now() - 1000 * 60 * 30,
      read: true,
    },
  ],
};

export const initialConversations = [
  {
    id: 'Algometer__Dr. Elena Vance',
    participantIds: ['demo-uiu-scholar', 'mentor-elena-vance'],
    lastText: 'Thank you! I will share my preliminary dataset tonight.',
    lastFrom: 'demo-uiu-scholar',
    lastFromName: 'Alex Rivera',
    unread: { 'demo-uiu-scholar': 0, 'mentor-elena-vance': 0 },
    updatedAt: Date.now() - 1000 * 60 * 30,
    peer: {
      name: 'Dr. Elena Vance',
      title: 'Senior Researcher, Applied Mathematics',
      avatarUrl: DEMO_AVATAR,
    },
  },
];

export const demoChatPeers = [
  {
    uid: 'mentor-elena-vance',
    name: 'Dr. Elena Vance',
    title: 'Senior Researcher, Applied Mathematics',
    avatarUrl: DEMO_AVATAR,
  },
  {
    uid: 'mentor-aris-thorne',
    name: 'Dr. Aris Thorne',
    title: 'Senior Researcher, Data Science',
    avatarUrl: DEMO_AVATAR,
  },
];