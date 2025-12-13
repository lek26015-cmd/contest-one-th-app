"use client";

import { useState, useMemo } from 'react';
import type { Competition, CompetitionCategory } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import CompetitionCard from './competition-card';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

type SortOrder = 'deadline-soonest' | 'deadline-latest' | 'newest';

export default function CompetitionBrowser({ competitions }: { competitions: Competition[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CompetitionCategory | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('deadline-soonest');

  const filteredAndSortedCompetitions = useMemo(() => {
    let filtered = competitions;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();

      if (sortOrder === 'deadline-soonest') {
        if(dateA === dateB) return parseInt(b.id) - parseInt(a.id);
        return dateA - dateB;
      }
      if (sortOrder === 'deadline-latest') {
        if(dateA === dateB) return parseInt(b.id) - parseInt(a.id);
        return dateB - dateA;
      }
      if (sortOrder === 'newest') {
        return parseInt(b.id) - parseInt(a.id);
      }
      return 0;
    });
  }, [competitions, categoryFilter, searchTerm, sortOrder]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CompetitionCategory | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline-soonest">Deadline (Soonest)</SelectItem>
              <SelectItem value="deadline-latest">Deadline (Latest)</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredAndSortedCompetitions.length > 0 ? (
            filteredAndSortedCompetitions.map(comp => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full mt-10 text-center"
            >
              <p className="text-lg font-medium">No competitions found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
