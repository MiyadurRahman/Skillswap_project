import { useState } from 'react';

export function useDeclineFlow({ onDeclineRequest, onShowToast }) {
  const [decliningReq, setDecliningReq] = useState(null);
  const [declineReason, setDeclineReason] = useState('Schedule conflict during this time slot');
  const [customDeclineNote, setCustomDeclineNote] = useState('');

  const handleOpenDeclineModal = (request) => {
    setDecliningReq(request);
    setDeclineReason('Schedule conflict during this time slot');
    setCustomDeclineNote('');
  };

  const handleConfirmDecline = async () => {
    if (!decliningReq || !onDeclineRequest) return;
    try {
      await onDeclineRequest(
        decliningReq.id,
        customDeclineNote.trim() || declineReason
      );
      onShowToast?.(`Request from ${decliningReq.requester.name} declined.`);
      setDecliningReq(null);
    } catch (error) {
      console.warn('Decline failed:', error);
      onShowToast?.(error?.message || 'Could not decline request. Please try again.');
    }
  };

  return {
    decliningReq,
    setDecliningReq,
    declineReason,
    setDeclineReason,
    customDeclineNote,
    setCustomDeclineNote,
    handleOpenDeclineModal,
    handleConfirmDecline,
  };
}
