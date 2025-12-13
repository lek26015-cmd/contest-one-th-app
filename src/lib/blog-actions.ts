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

type BlogPostInput = Omit<BlogPost, 'id' | 'slug' | 'date' | 'authorId' | 'authorName' | 'authorImageUrl' | 'views'>;

export async function createBlogPost(
  firestore: Firestore,
  user: User,
  data: BlogPostInput
) {
  const blogPostData = {
    ...data,
    slug: createSlug(data.title),
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
  if (data.title) {
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
