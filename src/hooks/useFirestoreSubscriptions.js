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
  const [readyState, setReadyState] = useState({ uid: null, count: 0 });
  const readyCount = isRealtime && readyState.uid === myUid ? readyState.count : 0;

  useEffect(() => {
    if (!isRealtime || !myUid) return;

    let active = true;
    const onFirst = () => {
      if (!active) return;
      setReadyState((state) => ({
        uid: myUid,
        count: state.uid === myUid ? state.count + 1 : 1,
      }));
    };

    const unsubscribers = [
      subscribeIncomingRequests(myUid, setIncomingRequests, onFirst),
      subscribeOutgoingRequests(myUid, setOutgoingRequests, onFirst),
      subscribeSessions(myUid, setSessions, onFirst),
      subscribeAllUsers(setRealtimeUsers, onFirst),
      subscribeConversations(myUid, setConversations, onFirst),
      subscribeTransactions(myUid, setCreditTransactions, onFirst),
    ];

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
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
      () =>
        setReadyState((state) => ({
          uid: myUid,
          count:
            state.uid === myUid
              ? Math.max(state.count, REQUIRED_SNAPSHOTS)
              : REQUIRED_SNAPSHOTS,
        })),
      GATE_TIMEOUT_MS
    );
    return () => clearTimeout(t);
  }, [isRealtime, myUid, readyCount]);

  return { readyCount };
}
