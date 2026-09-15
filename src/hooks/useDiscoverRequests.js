import { useState } from 'react';

// "Request Session from Discover" modal state + submit handler.
export function useDiscoverRequests({
  realtime,
  onRequestRealtime,
  onShowToast,
  onCreateSession,
  onNavigateScreen,
  userProfile,
  userAvatar,
}) {
  const [requestingPeer, setRequestingPeer] = useState(null);
  const [reqTopic, setReqTopic] = useState('');
  const [reqSlot, setReqSlot] = useState('');
  const [reqOfferedSkill, setReqOfferedSkill] = useState('Python Data Science');
  const [reqNote, setReqNote] = useState('');

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

    // REALTIME: demo mentors can't receive requests — route real users to the
    // Live Scholars request form instead of creating a fake instant session.
    if (realtime && onRequestRealtime) {
      if (requestingPeer?.uid) {
        onRequestRealtime(requestingPeer);
      } else {
        onShowToast('In production mode, request sessions from Live Scholars (listed above).');
      }
      setRequestingPeer(null);
      return;
    }

    const newSession = {
      id: `session-${Date.now()}`,
      title: reqTopic || requestingPeer.skillsTeach?.[0] || 'Academic Peer Session',
      status: 'Accepted',
      description: `Collaborative academic peer session focusing on ${reqTopic || requestingPeer.skillsTeach?.[0]} with ${requestingPeer.name}.`,
      learningGoals: (requestingPeer.skillsTeach || ['Methodological Rigor', 'Statistical Modeling'])
        .slice(0, 3)
        .map((s) => `Master core foundations of ${s}`),
      duration: '90 Minutes',
      method: 'Video Call',
      platform: 'SkillSwap Connect',
      date: reqSlot.includes('(')
        ? reqSlot.split('(')[0].trim()
        : reqSlot.includes(',')
        ? reqSlot.split(',')[0].trim()
        : 'Wednesday, Oct 24',
      time: reqSlot.includes('(')
        ? reqSlot.split('(')[1].replace(')', '').trim()
        : '02:30 PM — 04:00 PM',
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
      notes: reqNote
        ? [
            {
              id: `note-${Date.now()}`,
              authorName: userProfile?.name || 'You',
              authorAvatar: userAvatar,
              timestamp: 'Just now',
              text: reqNote,
            },
          ]
        : [
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

  return {
    requestingPeer,
    setRequestingPeer,
    reqTopic,
    setReqTopic,
    reqSlot,
    setReqSlot,
    reqOfferedSkill,
    setReqOfferedSkill,
    reqNote,
    setReqNote,
    handleOpenRequestModal,
    handleConfirmDiscoverSession,
  };
}