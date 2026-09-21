import { useCallback } from 'react';
import {
  addSessionNote,
  resolveSessionTimes,
  settleSessionSide,
  updateSession,
} from '../services/realtime';

// Session actions: create (demo mode), update (date/time/title/status),
// select, add notes, and settle (credit transfer + review flow). Realtime
// updates go to Firestore; demo updates mutate local state.
export function useSessionHandlers({
  isRealtime,
  setSessions,
  setSelectedSessionId,
  setCurrentScreen,
  showToast,
  myUid,
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
      setCurrentScreen('session-details');
      showToast(`✨ Session scheduled with ${created.partner?.name || 'peer'}!`);
    },
    [isRealtime, setSessions, setSelectedSessionId, setCurrentScreen, showToast]
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

  // Settle the current user's side of a session. In realtime mode it runs the
  // server-guarded Firestore transaction and returns the result; in demo mode
  // it just updates local state for a cosmetic "completion" feel.
  const handleSettleSession = useCallback(
    async (session) => {
      if (!session) return null;
      if (isRealtime) {
        const result = await settleSessionSide({
          sessionId: session.id,
          currentUid: myUid,
        });
        return result;
      }
      // Demo: cosmetic completion only; credit balances never change in the preview.
      const settledBy = { ...(session.settledBy || {}), demo: 'demo' };
      const allSettled = (session.participantIds || []).every(
        (p) => settledBy[p] != null
      ) || session.participantIds?.length === 0;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id
            ? { ...s, status: allSettled ? 'Completed' : s.status, settledBy }
            : s
        )
      );
      return { demo: true, allSettled };
    },
    [isRealtime, setSessions, myUid]
  );

  return {
    handleCreateSession,
    handleUpdateSession,
    handleSelectSession,
    handleAddSessionNote,
    handleSettleSession,
  };
}
