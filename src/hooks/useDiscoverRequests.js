import { useState } from 'react';
import { formatAvailability } from '../utils/dateUtils';

// Collects a quick choice in Discover, then opens the canonical request form.
export function useDiscoverRequests({ onRequestRealtime, onShowToast }) {
  const [requestingPeer, setRequestingPeer] = useState(null);
  const [reqTopic, setReqTopic] = useState('');
  const [reqSlot, setReqSlot] = useState('');
  const [reqOfferedSkill, setReqOfferedSkill] = useState('');
  const [reqNote, setReqNote] = useState('');

  const handleOpenRequestModal = (peer) => {
    setRequestingPeer(peer);
    setReqTopic(peer.skillsTeach?.[0] || peer.skills?.[0] || '');
    setReqSlot(peer.nextAvailable || formatAvailability(2));
    setReqOfferedSkill('');
    setReqNote('');
  };

  const handleConfirmDiscoverSession = (event) => {
    event.preventDefault();
    if (!requestingPeer) return;

    if (!requestingPeer.uid || !onRequestRealtime) {
      onShowToast?.('This scholar is not available for a session request.');
      return;
    }

    onRequestRealtime({
      ...requestingPeer,
      requestDraft: {
        topic: reqTopic,
        slot: reqSlot,
        offeredSkill: reqOfferedSkill,
        note: reqNote,
      },
    });
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
