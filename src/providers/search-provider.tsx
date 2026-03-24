'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  participantTypeFilter: string;
  setParticipantTypeFilter: (type: string) => void;
  prizeFilter: string;
  setPrizeFilter: (prize: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  handleSearch: () => void;
  activeFilters: {
    searchTerm: string;
    category: string;
    participantType: string;
    prize: string;
    sort: string;
  };
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState('all');
  const [prizeFilter, setPrizeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    category: 'all',
    participantType: 'all',
    prize: 'all',
    sort: 'newest',
  });

  const handleSearch = () => {
    setActiveFilters({
      searchTerm,
      category: categoryFilter,
      participantType: participantTypeFilter,
      prize: prizeFilter,
      sort: sortOrder,
    });

    if (pathname !== '/') {
      router.push(`/#competitions`);
    } else {
      const competitionsSection = document.getElementById('competitions');
      if (competitionsSection) {
        competitionsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        participantTypeFilter,
        setParticipantTypeFilter,
        prizeFilter,
        setPrizeFilter,
        sortOrder,
        setSortOrder,
        handleSearch,
        activeFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
