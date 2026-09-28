import { useCallback } from 'react';
import {
  addSessionNote,
  resolveSessionTimes,
  settleSessionSide,
  updateSession,
} from '../services/realtime';

export function useSessionHandlers({
  setSelectedSessionId,
  setCurrentScreen,
  showToast,
  myUid,
}) {
  const handleCreateSession = useCallback(() => {
    showToast('Sessions are created after the receiving scholar accepts a swap request.');
  }, [showToast]);

  const handleUpdateSession = useCallback(async (updatedSession) => {
    if (!updatedSession?.id) return;
    if (updatedSession.status === 'Cancelled') {
      try {
        await updateSession(updatedSession.id, {
          status: 'Cancelled',
          cancelledAt: Date.now(),
          cancelledBy: myUid,
        });
      } catch (error) {
        console.warn('Cancel session failed:', error);
        showToast('Could not cancel this session. Please try again.');
        throw error;
      }
      return;
    }
    const next = {
      title: updatedSession.title,
      date: updatedSession.date,
      time: updatedSession.time,
      timeZone: updatedSession.timeZone,
    };
    const { startAt, endAt } = resolveSessionTimes(updatedSession);
    if (startAt) {
      next.startAt = startAt;
      next.endAt = endAt;
    }
    try {
      await updateSession(updatedSession.id, next);
    } catch (error) {
      console.warn('Update session failed:', error);
      showToast('Could not update this session.');
      throw error;
    }
  }, [showToast, myUid]);

  const handleSelectSession = useCallback((session) => {
    setSelectedSessionId(session?.id || null);
    setCurrentScreen('session-details');
  }, [setSelectedSessionId, setCurrentScreen]);

  const handleAddSessionNote = useCallback((sessionId, note) =>
    addSessionNote(sessionId, note).catch((error) => {
      console.warn('Add note failed:', error);
      showToast('Could not save the session note.');
      throw error;
    }), [showToast]);

  const handleSettleSession = useCallback(async (session) => {
    if (!session?.id || !myUid) return null;
    return settleSessionSide({ sessionId: session.id, currentUid: myUid });
  }, [myUid]);

  return {
    handleCreateSession,
    handleUpdateSession,
    handleSelectSession,
    handleAddSessionNote,
    handleSettleSession,
  };
}
