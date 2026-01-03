import {
  collection,
  query,
  orderBy,
  limit,
  Firestore,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  where,
  getDocs,
  increment,
  getCountFromServer,
  writeBatch,
} from 'firebase/firestore';
import type { BlogPost } from './types';
import type { User } from 'firebase/auth';

// Regular expression to remove leading and trailing spaces, and replace multiple spaces with a single one.
const REGEX_SPACES = /^\s+|\s+$/g;
const REGEX_MULTIPLE_SPACES = /\s+/g;

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(REGEX_SPACES, '')
    .replace(REGEX_MULTIPLE_SPACES, '-')
    .replace(/[^a-z0-9-]/g, '');
}


// --- QUERIES ---

export function getBlogPostsQuery(firestore: Firestore) {
  if (!firestore) return null;
  return query(collection(firestore, 'blog'), orderBy('date', 'desc'));
}

export function getBlogPostQuery(firestore: Firestore, id: string) {
  if (!firestore) return null;
  return doc(firestore, 'blog', id);
}

export async function getBlogPostBySlug(firestore: Firestore, slug: string): Promise<BlogPost | null> {
  const q = query(collection(firestore, 'blog'), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as BlogPost;
}


// --- MUTATIONS ---

type BlogPostInput = Omit<BlogPost, 'id' | 'date' | 'authorId' | 'authorName' | 'authorImageUrl' | 'views'>;

export async function createBlogPost(
  firestore: Firestore,
  user: User,
  data: BlogPostInput
) {
  const blogPostData = {
    ...data,
    slug: data.slug || createSlug(data.title),
    date: serverTimestamp(),
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    authorImageUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
    views: 0,
  };

  const ref = await addDoc(collection(firestore, 'blog'), blogPostData);
  return ref.id;
}

export async function updateBlogPost(
  firestore: Firestore,
  id: string,
  data: Partial<BlogPostInput>
) {
  const blogPostRef = doc(firestore, 'blog', id);

  const updateData: any = { ...data };
  if (data.slug) {
    updateData.slug = data.slug;
  } else if (data.title && !data.slug) {
    // Only auto-generate slug if title changed AND no slug provided (though usually slug is provided in edit)
    // Ideally, we keep the old slug unless explicitly changed. 
    // But here we'll rely on the form passing the existing slug if not changed.
    // If data.slug is undefined, it means we might not want to update it, or we want to regen.
    // Let's assume if title changes and slug is NOT passed, we regen. 
    updateData.slug = createSlug(data.title);
  }

  await updateDoc(blogPostRef, updateData);
}

export async function deleteBlogPost(firestore: Firestore, id: string) {
  const blogPostRef = doc(firestore, 'blog', id);
  await deleteDoc(blogPostRef);
}

export async function incrementBlogPostView(firestore: Firestore, id: string) {
  if (!firestore || !id) return;
  const blogPostRef = doc(firestore, 'blog', id);
  try {
    await updateDoc(blogPostRef, {
      views: increment(1)
    });
  } catch (error) {
    // We can ignore this error if the document doesn't exist yet,
    // or if the user doesn't have permissions. It's not critical.
    console.warn(`Could not increment view count for blog post ${id}:`, error);
  }
}

// --- SEEDING ---

const MOCK_BLOG_POSTS_TEMPLATES = [
  {
    title: "5 เทคนิคพิชิตใจกรรมการในงาน Hackathon",
    excerpt: "รวมเคล็ดลับจากผู้ชนะ Hackathon ระดับประเทศ ที่จะช่วยให้ทีมของคุณโดดเด่นกว่าใคร",
    content: "การแข่งขัน Hackathon ไม่ใช่แค่เรื่องของการเขียนโค้ดให้เสร็จทันเวลา แต่ยังรวมถึงการนำเสนอไอเดีย การทำงานเป็นทีม และการแก้ปัญหาที่ตรงจุด... (เนื้อหาจำลอง)",
    category: "เคล็ดลับ" as const,
    tags: ["Hackathon", "Tips", "Presentation"],
  },
  {
    title: "เจาะลึกเทรนด์การออกแบบปี 2024",
    excerpt: "อัปเดตเทรนด์ Design มาแรงที่นักออกแบบต้องรู้ เพื่อสร้างสรรค์ผลงานให้ทันสมัย",
    content: "ในปี 2024 เทรนด์การออกแบบจะมุ่งเน้นไปที่ความยั่งยืน (Sustainability) และการผสมผสานระหว่างโลกจริงกับโลกเสมือน... (เนื้อหาจำลอง)",
    category: "ออกแบบ" as const,
    tags: ["Design", "Trends", "2024"],
  },
  {
    title: "สัมภาษณ์พิเศษ: เส้นทางสู่การเป็น Unicorn ของ Startup ไทย",
    excerpt: "บทสัมภาษณ์ CEO ของ Startup ระดับ Unicorn รายล่าสุดของไทย กับเบื้องหลังความสำเร็จที่ไม่สวยหรู",
    content: "วันนี้เราได้รับเกียรติจากคุณ... CEO ผู้ก่อตั้ง... มาเล่าถึงประสบการณ์การฝ่าฟันอุปสรรค... (เนื้อหาจำลอง)",
    category: "งานเขียน" as const,
    tags: ["Startup", "Interview", "Success Story"],
  },
  {
    title: "เริ่มต้นเขียนโปรแกรมภาษาอะไรดี? คู่มือสำหรับมือใหม่",
    excerpt: "เปรียบเทียบภาษาโปรแกรมยอดฮิต Python, JavaScript, Go ภาษาไหนเหมาะกับงานแบบไหน",
    content: "สำหรับผู้ที่สนใจเริ่มต้นสายงาน Developer คำถามแรกที่มักจะเกิดขึ้นคือ 'เริ่มเรียนภาษาอะไรดี?'... (เนื้อหาจำลอง)",
    category: "พัฒนา" as const,
    tags: ["Programming", "Beginner", "Coding"],
  },
];

export async function seedInitialBlogPosts(firestore: Firestore) {
  if (!firestore) return;

  const coll = collection(firestore, 'blog');
  const snapshot = await getCountFromServer(coll);

  if (snapshot.data().count > 0) {
    console.log("Blog posts collection is not empty. Skipping seed.");
    return;
  }

  const batch = writeBatch(firestore);

  for (let i = 0; i < 10; i++) {
    const mockIndex = i % MOCK_BLOG_POSTS_TEMPLATES.length;
    const basePost = MOCK_BLOG_POSTS_TEMPLATES[mockIndex];
    const newId = doc(collection(firestore, 'blog')).id;
    const postRef = doc(firestore, 'blog', newId);

    const newPost: BlogPost = {
      id: newId,
      ...basePost,
      title: `${basePost.title} #${i + 1}`,
      slug: createSlug(`${basePost.title} ${i + 1}`),
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Past dates
      authorId: 'system-seed',
      authorName: 'ContestOne Team',
      authorImageUrl: `https://ui-avatars.com/api/?name=ContestOne+Team&background=0D8ABC&color=fff`,
      imageUrl: `https://picsum.photos/seed/blog${i + 1}/800/600`,
      views: Math.floor(Math.random() * 2000) + 50,
      metaTitle: `${basePost.title} - ContestOne`,
      metaDescription: basePost.excerpt,
    };
    // @ts-ignore
    newPost.date = serverTimestamp(); // Use server timestamp for consistency

    batch.set(postRef, newPost);
  }

  await batch.commit();
  console.log("Seeded 10 mock blog posts into Firestore.");
}
