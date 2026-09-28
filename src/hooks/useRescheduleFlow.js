import { useState } from 'react';
import { getLocalTimeZone, toDateInput, toTimeInputValue } from '../utils/dateUtils';

export function useRescheduleFlow({
  onRescheduleRequest,
  onConfirmRescheduleRequest,
  onCancelOutgoingRequest,
  onShowToast,
}) {
  const [reschedulingReq, setReschedulingReq] = useState(null);
  const [newProposedDate, setNewProposedDate] = useState(() => toDateInput(3));
  const [newProposedSlot, setNewProposedSlot] = useState('14:00');
  const [rescheduleNote, setRescheduleNote] = useState('');

  const handleOpenRescheduleModal = (request) => {
    setReschedulingReq(request);
    setNewProposedDate(request.preferredDate || toDateInput(3));
    setNewProposedSlot(toTimeInputValue(request.preferredTimeSlot, '14:00'));
    setRescheduleNote('');
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingReq || !onRescheduleRequest) return;
    try {
      await onRescheduleRequest(reschedulingReq.id, {
        date: newProposedDate,
        slot: newProposedSlot,
        timeZone: getLocalTimeZone(),
        note: rescheduleNote.trim(),
      });
      onShowToast?.(`Alternate time sent to ${reschedulingReq.requester.name}.`);
      setReschedulingReq(null);
    } catch (error) {
      console.warn('Reschedule failed:', error);
      onShowToast?.(error?.message || 'Could not send the alternate time.');
    }
  };

  const handleConfirmRescheduleResponse = async (request) => {
    if (!onConfirmRescheduleRequest) return;
    try {
      await onConfirmRescheduleRequest(
        request.id,
        request.rescheduledDate || request.preferredDate,
        request.rescheduledSlot || request.preferredTimeSlot,
        request.rescheduledTimeZone || getLocalTimeZone()
      );
      onShowToast?.(`New time confirmed with ${request.mentor.name}.`);
    } catch (error) {
      console.warn('Confirm reschedule failed:', error);
      onShowToast?.(error?.message || 'Could not confirm the new time.');
    }
  };

  const handleDeclineReschedule = async (request) => {
    if (!onCancelOutgoingRequest) return;
    try {
      await onCancelOutgoingRequest(request.id);
      onShowToast?.('Reschedule declined. The request was withdrawn.');
    } catch (error) {
      console.warn('Decline reschedule failed:', error);
      onShowToast?.(error?.message || 'Could not withdraw the request.');
    }
  };

  return {
    reschedulingReq,
    setReschedulingReq,
    newProposedDate,
    setNewProposedDate,
    newProposedSlot,
    setNewProposedSlot,
    rescheduleNote,
    setRescheduleNote,
    handleOpenRescheduleModal,
    handleConfirmReschedule,
    handleConfirmRescheduleResponse,
    handleDeclineReschedule,
  };
}
