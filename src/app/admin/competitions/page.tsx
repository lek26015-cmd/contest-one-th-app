'use client';
import { useState, useMemo } from 'react';
import { 
    getCompetitionsQuery,
    deleteCompetition as deleteFirestoreCompetition, 
    toggleFeatured as toggleFirestoreFeatured 
} from '@/lib/competition-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { Competition } from '@/lib/types';
import { Trash2, Edit, PlusCircle, Search, Eye, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCompetitionsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [competitionSearchTerm, setCompetitionSearchTerm] = useState('');

  const competitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
  const { data: competitions, isLoading: isLoadingCompetitions } = useCollection<Competition>(competitionsQuery);

  const handleDeleteCompetition = async (id: string) => {
    if (!firestore) return;
    try {
        await deleteFirestoreCompetition(firestore, id);
        toast({ title: 'Success', description: 'Competition deleted.' });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Could not delete competition.', variant: 'destructive'});
    }
  };

  const handleToggleFeatured = async (id: string) => {
    if (!firestore || !competitions) return;
    const comp = competitions.find(c => c.id === id);
    if (!comp) return;

    try {
        await toggleFirestoreFeatured(firestore, id, !comp.featured);
        toast({ 
          title: 'Success', 
          description: `${comp.title} has been ${comp.featured ? 'un-featured' : 'featured'}.` 
        });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Could not update featured status.', variant: 'destructive'});
    }
  };

  const filteredCompetitions = useMemo(() => {
    if (!competitions) return [];
    if (!competitionSearchTerm) return competitions;
    return competitions.filter(comp => 
      comp.title.toLowerCase().includes(competitionSearchTerm.toLowerCase())
    );
  }, [competitions, competitionSearchTerm]);

  return (
     <div className="space-y-8">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold font-headline">จัดการแข่งขัน</h1>
                <p className="text-muted-foreground">สร้าง, แก้ไข, ลบ และเลือกการแข่งขันแนะนำ</p>
            </div>
            <div className='flex gap-2'>
                <Button asChild>
                    <Link href="/admin/competitions/new">
                        <PlusCircle className="mr-2" />
                        สร้างการแข่งขันใหม่
                    </Link>
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาการแข่งขัน..."
                        value={competitionSearchTerm}
                        onChange={(e) => setCompetitionSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    {isLoadingCompetitions ? (
                        Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[350px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                                <div className="flex items-center gap-2">
                                     <Skeleton className="h-8 w-8" />
                                     <Skeleton className="h-8 w-8" />
                                     <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))
                    ) : (
                    filteredCompetitions.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 border rounded-lg bg-card-foreground/5">
                        <div>
                            <p className="font-semibold">{comp.title}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <p>{new Date(comp.deadline).toLocaleDateString()}</p>
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    <span>{(comp.views || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(comp.id)} title="Toggle Featured">
                                <Star className={cn("h-4 w-4", comp.featured ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="Edit Competition">
                                <Link href={`/admin/competitions/edit/${comp.id}`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="Delete Competition">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this
                                        competition and remove its data from our servers.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCompetition(comp.id)}>
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>
                        </div>
                    ))
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}