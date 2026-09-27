// Firestore snapshots are the single source of truth for request lists.
export function useRequestLists({ incomingRequests = [], outgoingRequests = [] }) {
  return {
    incomingList: incomingRequests,
    outgoingList: outgoingRequests,
  };
}
