'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ComparisonContextType {
  selectedIds: string[];
  toggleComparison: (id: string) => void;
  clearComparison: () => void;
  isComparing: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compare_competitions');
    if (saved) {
      try {
        setSelectedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved comparisons', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when selectedIds change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('compare_competitions', JSON.stringify(selectedIds));
    }
  }, [selectedIds, isInitialized]);

  const toggleComparison = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      // Limit to 4 competitions for comparison to keep UI clean
      if (prev.length >= 4) {
        alert('เปรียบเทียบได้สูงสุด 4 รายการครับ');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isComparing = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  return (
    <ComparisonContext.Provider value={{ selectedIds, toggleComparison, clearComparison, isComparing }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
