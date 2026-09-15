import { useCallback } from 'react';
import {
  acceptRequest,
  buildRequesterSnapshot,
  cancelOutgoingRequest,
  confirmRescheduleRequest,
  createRequest,
  declineRequest,
  rescheduleRequest,
} from '../services/realtime';

// Realtime request lifecycle handlers: send, accept, decline, reschedule,
// confirm reschedule, cancel outgoing.
export function useRequestHandlers({ myUid, myProfile, setSelectedSessionId }) {
  const handleSendRequest = useCallback(
    async ({ mentor, ...details }) => {
      const requester = buildRequesterSnapshot(myUid, myProfile);
      const mentorSnapshot = {
        uid: mentor.uid || mentor.id,
        name: mentor.name,
        title: mentor.title,
        avatarUrl: mentor.avatarUrl,
        university: mentor.university,
        badge1: mentor.badge1,
        badge2: mentor.badge2,
      };
      return createRequest({ requester, mentor: mentorSnapshot, details });
    },
    [myUid, myProfile]
  );

  const handleAcceptIncoming = useCallback(
    async (request, { note, platform, meetingLink }) => {
      const fixedLink =
        meetingLink ||
        (platform === 'Zoom Meeting Room'
          ? 'https://zoom.us/j/new'
          : 'https://meet.google.com/new');
      const sessionId = await acceptRequest({
        requestId: request.id,
        request,
        currentUid: myUid,
        currentProfile: myProfile,
        note,
        platform,
        meetingLink: fixedLink,
      });
      setSelectedSessionId(sessionId);
      return sessionId;
    },
    [myUid, myProfile, setSelectedSessionId]
  );

  const handleDeclineIncoming = useCallback((requestId, reason) => {
    return declineRequest(requestId, reason);
  }, []);

  const handleRescheduleIncoming = useCallback((requestId, payload) => {
    return rescheduleRequest(requestId, payload);
  }, []);

  const handleConfirmRescheduleRequest = useCallback((requestId, newDate, newSlot) => {
    return confirmRescheduleRequest(requestId, newDate, newSlot);
  }, []);

  const handleCancelOutgoing = useCallback((requestId) => {
    return cancelOutgoingRequest(requestId);
  }, []);

  return {
    handleSendRequest,
    handleAcceptIncoming,
    handleDeclineIncoming,
    handleRescheduleIncoming,
    handleConfirmRescheduleRequest,
    handleCancelOutgoing,
  };
}