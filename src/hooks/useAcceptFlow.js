import { useState } from 'react';

// Accept an incoming request: realtime mode persists to Firestore (a session is
// created server-side); demo mode updates the local list and creates a session.
export function useAcceptFlow({
  realtime,
  incomingList,
  updateIncoming,
  onAcceptRequest,
  onCreateSession,
  onSelectSession,
  userProfile,
  userAvatar,
  onShowToast,
}) {
  const [acceptingReq, setAcceptingReq] = useState(null);
  const [acceptNote, setAcceptNote] = useState('');
  const [acceptPlatform, setAcceptPlatform] = useState('SkillSwap Connect');
  const [acceptMeetingLink, setAcceptMeetingLink] = useState('https://meet.google.com/new');

  const handleOpenAcceptModal = (req) => {
    setAcceptingReq(req);
    setAcceptNote(
      `Accepted! I look forward to working on ${req.requestedSkill}. Please prepare any preliminary dataset or formulas prior to our session.`
    );
    setAcceptPlatform('SkillSwap Connect');
    setAcceptMeetingLink('https://meet.google.com/new');
  };

  const handleConfirmAccept = async () => {
    if (!acceptingReq) return;

    if (realtime) {
      try {
        const sessionId = await onAcceptRequest(acceptingReq, {
          note: acceptNote,
          platform: acceptPlatform,
          meetingLink: acceptMeetingLink,
        });
        onShowToast(
          `🎉 Request from ${acceptingReq.requester.name} accepted! A session was scheduled with your meeting link.`
        );
        setAcceptingReq(null);
        if (sessionId && onSelectSession) {
          onSelectSession({ id: sessionId });
        }
      } catch (e) {
        console.warn('Accept failed:', e);
        onShowToast('Could not accept request. Please try again.');
      }
      return;
    }

    // 1. Update request status in list
    const createdSessionId = `session-${Date.now()}`;
    const updated = incomingList.map((r) =>
      r.id === acceptingReq.id
        ? {
            ...r,
            status: 'accepted',
            acceptedAt: 'Just now',
            responseNote: acceptNote,
            linkedSessionId: createdSessionId,
          }
        : r
    );
    updateIncoming(updated);

    // 2. Create actual confirmed session in global sessions list
    const newSession = {
      id: createdSessionId,
      originRequestId: acceptingReq.id,
      title: acceptingReq.requestedSkill,
      status: 'Accepted',
      description: `Collaborative mentorship session requested by ${acceptingReq.requester.name}. Focus: ${acceptingReq.requestedSkill}.`,
      learningGoals: [
        `Master foundational theorems in ${acceptingReq.requestedSkill}`,
        'Solve core applied problems and edge cases',
        'Review methodological integrity and literature context',
      ],
      duration: acceptingReq.skillLevel?.includes('90')
        ? '90 Minutes'
        : acceptingReq.skillLevel?.includes('45')
        ? '45 Minutes'
        : '60 Minutes',
      method: 'Video Call',
      platform: acceptPlatform,
      date: acceptingReq.formattedDate || acceptingReq.preferredDate,
      time: acceptingReq.preferredTimeSlot,
      partner: {
        id: acceptingReq.requester.id,
        name: acceptingReq.requester.name,
        title: acceptingReq.requester.title,
        avatarUrl: acceptingReq.requester.avatarUrl,
        isOnline: acceptingReq.requester.isOnline,
        badges: [acceptingReq.requester.university, 'Scholar Swap'],
        rating: acceptingReq.requester.rating,
        reviewsCount: acceptingReq.requester.completedSwaps || 12,
        credentials: ['Verified Student Scholar'],
        responseSpeed: 'Fast responder',
        availability: acceptingReq.preferredTimeSlot,
        preferredMode: 'SkillSwap Connect Video Call',
      },
      notes: [
        {
          id: `note-${Date.now()}-1`,
          authorName: acceptingReq.requester.name,
          authorAvatar: acceptingReq.requester.avatarUrl,
          timestamp: acceptingReq.submittedAt || 'Recently',
          text: acceptingReq.goals,
        },
        {
          id: `note-${Date.now()}-2`,
          authorName: userProfile?.name || 'You',
          authorAvatar: userAvatar,
          timestamp: 'Just now',
          text: acceptNote,
        },
      ],
    };

    if (onCreateSession) {
      onCreateSession(newSession);
    }
    if (onSelectSession) {
      onSelectSession(newSession);
    }

    onShowToast(
      `🎉 Request from ${acceptingReq.requester.name} accepted! +${acceptingReq.creditsOffered} Academic Credits added to your balance.`
    );
    setAcceptingReq(null);
  };

  return {
    acceptingReq,
    setAcceptingReq,
    acceptNote,
    setAcceptNote,
    acceptPlatform,
    setAcceptPlatform,
    acceptMeetingLink,
    setAcceptMeetingLink,
    handleOpenAcceptModal,
    handleConfirmAccept,
  };
}