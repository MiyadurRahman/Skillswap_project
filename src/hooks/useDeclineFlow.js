import { useState } from 'react';

// Decline an incoming request with a professional reason.
export function useDeclineFlow({
  realtime,
  incomingList,
  updateIncoming,
  onDeclineRequest,
  onShowToast,
}) {
  const [decliningReq, setDecliningReq] = useState(null);
  const [declineReason, setDeclineReason] = useState(
    'Schedule conflict during this time slot'
  );
  const [customDeclineNote, setCustomDeclineNote] = useState('');

  const handleOpenDeclineModal = (req) => {
    setDecliningReq(req);
    setDeclineReason('Schedule conflict during this time slot');
    setCustomDeclineNote('');
  };

  const handleConfirmDecline = async () => {
    if (!decliningReq) return;

    if (realtime) {
      try {
        await onDeclineRequest(
          decliningReq.id,
          customDeclineNote || declineReason || 'Schedule conflict during this time slot'
        );
        onShowToast(
          `Request from ${decliningReq.requester.name} politely declined. Credits returned to scholar.`
        );
        setDecliningReq(null);
      } catch (e) {
        console.warn('Decline failed:', e);
        onShowToast('Could not decline request. Please try again.');
      }
      return;
    }

    const updated = incomingList.map((r) =>
      r.id === decliningReq.id
        ? {
            ...r,
            status: 'declined',
            declinedAt: 'Just now',
            declineReason: customDeclineNote || declineReason,
          }
        : r
    );
    updateIncoming(updated);

    onShowToast(
      `Request from ${decliningReq.requester.name} politely declined. Credits returned to scholar.`
    );
    setDecliningReq(null);
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