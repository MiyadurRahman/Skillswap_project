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
  const [gateState, setGateState] = useState({ uid: null, expired: false });
  const readyCount = isRealtime && readyState.uid === myUid ? readyState.count : 0;
  const gateExpired = isRealtime && gateState.uid === myUid && gateState.expired;

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

  // One absolute deadline per account prevents staggered snapshots from
  // repeatedly extending the loading screen.
  useEffect(() => {
    if (!isRealtime || !myUid) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setGateState({ uid: myUid, expired: true });
    }, GATE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isRealtime, myUid]);

  return {
    readyCount,
    dataReady: !isRealtime || readyCount >= REQUIRED_SNAPSHOTS || gateExpired,
    dataDelayed: isRealtime && gateExpired && readyCount < REQUIRED_SNAPSHOTS,
  };
}
