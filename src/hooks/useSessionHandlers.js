import { useCallback } from 'react';
import { addSessionNote, resolveSessionTimes, updateSession } from '../services/realtime';

// Session actions: create (demo mode), update (date/time/title/status),
// select, and add notes. Realtime updates go to Firestore; demo updates
// mutate local state.
export function useSessionHandlers({
  isRealtime,
  setSessions,
  setLocalProfile,
  setSelectedSessionId,
  setCurrentScreen,
  showToast,
}) {
  const handleCreateSession = useCallback(
    (newSession) => {
      if (isRealtime) {
        showToast(
          'In production mode, sessions are created when a scholar accepts your request.'
        );
        return;
      }
      const created = {
        id: `session-${Date.now()}`,
        status: 'Accepted',
        duration: '90 Minutes',
        method: 'Video Call',
        platform: 'SkillSwap Connect',
        notes: [],
        ...newSession,
      };
      setSessions((prev) => [created, ...prev]);
      setSelectedSessionId(created.id);
      setLocalProfile((prev) => ({
        ...prev,
        timeCredits: Number((prev.timeCredits + 2.5).toFixed(1)),
      }));
      setCurrentScreen('session-details');
      showToast(`✨ Session scheduled with ${created.partner?.name || 'peer'}!`);
    },
    [isRealtime, setSessions, setSelectedSessionId, setLocalProfile, setCurrentScreen, showToast]
  );

  const handleUpdateSession = useCallback(
    (updatedSession) => {
      const next = {
        status: updatedSession.status,
        date: updatedSession.date,
        time: updatedSession.time,
        title: updatedSession.title,
      };
      const { startAt, endAt } = resolveSessionTimes(updatedSession);
      if (startAt) {
        next.startAt = startAt;
        next.endAt = endAt;
      }
      if (isRealtime && updatedSession?.id) {
        updateSession(updatedSession.id, next).catch((e) =>
          console.warn('Update session failed:', e)
        );
        return;
      }
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      setSelectedSessionId(updatedSession.id);
    },
    [isRealtime, setSessions, setSelectedSessionId]
  );

  const handleSelectSession = useCallback(
    (session) => {
      setSelectedSessionId(session?.id || null);
      setCurrentScreen('session-details');
    },
    [setSelectedSessionId, setCurrentScreen]
  );

  const handleAddSessionNote = useCallback(
    (sessionId, note) => {
      if (!isRealtime) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, notes: [...(s.notes || []), note] } : s))
        );
        return Promise.resolve();
      }
      return addSessionNote(sessionId, note).catch((e) =>
        console.warn('Add note failed:', e)
      );
    },
    [isRealtime, setSessions]
  );

  return {
    handleCreateSession,
    handleUpdateSession,
    handleSelectSession,
    handleAddSessionNote,
  };
}