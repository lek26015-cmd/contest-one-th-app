
'use server';

import { z } from 'zod';
import { CATEGORIES, PARTICIPANT_TYPES } from '@/lib/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { addCompetition, updateCompetition as updateFirestoreCompetition } from '@/lib/competition-actions';

const competitionFormSchema = z.object({
  title: z.string().min(5, 'ชื่อเรื่องต้องมีอย่างน้อย 5 ตัวอักษร'),
  description: z.string().min(20, 'รายละเอียดต้องมีอย่างน้อย 20 ตัวอักษร'),
  prizes: z.string().min(1, 'ส่วนรางวัลต้องไม่ว่างเปล่า'),
  totalPrize: z.coerce.number().min(0, 'รางวัลรวมต้องเป็นค่าบวก').optional(),
  rules: z.string().min(20, 'กติกาต้องมีอย่างน้อย 20 ตัวอักษร'),
  category: z.enum(CATEGORIES),
  participantType: z.enum(PARTICIPANT_TYPES),
  deadline: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  imageUrl: z.string().optional().or(z.literal('')),
  rulesUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL กติกาที่ถูกต้อง' }).optional().or(z.literal('')) })).transform(arr => arr.map(item => item.value).filter(Boolean)),
  socialUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL โซเชียลที่ถูกต้อง' }).optional().or(z.literal('')) })).transform(arr => arr.map(item => item.value).filter(Boolean)),
});

export type FormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof competitionFormSchema>>['formErrors']['fieldErrors'];
  success: boolean;
};

export async function submitCompetition(prevState: FormState, formData: FormData) {
  
  const rulesUrls = formData.getAll('rulesUrls').map(value => ({ value }));
  const socialUrls = formData.getAll('socialUrls').map(value => ({ value }));

  const rawData: any = {
    title: formData.get('title'),
    description: formData.get('description'),
    prizes: formData.get('prizes'),
    totalPrize: formData.get('totalPrize'),
    rules: formData.get('rules'),
    category: formData.get('category'),
    participantType: formData.get('participantType'),
    deadline: formData.get('deadline'),
    imageUrl: formData.get('imageUrl'),
    rulesUrls: rulesUrls,
    socialUrls: socialUrls,
  };

  const id = formData.get('id') as string | null;
  const mode = formData.get('mode') as 'create' | 'edit';
  
  const validatedFields = competitionFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'ส่งการแข่งขันไม่สำเร็จ กรุณาตรวจสอบข้อผิดพลาด',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { prizes, ...rest } = validatedFields.data;
  
  const competitionData = {
    ...rest,
    deadline: new Date(rest.deadline).toISOString(),
    prizes: prizes.split('\n').filter(p => p.trim() !== ''),
  };
  
  const { firestore } = initializeFirebase();

  try {
    if (mode === 'edit' && id) {
      await updateFirestoreCompetition(firestore, id, competitionData);
    } else {
      await addCompetition(firestore, competitionData);
    }
  } catch (error: any) {
    console.error("Firestore operation failed: ", error);
    return {
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      success: false,
    };
  }

  revalidatePath('/');
  revalidatePath('/admin/competitions');
  if (id) {
    revalidatePath(`/competitions/${id}`);
  }
  
  return { 
    message: mode === 'edit' ? 'บันทึกการเปลี่ยนแปลงสำเร็จ!' : 'ส่งการแข่งขันสำเร็จ!',
    success: true,
  };
}

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string }
) {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Server actions should initialize their own services
  const { firestore } = initializeFirebase();
  const userDocRef = doc(firestore, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      profileName: data.displayName,
      username: data.displayName, // Also update username for consistency
    });
    revalidatePath('/profile');
    return { success: true, message: 'อัปเดตโปรไฟล์สำเร็จ!' };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}
