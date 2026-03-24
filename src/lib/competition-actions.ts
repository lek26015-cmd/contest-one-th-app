
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  Firestore,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  getDocs,
  writeBatch,
  getCountFromServer,
} from 'firebase/firestore';
import type { Competition, CompetitionCategory, ParticipantType } from './types';
import { CATEGORIES, PARTICIPANT_TYPES } from './types';

// --- QUERIES ---

export function getCompetitionsQuery(firestore: Firestore) {
  if (!firestore) return null;
  return query(collection(firestore, 'competitions'), orderBy('id', 'desc'));
}

export function getFeaturedCompetitionsQuery(firestore: Firestore) {
  if (!firestore) return null;
  const now = new Date().toISOString();
  return query(
    collection(firestore, 'competitions'),
    where('featured', '==', true),
    where('featuredUntil', '>=', now)
  );
}

export async function getCompetition(firestore: Firestore, id: string): Promise<Competition | null> {
  if (!firestore || !id) return null;
  const docRef = doc(firestore, 'competitions', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Competition;
  }
  return null;
}

export function getCompetitionQuery(firestore: Firestore, id: string) {
  if (!firestore || !id) return null;
  return doc(firestore, 'competitions', id);
}

export function getRelatedCompetitionsQuery(firestore: Firestore, category: string, currentId: string, queryLimit: number = 5) {
  if (!firestore) return null;
  return query(
    collection(firestore, 'competitions'),
    where('category', '==', category),
    where('id', '!=', currentId),
    limit(queryLimit)
  );
}

// --- MUTATIONS ---

type CompetitionInput = Omit<Competition, 'id' | 'views' | 'featured' | 'createdAt'>;

