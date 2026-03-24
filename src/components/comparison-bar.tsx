'use client';

import React from 'react';
import { useComparison } from '@/providers/comparison-provider';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonBar() {
  const { selectedIds, clearComparison } = useComparison();

  if (selectedIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
      >
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                เปรียบเทียบการแข่งขัน ({selectedIds.length}/4)
              </p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                เลือกได้สูงสุด 4 รายการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearComparison}
              className="text-slate-500 hover:text-slate-900 font-bold text-xs"
            >
              ล้างทั้งหมด
            </Button>
            
            <Link href="/compare">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-black px-6 rounded-xl group">
                เปรียบเทียบตอนนี้
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <div className="h-8 w-px bg-slate-100 mx-1" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearComparison}
              className="h-8 w-8 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
