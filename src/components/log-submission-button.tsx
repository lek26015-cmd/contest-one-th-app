'use client'

import { useState } from 'react';
import { Button } from './ui/button';
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
import { Send } from 'lucide-react';
import type { Competition } from '@/lib/types';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


interface LogSubmissionButtonProps {
    competition: Competition;
    user: User;
}

export default function LogSubmissionButton({ competition, user }: LogSubmissionButtonProps) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        if (!firestore) {
            toast({ title: 'Error', description: 'Firestore not available', variant: 'destructive' });
            setIsSubmitting(false);
            return;
        }

        const submissionData = {
            userId: user.uid,
            competitionId: competition.id,
            submissionDetails: `Logged submission for ${competition.title}`, // Placeholder details
            submissionDate: serverTimestamp(),
        };

        try {
            await addDoc(collection(firestore, 'submissions'), submissionData);
            toast({
                title: 'บันทึกประวัติสำเร็จ!',
                description: `ระบบได้บันทึกว่าคุณได้สมัครแข่งขัน "${competition.title}" เรียบร้อยแล้ว`,
            });
            router.refresh();
        } catch (error) {
            console.error('Submission log error:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถบันทึกประวัติได้ กรุณาลองใหม่อีกครั้ง',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    บันทึกการสมัคร
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการบันทึกประวัติ</AlertDialogTitle>
                    <AlertDialogDescription>
                        คุณได้สมัครเข้าร่วมการแข่งขัน "{competition.title}" แล้วใช่หรือไม่?
                        หากใช่ ระบบจะบันทึกการแข่งขันนี้ลงใน 'ประวัติการส่งผลงาน' ของคุณ
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังบันทึก...' : 'ใช่, บันทึกเลย'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
