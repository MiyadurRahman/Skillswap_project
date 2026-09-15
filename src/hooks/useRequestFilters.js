import { useMemo, useState } from 'react';

// Status + search filters for the incoming requests list.
export function useRequestFilters(incomingList) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'declined'
  const [searchQuery, setSearchQuery] = useState('');

  const pendingCount = incomingList.filter((r) => r.status === 'pending').length;

  const filteredIncoming = useMemo(() => {
    return incomingList.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = req.requester.name.toLowerCase().includes(q);
        const matchSkill = req.requestedSkill.toLowerCase().includes(q);
        const matchUniv = req.requester.university.toLowerCase().includes(q);
        return matchName || matchSkill || matchUniv;
      }
      return true;
    });
  }, [incomingList, statusFilter, searchQuery]);

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    pendingCount,
    filteredIncoming,
  };
}