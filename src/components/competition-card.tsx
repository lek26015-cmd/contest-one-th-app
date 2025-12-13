"use client";

import Link from 'next/link';
import type { Competition } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { motion } from 'framer-motion';

export default function CompetitionCard({ competition }: { competition: Competition }) {
  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);
  const isExpired = isPast(deadlineDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="leading-tight">{competition.title}</CardTitle>
            <Badge variant="secondary" className="flex-shrink-0">
              <Icon className="mr-1.5 h-4 w-4" />
              {competition.category}
            </Badge>
          </div>
          <CardDescription className="flex items-center pt-2 text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Deadline: {format(deadlineDate, 'MMMM d, yyyy')}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="line-clamp-3 text-sm text-foreground/80">{competition.description}</p>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="flex w-full items-center justify-between text-sm">
            <div className={`flex items-center ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock className="mr-2 h-4 w-4" />
              {isExpired
                ? 'Deadline passed'
                : `${formatDistanceToNow(deadlineDate, { addSuffix: true })}`}
            </div>
            <Button asChild>
              <Link href={`/competitions/${competition.id}`}>View Details</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