export async function addCompetition(
  firestore: Firestore,
  data: CompetitionInput
) {
  const newId = doc(collection(firestore, 'competitions')).id;
  const competitionRef = doc(firestore, 'competitions', newId);

  const competitionData = {
    ...data,
    id: newId,
    views: 0,
    featured: false,
    planLevel: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(competitionRef, competitionData);
  return newId;
}

export async function updateCompetition(
  firestore: Firestore,
  id: string,
  data: Partial<CompetitionInput>
) {
  const competitionRef = doc(firestore, 'competitions', id);
  await updateDoc(competitionRef, data);
}

export async function deleteCompetition(firestore: Firestore, id: string) {
  const competitionRef = doc(firestore, 'competitions', id);
  await deleteDoc(competitionRef);
}

export async function incrementCompetitionView(firestore: Firestore, id: string, source?: string) {
  if (!firestore || !id) return;
  const competitionRef = doc(firestore, 'competitions', id);
  try {
    const updateData: any = {
      views: increment(1)
    };
    if (source === 'featured') {
      updateData.featuredViews = increment(1);
    }
    await updateDoc(competitionRef, updateData);
  } catch (error) {
    console.warn(`Could not increment view count for competition ${id}:`, error);
  }
}

export async function toggleFeatured(firestore: Firestore, id: string, newStatus: boolean) {
  const competitionRef = doc(firestore, 'competitions', id);
  await updateDoc(competitionRef, { featured: newStatus });
}

export async function toggleApplicationEnabled(firestore: Firestore, id: string, newStatus: boolean) {
  if (!firestore || !id) return;
  const competitionRef = doc(firestore, 'competitions', id);
  await updateDoc(competitionRef, { isApplicationEnabled: newStatus });
}


// --- SEEDING ---

const MOCK_COMPETITIONS_TEMPLATES = [
  {
    title: "ประกวดออกแบบโลโก้ 'GreenTech'",
    description: "ร่วมออกแบบโลโก้สำหรับบริษัทเทคโนโลยีสีเขียวแห่งอนาคต ชิงเงินรางวัลและโอกาสร่วมงานกับเรา",
    prizes: ["เงินรางวัล 50,000 บาท", "โอกาสฝึกงานกับ GreenTech", "ใบประกาศเกียรติคุณ"],
    totalPrize: 50000,
    rules: "ส่งผลงานในรูปแบบไฟล์ AI และ PNG พร้อมอธิบายแนวคิดในการออกแบบ",
    category: "Design" as CompetitionCategory,
  },
  {
    title: "Hackathon 'Smart City Challenge'",
    description: "แข่งขันพัฒนาเว็บแอปพลิเคชันเพื่อแก้ปัญหาเมืองอัจฉริยะภายใน 48 ชั่วโมง",
    prizes: ["เงินรางวัลรวม 200,000 บาท", "สนับสนุนโปรเจกต์ต่อยอด", "ตั๋วเข้าร่วมงาน Tech Summit 2024"],
    totalPrize: 200000,
    rules: "ทีมละ 3-5 คน พัฒนาด้วยเทคโนโลยีใดก็ได้ แต่ต้องสามารถใช้งานได้จริง",
    category: "Hackathon" as CompetitionCategory,
  },
  {
    title: "ประกวดภาพถ่าย 'Street Life Bangkok'",
    description: "ถ่ายทอดมุมมองชีวิตคนเมืองในกรุงเทพฯ ผ่านเลนส์กล้องของคุณ",
    prizes: ["กล้อง Sony Alpha A7 IV", "เงินรางวัล 10,000 บาท", "จัดแสดงผลงานที่ BACC"],
    totalPrize: 85000,
    rules: "ภาพถ่ายต้องถ่ายในกรุงเทพฯ ไม่จำกัดเทคนิค ห้ามตัดต่อเกินจริง",
    category: "Photography" as CompetitionCategory,
  },
  {
    title: "Short Film Contest 'Dream Big'",
    description: "ประกวดหนังสั้นความยาวไม่เกิน 5 นาที ในหัวข้อ 'ความฝันที่ยิ่งใหญ่'",
    prizes: ["เงินรางวัล 100,000 บาท", "ทุนการศึกษาด้านภาพยนตร์", "ถ้วยรางวัลเกียรติยศ"],
    totalPrize: 100000,
    rules: "ความยาว 3-5 นาที ต้องมีซับไตเติ้ลภาษาอังกฤษ",
    category: "Film" as CompetitionCategory,
  },
  {
    title: "Music Band Battle 2024",
    description: "เวทีประชันวงดนตรีหน้าใหม่ เฟ้นหาสุดยอดวงดนตรีแห่งปี",
    prizes: ["เซ็นสัญญากับค่ายเพลงดัง", "เงินรางวัล 50,000 บาท", "เครื่องดนตรีครบวง"],
    totalPrize: 50000,
    rules: "สมาชิกในวงไม่เกิน 7 คน เล่นดนตรีสด เพลงแต่งเอง 1 เพลง",
    category: "Music" as CompetitionCategory,
  },
  {
    title: "Startup Pitching Day",
    description: "นำเสนอไอเดียธุรกิจสตาร์ทอัพต่อหน้านักลงทุนระดับประเทศ",
    prizes: ["เงินลงทุน Pre-Seed 500,000 บาท", "พื้นที่ Co-working Space ฟรี 1 ปี"],
    totalPrize: 500000,
    rules: "มี Prototype หรือ MVP แล้ว นำเสนอ 5 นาที ถาม-ตอบ 5 นาที",
    category: "Pitching" as CompetitionCategory,
  },
  {
    title: "Digital Art Exhibition",
    description: "ประกวดศิลปะดิจิทัล ภายใต้หัวข้อ 'Cyberpunk Thailand'",
    prizes: ["Wacom Cintiq Pro 16", "เงินรางวัล 20,000 บาท"],
    totalPrize: 60000,
    rules: "ไฟล์ภาพความละเอียดสูง 300dpi ไม่จำกัดโปรแกรมที่ใช้",
    category: "Art" as CompetitionCategory,
  },
];

export async function seedInitialCompetitions(firestore: Firestore, userId: string) {
  if (!firestore || !userId) return;

  const coll = collection(firestore, 'competitions');
  const snapshot = await getCountFromServer(coll);

  if (snapshot.data().count > 0) {
    console.log("Competitions collection is not empty. Skipping seed.");
    return;
  }

  const batch = writeBatch(firestore);
  const prizeValues = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 0, 5000, 120000];

  for (let i = 0; i < 20; i++) {
    const mockIndex = i % MOCK_COMPETITIONS_TEMPLATES.length;
    const baseComp = MOCK_COMPETITIONS_TEMPLATES[mockIndex];
    const newId = doc(collection(firestore, 'competitions')).id;
    const competitionRef = doc(firestore, 'competitions', newId);

    const newCompetition: Competition = {
      id: newId,
      ...baseComp,
      title: `${baseComp.title} #${i + 1}`,
      totalPrize: prizeValues[i % prizeValues.length],
      deadline: new Date(Date.now() + (i + 1) * 2 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: `https://picsum.photos/seed/${i + 1}/600/800`,
      category: CATEGORIES[i % CATEGORIES.length],
      participantType: [PARTICIPANT_TYPES[i % PARTICIPANT_TYPES.length]],
      views: Math.floor(Math.random() * 5000) + 100,
      featured: i < 3,
      rulesUrls: ['https://example.com/rules.pdf'],
      socialUrls: ['https://twitter.com/example'],
      // @ts-ignore
      createdAt: serverTimestamp(),
      userId: userId, // Add userId
    };
    batch.set(competitionRef, newCompetition);
  }

  await batch.commit();
  console.log("Seeded 20 mock competitions into Firestore.");
}

