import { useMemo, useState } from 'react';
import { allPeers } from '../data/peersData';
import { matchesFilters } from '../utils/peerFilters';

const DEFAULT_FIELDS = {
  'Data Science': false,
  'Academic Writing': false,
  'UI/UX Design': false,
  'Microeconomics': false,
};

export const TRENDING_TAGS = [
  'Quantum Mechanics',
  'Digraphities',
  'Bioinformatics',
  'Machine Learning',
  'Academic Writing',
];

// Search + filter state and derived results for the Discover catalog. Both demo
// peers and realtime scholars run through the same matchesFilters matcher.
export function useDiscoverFilters(liveScholars, onShowToast) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState(DEFAULT_FIELDS);
  const [minRating, setMinRating] = useState(4.0);
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
    setMinRating(4.0);
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
      onShowToast(`Filtering peers for "${tag}"`);
    }
  };

  const filteredPeers = useMemo(
    () =>
      allPeers.filter((peer) =>
        matchesFilters(peer, { searchQuery, selectedFields, minRating, availability, academicLevel })
      ),
    [searchQuery, selectedFields, minRating, availability, academicLevel]
  );

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

  // Paginated peers (4 per page to match exact 2x2 grid layout from screenshot)
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredPeers.length / itemsPerPage) || 1;
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedPeers = filteredPeers.slice(
    (effectivePage - 1) * itemsPerPage,
    effectivePage * itemsPerPage
  );

  return {
    trendingTags: TRENDING_TAGS,
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
    filteredPeers,
    filteredLive,
    totalPages,
    effectivePage,
    paginatedPeers,
    resetFilters,
  };
}