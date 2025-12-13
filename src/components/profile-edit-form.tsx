
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { useTransition } from 'react';
import { updatePassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { updateUserProfile } from '@/app/actions';


const profileSchema = z.object({
  displayName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && data.newPassword.length < 6) return false;
    return true;
}, {
    message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
    path: ['newPassword'],
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileEditFormProps = {
  user: User;
  onSave: () => void;
};

export default function ProfileEditForm({ user, onSave }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || '',
      email: user.email || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (!auth?.currentUser) {
        toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
        return;
    }
    startTransition(async () => {
      try {
        let profileUpdated = false;
        let passwordUpdated = false;
        
        // --- Update Profile Name (via Server Action) ---
        if (data.displayName !== user.displayName) {
          const result = await updateUserProfile(auth.currentUser!.uid, { displayName: data.displayName });
          if (!result.success) {
            throw new Error(result.error || 'Failed to update profile name.');
          }
          await auth.currentUser.reload(); // Reload user to get latest profile
          profileUpdated = true;
        }
        
        // --- Update Password ---
        if (data.newPassword) {
            await updatePassword(auth.currentUser, data.newPassword);
            passwordUpdated = true;
        }

        if (profileUpdated || passwordUpdated) {
            toast({
              title: 'สำเร็จ!',
              description: 'โปรไฟล์ของคุณถูกอัปเดตเรียบร้อยแล้ว',
            });
            onSave(); // Close the sheet
        } else {
            onSave(); // Close sheet if nothing changed
        }

      } catch (error: any) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">ชื่อที่แสดง</Label>
        <Input
          id="displayName"
          {...register('displayName')}
          placeholder="ชื่อของคุณ"
        />
        {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="อีเมลของคุณ"
          disabled // Email update is more complex, disable for now
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        <p className="text-xs text-muted-foreground">
          การเปลี่ยนอีเมลจำเป็นต้องมีการยืนยันตัวตนเพิ่มเติม (ยังไม่รองรับในขณะนี้)
        </p>
      </div>

       <div className="space-y-2 border-t pt-6">
        <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
        <Input
          id="newPassword"
          type="password"
          {...register('newPassword')}
          placeholder="ปล่อยว่างไว้หากไม่ต้องการเปลี่ยน"
        />
        {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
      </div>
       <div className="space-y-2">
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isPending || !isDirty} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        บันทึกการเปลี่ยนแปลง
      </Button>
    </form>
  );
}
