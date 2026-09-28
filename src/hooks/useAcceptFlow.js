import { useState } from 'react';

// Accepting a request is always persisted by the Firestore request workflow.
export function useAcceptFlow({
  onAcceptRequest,
  onSelectSession,
  onShowToast,
}) {
  const [acceptingReq, setAcceptingReq] = useState(null);
  const [acceptNote, setAcceptNote] = useState('');
  const [acceptPlatform, setAcceptPlatform] = useState('Google Meet');
  const [acceptMeetingLink, setAcceptMeetingLink] = useState('');

  const handleOpenAcceptModal = (request) => {
    setAcceptingReq(request);
    setAcceptNote('');
    setAcceptPlatform('Google Meet');
    setAcceptMeetingLink('');
  };

  const handleConfirmAccept = async () => {
    if (!acceptingReq || !onAcceptRequest) return;

    let parsedMeetingLink;
    try {
      parsedMeetingLink = new URL(acceptMeetingLink.trim());
    } catch {
      onShowToast?.('Paste a valid meeting link before accepting the request.');
      return;
    }
    if (!['https:', 'http:'].includes(parsedMeetingLink.protocol)) {
      onShowToast?.('The meeting link must start with https:// or http://.');
      return;
    }

    try {
      const sessionId = await onAcceptRequest(acceptingReq, {
        note: acceptNote.trim(),
        platform: acceptPlatform,
        meetingLink: parsedMeetingLink.toString(),
      });
      onShowToast?.(`Request from ${acceptingReq.requester.name} accepted.`);
      setAcceptingReq(null);
      if (sessionId && onSelectSession) onSelectSession({ id: sessionId });
    } catch (error) {
      console.warn('Accept failed:', error);
      onShowToast?.(error?.message || 'Could not accept request. Please try again.');
    }
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
