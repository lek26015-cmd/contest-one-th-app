
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
  participantType: z.array(z.enum(PARTICIPANT_TYPES)).min(1, 'ต้องเลือกประเภทผู้เข้าแข่งขันอย่างน้อย 1 ประเภท'),
  deadline: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  imageUrl: z.string().optional().or(z.literal('')),
  rulesUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL กติกาที่ถูกต้อง' }).optional().or(z.literal('')) })).transform(arr => arr.map(item => item.value).filter((v): v is string => !!v)),
  socialUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL โซเชียลที่ถูกต้อง' }).optional().or(z.literal('')) })).transform(arr => arr.map(item => item.value).filter((v): v is string => !!v)),
  featured: z.boolean().optional(),
  featuredUntil: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
});

export type FormState = {
  message: string;
  errors?: Record<string, string[]>;
  success: boolean;
};

export async function submitCompetition(prevState: FormState, formData: FormData) {

  const rulesUrls = formData.getAll('rulesUrls').map(url => ({ value: url }));
  const socialUrls = formData.getAll('socialUrls').map(url => ({ value: url }));
  // Extract all selected participant types
  const participantTypes = formData.getAll('participantType');

  const rawData: any = {
    title: formData.get('title'),
    description: formData.get('description'),
    prizes: formData.get('prizes'),
    totalPrize: formData.get('totalPrize'),
    rules: formData.get('rules'),
    category: formData.get('category'),
    participantType: participantTypes, // Use the array
    deadline: formData.get('deadline'),
    imageUrl: formData.get('imageUrl'),
    rulesUrls: rulesUrls,
    socialUrls: socialUrls,
    featured: formData.get('featured') === 'true',
    featuredUntil: formData.get('featuredUntil'),
  };

  const id = formData.get('id') as string | null;
  const mode = formData.get('mode') as 'create' | 'edit';

  const validatedFields = competitionFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { prizes, totalPrize, rulesUrls: validatedRulesUrls, socialUrls: validatedSocialUrls, ...rest } = validatedFields.data;

  const competitionData = {
    ...rest,
    totalPrize: totalPrize || 0,
    rulesUrls: validatedRulesUrls,
    socialUrls: validatedSocialUrls,
    deadline: new Date(rest.deadline).toISOString(),
    featuredUntil: rest.featuredUntil ? new Date(rest.featuredUntil).toISOString() : undefined,
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
