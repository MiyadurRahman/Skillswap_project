import { useMemo, useState } from 'react';
import {
  formatAcademicDate,
  getLocalTimeZone,
  toDateInput,
  toTimeInputValue,
} from '../utils/dateUtils';
import { DEFAULT_CREDIT_AMOUNT, MAX_REQUEST_CREDITS } from '../config/economy';

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
    toTimeInputValue(draftTime, '09:00')
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
      const cost = Number(currentMentor.cost || DEFAULT_CREDIT_AMOUNT);
      const balance = Number(userProfile?.timeCredits || 0);
      if (!Number.isFinite(cost) || cost <= 0 || cost > MAX_REQUEST_CREDITS) {
        throw new Error(`Session cost must be between 0 and ${MAX_REQUEST_CREDITS} credits.`);
      }
      if (balance < cost) {
        throw new Error(`You need ${cost} credits for this request. Your balance is ${balance}.`);
      }
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
        preferredTimeSlot: toTimeInputValue(preferredTimeSlot),
        timeZone: getLocalTimeZone(),
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
    timeZone: getLocalTimeZone(),
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
