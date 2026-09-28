import { useState } from 'react';

export function useDeclineFlow({ onDeclineRequest, onShowToast }) {
  const [decliningReq, setDecliningReq] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [customDeclineNote, setCustomDeclineNote] = useState('');

  const handleOpenDeclineModal = (request) => {
    setDecliningReq(request);
    setDeclineReason('');
    setCustomDeclineNote('');
  };

  const handleConfirmDecline = async () => {
    if (!decliningReq || !onDeclineRequest) return;
    const reason = customDeclineNote.trim() || declineReason;
    if (!reason || reason === 'Other reason...') {
      onShowToast?.('Choose a reason or add a brief explanation.');
      return;
    }
    try {
      await onDeclineRequest(decliningReq.id, reason);
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
