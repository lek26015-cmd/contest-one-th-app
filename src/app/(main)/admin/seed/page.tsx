'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { SEED_COMPETITIONS, SEED_BLOG_POSTS } from '@/lib/seed-content';
import { Loader2, Trash2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SeedPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>('');

    const handleSeed = async () => {
        if (!firestore) return;
        if (!confirm('คำเตือน: ข้อมูลการแข่งขันและบทความทั้งหมดจะถูกลบและสร้างใหม่ คุณแน่ใจหรือไม่?')) return;

        setIsLoading(true);
        setStatus('กำลังเริ่มต้น...');

        try {
            const batch = writeBatch(firestore);
            let operationCount = 0;

            // 1. Delete existing competitions
            setStatus('กำลังลบข้อมูลการแข่งขันเดิม...');
            const competitionsRef = collection(firestore, 'competitions');
            const existingCompetitions = await getDocs(competitionsRef);
            existingCompetitions.forEach((doc) => {
                batch.delete(doc.ref);
                operationCount++;
            });

            // 2. Delete existing blog posts
            setStatus('กำลังลบข้อมูลบทความเดิม...');
            const blogRef = collection(firestore, 'blog');
            const existingBlogPosts = await getDocs(blogRef);
            existingBlogPosts.forEach((doc) => {
                batch.delete(doc.ref);
                operationCount++;
            });

            // Commit deletions if too many (Firestore batch limit is 500)
            if (operationCount > 400) {
                await batch.commit();
                setStatus('ลบข้อมูลชุดแรกเสร็จสิ้น กำลังดำเนินการต่อ...');
                // Reset batch for additions (simplified logic, assuming not huge data)
                // In a real app with huge data, we'd need a new batch here.
                // But for this seed tool, we'll just assume we can do it in chunks or it's small enough.
                // For safety, let's just start a new batch for additions.
            }

            const addBatch = writeBatch(firestore);

            // 3. Add new competitions
            setStatus('กำลังสร้างข้อมูลการแข่งขันใหม่...');
            SEED_COMPETITIONS.forEach((comp) => {
                const newDocRef = doc(competitionsRef); // Auto-ID
                addBatch.set(newDocRef, { ...comp, id: newDocRef.id });
            });

            // 4. Add new blog posts
            setStatus('กำลังสร้างข้อมูลบทความใหม่...');
            SEED_BLOG_POSTS.forEach((post) => {
                const newDocRef = doc(blogRef); // Auto-ID
                addBatch.set(newDocRef, { ...post, id: newDocRef.id });
            });

            await addBatch.commit();

            setStatus('เสร็จสิ้น!');
            toast({
                title: 'รีเซ็ตข้อมูลสำเร็จ',
                description: 'ข้อมูลจำลองถูกสร้างใหม่เรียบร้อยแล้ว',
            });

        } catch (error) {
            console.error('Error seeding data:', error);
            setStatus('เกิดข้อผิดพลาด: ' + (error as Error).message);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถรีเซ็ตข้อมูลได้',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        จัดการข้อมูลจำลอง (Seed Data)
                    </CardTitle>
                    <CardDescription>
                        เครื่องมือสำหรับล้างข้อมูลเก่าและสร้างข้อมูลตัวอย่างใหม่สำหรับทดสอบระบบ
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">คำเตือนสำคัญ</h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        การดำเนินการนี้จะ <strong>ลบข้อมูลทั้งหมด</strong> ในคอลเลกชัน <code>competitions</code> และ <code>blog</code> อย่างถาวร
                                        และแทนที่ด้วยข้อมูลตัวอย่างชุดใหม่
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 py-6">
                        <Button
                            size="lg"
                            variant="destructive"
                            onClick={handleSeed}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    ลบและสร้างข้อมูลใหม่ (Reset DB)
                                </>
                            )}
                        </Button>
                        {status && (
                            <p className="text-sm text-muted-foreground animate-pulse">
                                สถานะ: {status}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
