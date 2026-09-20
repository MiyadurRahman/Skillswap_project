import { useState } from 'react';
import { formatAcademicDate, toDateInput } from '../utils/dateUtils';

// State + submit handler for the "Request a Learning Session" form.
export function useRequestForm({
  realtime,
  selectedMentorForRequest,
  fallbackMentor,
  onSendRequest,
  onShowToast,
  setActiveTab,
  updateOutgoing,
  outgoingList,
  userProfile,
}) {
  const [currentMentor, setCurrentMentor] = useState(
    selectedMentorForRequest || fallbackMentor
  );
  const [selectedSkillId, setSelectedSkillId] = useState('qm');
  const [preferredDate, setPreferredDate] = useState(() => toDateInput(2));
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [sessionGoals, setSessionGoals] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleSendLearningRequest = async (e) => {
    e.preventDefault();
    setIsSubmittingRequest(true);

    const chosenSkill =
      currentMentor.skills.find((s) => s.id === selectedSkillId) || currentMentor.skills[0];
    const formattedPreferredDate = formatAcademicDate(`${preferredDate}T12:00:00`);

    // REALTIME: push the request to Firestore so the mentor sees it instantly.
    if (realtime) {
      try {
        if (!currentMentor?.uid) {
          onShowToast('In production mode, request a Live Scholar from the Discover page.');
          setIsSubmittingRequest(false);
          return;
        }
        await onSendRequest({
          mentor: currentMentor,
          requestedSkill: chosenSkill?.name || currentMentor.name,
          skillLevel: chosenSkill?.level || 'Advanced Level • 60 min',
          offeredExchange: `${currentMentor.cost || 250} Academic Credits`,
          offeredSkill: userProfile?.expertiseAreas?.[0] || 'Peer Expertise',
          cost: currentMentor.cost || 250,
          creditsOffered: currentMentor.cost || 250,
          preferredDate: preferredDate,
          formattedDate: formattedPreferredDate,
          preferredTimeSlot: preferredTimeSlot,
          goals: sessionGoals || 'Learning fundamentals and advanced application.',
        });
        onShowToast(`✨ Learning session requested from ${currentMentor.name}!`);
        setIsSubmittingRequest(false);
        setActiveTab('outgoing');
      } catch (err) {
        console.warn('Send request failed:', err);
        setIsSubmittingRequest(false);
        const permissionDenied =
          typeof err?.code === 'string' && err.code.includes('permission-denied');
        onShowToast(
          permissionDenied
            ? 'Request blocked by Firestore security rules. Make sure they are deployed (firebase deploy --only firestore).'
            : 'Could not send request. Check your connection and try again.'
        );
      }
      return;
    }

    const newOutReq = {
      id: `req-out-${Date.now()}`,
      mentor: currentMentor,
      requestedSkill: chosenSkill.name,
      skillLevel: chosenSkill.level,
      cost: currentMentor.cost || 250,
      preferredDate: preferredDate,
      formattedDate: formattedPreferredDate,
      preferredTimeSlot: preferredTimeSlot,
      goals: sessionGoals || 'Learning fundamentals and advanced application.',
      status: 'pending',
      submittedAt: 'Just now',
    };

    setTimeout(() => {
      updateOutgoing([newOutReq, ...outgoingList]);
      setIsSubmittingRequest(false);
      onShowToast(`✨ Learning session requested from ${currentMentor.name}!`);
      setActiveTab('outgoing');
    }, 400);
  };

  return {
    currentMentor,
    setCurrentMentor,
    selectedSkillId,
    setSelectedSkillId,
    preferredDate,
    minPreferredDate: toDateInput(1),
    setPreferredDate,
    preferredTimeSlot,
    setPreferredTimeSlot,
    sessionGoals,
    setSessionGoals,
    isSubmittingRequest,
    handleSendLearningRequest,
  };
}
