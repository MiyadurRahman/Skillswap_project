import { useState } from 'react';

// Local mirrors of the request lists. In realtime mode the Firebase prop is the
// source of truth; in demo mode mutations update local state (and the parent).
export function useRequestLists({
  realtime,
  incomingRequests,
  onUpdateIncomingRequests,
  outgoingRequests,
  onUpdateOutgoingRequests,
}) {
  const [incomingListState, setIncomingListState] = useState(incomingRequests);
  const [outgoingListState, setOutgoingListState] = useState(outgoingRequests);

  const incomingList = realtime ? incomingRequests : incomingListState;
  const outgoingList = realtime ? outgoingRequests : outgoingListState;

  const updateIncoming = (newList) => {
    setIncomingListState(newList);
    if (onUpdateIncomingRequests) onUpdateIncomingRequests(newList);
  };

  const updateOutgoing = (newList) => {
    setOutgoingListState(newList);
    if (onUpdateOutgoingRequests) onUpdateOutgoingRequests(newList);
  };

  return { incomingList, outgoingList, updateIncoming, updateOutgoing };
}