import { useMemo, useState } from 'react';
import { formatAcademicDate, toDateInput } from '../utils/dateUtils';

export function useRequestForm({
  selectedMentorForRequest,
  fallbackMentor,
  onSendRequest,
  onShowToast,
  setActiveTab,
  userProfile,
}) {
  const currentMentor = selectedMentorForRequest || fallbackMentor;
  const skills = useMemo(() => currentMentor?.skills || [], [currentMentor]);
  const draft = currentMentor?.requestDraft || {};
  const draftSkill = skills.find((skill) => skill.name === draft.topic);
  const [selectedSkillId, setSelectedSkillId] = useState(draftSkill?.id || skills[0]?.id || '');
  const [draftDate, draftTime] = String(draft.slot || '').split('|');
  const [preferredDate, setPreferredDate] = useState(draftDate || toDateInput(2));
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(
    draftTime || 'Morning (09:00 - 12:00)'
  );
  const [sessionGoals, setSessionGoals] = useState(draft.note || '');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleSendLearningRequest = async (event) => {
    event.preventDefault();
    if (!currentMentor?.uid || !onSendRequest) {
      onShowToast?.('Select a scholar from Discover before sending a request.');
      return;
    }

    const chosenSkill = skills.find((skill) => skill.id === selectedSkillId) || skills[0];
    if (!chosenSkill) {
      onShowToast?.('This scholar has not listed a teachable skill yet.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const cost = Number(currentMentor.cost || 2.5);
      await onSendRequest({
        mentor: currentMentor,
        requestedSkill: chosenSkill.name,
        skillLevel: chosenSkill.level || '60 minutes',
        offeredExchange: `${cost} Academic Credits`,
        offeredSkill: userProfile?.skillsTeach?.[0] || userProfile?.expertiseAreas?.[0] || '',
        cost,
        creditsOffered: cost,
        preferredDate,
        formattedDate: formatAcademicDate(`${preferredDate}T12:00:00`),
        preferredTimeSlot,
        goals: sessionGoals.trim(),
      });
      onShowToast?.(`Learning session requested from ${currentMentor.name}.`);
      setActiveTab('outgoing');
    } catch (error) {
      console.warn('Send request failed:', error);
      onShowToast?.(error?.message || 'Could not send the request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return {
    currentMentor,
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
