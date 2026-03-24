
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Bookmark, History, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProfileEditForm from '@/components/profile-edit-form';
import { getSavedCompetitionsQuery } from '@/lib/user-actions';
import { getCompetitionsQuery } from '@/lib/competition-actions';
import { getSubmissionsFromD1 } from '@/lib/d1-actions';
import { Submission, Competition, SavedCompetition } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Timestamp } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // --- Submissions Data ---
  useEffect(() => {
    async function loadSubmissions() {
      if (!user) return;
      setIsLoadingSubmissions(true);
      try {
        const subs = await getSubmissionsFromD1({ userId: user.uid });
        setSubmissions(subs);
      } catch (error) {
        console.error("Error loading submissions:", error);
      } finally {
        setIsLoadingSubmissions(false);
      }
    }
    if (user) loadSubmissions();
  }, [user]);

  const allCompetitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
  const { data: allCompetitions, isLoading: isLoadingAllCompetitions } = useCollection<Competition>(allCompetitionsQuery);

  const submissionHistory = useMemo(() => {
    if (!submissions || !allCompetitions) return [];

    const processedSubmissions = submissions.map(sub => {
      const competition = allCompetitions.find(c => c.id === sub.competitionId);

      let submissionDate: Date;
      if (sub.submissionDate instanceof Timestamp) {
        submissionDate = sub.submissionDate.toDate();
      } else if (sub.createdAt) {
          submissionDate = new Date(sub.createdAt);
      } else {
        submissionDate = new Date(sub.submissionDate as string);
      }

      return {
        ...sub,
        competitionTitle: competition?.title || sub.competitionTitle || 'Unknown Competition',
        competitionImageUrl: competition?.imageUrl || sub.competitionImageUrl,
        submissionDate: submissionDate
      };
    });

    return processedSubmissions.sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());

  }, [submissions, allCompetitions]);


  // --- Saved Competitions Data ---
  const savedCompetitionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return getSavedCompetitionsQuery(firestore, user.uid);
  }, [user, firestore]);

  const { data: savedCompetitionRefs, isLoading: isLoadingSaved } = useCollection<SavedCompetition>(savedCompetitionsQuery);

  const savedCompetitions = useMemo(() => {
    if (!savedCompetitionRefs || !allCompetitions) return [];
    return savedCompetitionRefs
      .map(ref => allCompetitions.find(c => c.id === ref.competitionId))
      .filter((c): c is Competition => c !== undefined);
  }, [savedCompetitionRefs, allCompetitions]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (user.isAnonymous) return 'A';
    return name?.charAt(0) || email?.charAt(0) || 'U';
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
          <AvatarFallback className="text-3xl">
            {getInitials(user.displayName, user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-3xl font-bold font-headline text-primary">
            {user.isAnonymous ? 'Anonymous User' : user.displayName || user.email || 'Welcome!'}
          </h1>
          <p className="text-muted-foreground">{!user.isAnonymous && user.email}</p>
          <div className="mt-4 flex justify-center gap-2 sm:justify-start">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>แก้ไขโปรไฟล์</SheetTitle>
                </SheetHeader>
                <ProfileEditForm user={user} onSave={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>

            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="saved" className="mt-12 w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved">
            <Bookmark className="mr-2" />
            การแข่งขันที่บันทึกไว้
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2" />
            ประวัติการส่งผลงาน
          </TabsTrigger>
        </TabsList>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>การแข่งขันที่บันทึกไว้</CardTitle>
              <CardDescription>การแข่งขันที่คุณสนใจและบันทึกไว้เพื่อดูในภายหลัง</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSaved || isLoadingAllCompetitions ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : savedCompetitions.length > 0 ? (
                <div className="space-y-4">
                  {savedCompetitions.map(comp => (
                    <Link href={`/competitions/${comp.id}`} key={comp.id} className="block group">
                      <div className="p-4 border rounded-lg flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          {comp.imageUrl ? (
                            <Image src={comp.imageUrl} alt={comp.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted"></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold group-hover:text-primary">{comp.title}</p>
                          <p className="text-sm text-muted-foreground">
                            ปิดรับสมัคร: {formatDate(comp.deadline, 'd MMMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex h-60 items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <p className="font-semibold">ยังไม่มีการแข่งขันที่บันทึกไว้</p>
                    <p className="text-sm">คุณสามารถบันทึกการแข่งขันที่สนใจได้โดยกดปุ่ม "บันทึก"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการส่งผลงาน</CardTitle>
              <CardDescription>รายการผลงานที่คุณเคยส่งเข้าประกวด</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubmissions || isLoadingAllCompetitions ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : submissionHistory.length > 0 ? (
                <div className="space-y-4">
                  {submissionHistory.map(sub => (
                    <Link href={`/competitions/${sub.competitionId}`} key={sub.id} className="block group">
                      <div className="p-4 border rounded-lg flex items-start gap-4 hover:bg-muted/50 transition-colors">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          {sub.competitionImageUrl ? (
                            <Image src={sub.competitionImageUrl} alt={sub.competitionTitle} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted"></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold group-hover:text-primary">{sub.competitionTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            ส่งเมื่อ: {format(sub.submissionDate, 'd MMMM yyyy, HH:mm', { locale: th })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex h-60 items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <p className="font-semibold">ยังไม่มีประวัติการส่งผลงาน</p>
                    <p className="text-sm">คุณยังไม่เคยส่งใบสมัครเข้าร่วมการแข่งขันใดๆ</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
