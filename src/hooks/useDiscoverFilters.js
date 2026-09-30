import { useMemo, useState } from 'react';
import { matchesFilters } from '../utils/peerFilters';

const DEFAULT_FIELDS = {
  'Data Science': false,
  'Academic Writing': false,
  'UI/UX Design': false,
  'Microeconomics': false,
};

export function useDiscoverFilters(liveScholars, onShowToast) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState('Anytime');
  const [academicLevel, setAcademicLevel] = useState('Any Level');
  const [activeTrendingTag, setActiveTrendingTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleFieldToggle = (field) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFields(DEFAULT_FIELDS);
    setMinRating(0);
    setAvailability('Anytime');
    setAcademicLevel('Any Level');
    setActiveTrendingTag('');
    setCurrentPage(1);
  };

  const handleTagClick = (tag) => {
    if (activeTrendingTag === tag) {
      setActiveTrendingTag('');
      setSearchQuery('');
    } else {
      setActiveTrendingTag(tag);
      setSearchQuery(tag);
      onShowToast(`Filtering peers for "${tag}"`, 'info');
    }
  };

  const filteredLive = useMemo(
    () =>
      liveScholars.filter((person) =>
        matchesFilters(person, {
          searchQuery,
          selectedFields,
          minRating,
          availability,
          academicLevel,
        })
      ),
    [liveScholars, searchQuery, selectedFields, minRating, availability, academicLevel]
  );

  const trendingTags = useMemo(() => {
    const counts = new Map();
    liveScholars.forEach((person) => {
      (person.skillsTeach || []).forEach((skill) => {
        const label = String(skill || '').trim();
        if (label) counts.set(label, (counts.get(label) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([skill]) => skill);
  }, [liveScholars]);

  // Paginated peers (4 per page to match exact 2x2 grid layout from screenshot)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredLive.length / itemsPerPage) || 1;
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedPeers = filteredLive.slice(
    (effectivePage - 1) * itemsPerPage,
    effectivePage * itemsPerPage
  );

  return {
    trendingTags,
    searchQuery,
    setSearchQuery,
    selectedFields,
    handleFieldToggle,
    minRating,
    setMinRating,
    availability,
    setAvailability,
    academicLevel,
    setAcademicLevel,
    activeTrendingTag,
    setActiveTrendingTag,
    handleTagClick,
    currentPage,
    setCurrentPage,
    filteredPeers: filteredLive,
    filteredLive,
    totalPages,
    effectivePage,
    paginatedPeers,
    resetFilters,
  };
}
