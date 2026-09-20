import { useEffect, useState } from 'react';
import {
  subscribeAllUsers,
  subscribeConversations,
  subscribeIncomingRequests,
  subscribeOutgoingRequests,
  subscribeSessions,
  subscribeTransactions,
} from '../services/realtime';

export const REQUIRED_SNAPSHOTS = 6; // incoming + outgoing + sessions + users + conversations + transactions
const GATE_TIMEOUT_MS = 2500;

// Live Firestore subscriptions (realtime mode only). Counts how many
// subscriptions have delivered their first snapshot so the app can wait for
// all of them before painting — a refresh never flashes empty.
export function useFirestoreSubscriptions({
  isRealtime,
  myUid,
  setIncomingRequests,
  setOutgoingRequests,
  setSessions,
  setRealtimeUsers,
  setConversations,
  setCreditTransactions,
}) {
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    if (!isRealtime || !myUid) return;

    setReadyCount(0);
    const onFirst = () => setReadyCount((c) => c + 1);

    const unsubscribers = [
      subscribeIncomingRequests(myUid, setIncomingRequests, onFirst),
      subscribeOutgoingRequests(myUid, setOutgoingRequests, onFirst),
      subscribeSessions(myUid, setSessions, onFirst),
      subscribeAllUsers(setRealtimeUsers, onFirst),
      subscribeConversations(myUid, setConversations, onFirst),
      subscribeTransactions(myUid, setCreditTransactions, onFirst),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [
    isRealtime,
    myUid,
    setIncomingRequests,
    setOutgoingRequests,
    setSessions,
    setRealtimeUsers,
    setConversations,
    setCreditTransactions,
  ]);

  // Safety net: never leave the UI blocked if a subscription errors out or the
  // project has no data — force the initial-paint gate open after 2.5s.
  useEffect(() => {
    if (readyCount >= REQUIRED_SNAPSHOTS) return;
    const t = setTimeout(
      () => setReadyCount((c) => (c >= REQUIRED_SNAPSHOTS ? c : REQUIRED_SNAPSHOTS)),
      GATE_TIMEOUT_MS
    );
    return () => clearTimeout(t);
  }, [readyCount]);

  return { readyCount };
}