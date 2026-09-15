import { useState } from 'react';

// Reschedule an incoming request (propose an alternate time) and respond to a
// mentor's proposed alternate time on outgoing requests.
export function useRescheduleFlow({
  realtime,
  incomingList,
  updateIncoming,
  outgoingList,
  updateOutgoing,
  onRescheduleRequest,
  onConfirmRescheduleRequest,
  onCancelOutgoingRequest,
  onShowToast,
}) {
  const [reschedulingReq, setReschedulingReq] = useState(null);
  const [newProposedDate, setNewProposedDate] = useState('2024-10-28');
  const [newProposedSlot, setNewProposedSlot] = useState('Afternoon (14:00 - 15:30)');
  const [rescheduleNote, setRescheduleNote] = useState('');

  const handleOpenRescheduleModal = (req) => {
    setReschedulingReq(req);
    setNewProposedDate(req.preferredDate || '2024-10-28');
    setNewProposedSlot('Afternoon (14:00 - 15:30)');
    setRescheduleNote(
      'I have a lab conflict at your requested time, but I am available at this alternate slot.'
    );
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingReq) return;

    if (realtime) {
      try {
        await onRescheduleRequest(reschedulingReq.id, {
          date: newProposedDate,
          slot: newProposedSlot,
          note: rescheduleNote,
        });
        onShowToast(
          `Alternate time proposal sent to ${reschedulingReq.requester.name}. Awaiting scholar confirmation.`
        );
        setReschedulingReq(null);
      } catch (e) {
        console.warn('Reschedule failed:', e);
        onShowToast('Could not send proposal. Please try again.');
      }
      return;
    }

    const updated = incomingList.map((r) =>
      r.id === reschedulingReq.id
        ? {
            ...r,
            status: 'rescheduled',
            rescheduledDate: newProposedDate,
            rescheduledSlot: newProposedSlot,
            rescheduleNote: rescheduleNote,
          }
        : r
    );
    updateIncoming(updated);

    onShowToast(
      `Alternate time proposal sent to ${reschedulingReq.requester.name}. Awaiting scholar confirmation.`
    );
    setReschedulingReq(null);
  };

  // Outgoing request — respond to a mentor's proposed alternate time.
  const handleConfirmRescheduleResponse = async (req) => {
    if (realtime) {
      try {
        await onConfirmRescheduleRequest(
          req.id,
          req.rescheduledDate || req.preferredDate,
          req.rescheduledSlot || req.preferredTimeSlot
        );
        onShowToast(`New time confirmed with ${req.mentor.name}. Mentor will be notified.`);
      } catch (e) {
        console.warn('Confirm reschedule failed:', e);
        onShowToast('Could not confirm new time. Please try again.');
      }
      return;
    }

    const updated = outgoingList.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: 'pending',
            preferredDate: r.rescheduledDate || r.preferredDate,
            formattedDate: r.rescheduledDate || r.formattedDate,
            preferredTimeSlot: r.rescheduledSlot || r.preferredTimeSlot,
            rescheduledDate: undefined,
            rescheduledSlot: undefined,
            rescheduleNote: undefined,
          }
        : r
    );
    updateOutgoing(updated);
    onShowToast('Alternate time accepted. Request is pending mentor confirmation.');
  };

  const handleDeclineReschedule = async (req) => {
    if (realtime) {
      try {
        await onCancelOutgoingRequest(req.id);
        onShowToast('Reschedule declined. Request has been withdrawn.');
      } catch (e) {
        console.warn('Decline reschedule failed:', e);
        onShowToast('Could not withdraw request. Please try again.');
      }
      return;
    }

    updateOutgoing(outgoingList.filter((r) => r.id !== req.id));
    onShowToast('Reschedule declined. Request has been withdrawn.');
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