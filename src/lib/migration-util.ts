/**
 * Data Migration Script: Firebase Firestore -> Cloudflare D1
 * 
 * This script provides functions to fetch data from Firestore and 
 * generate SQL INSERT statements for D1.
 */

import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Note: You need to provide your Firebase config and run this in an environment
// with access to both Firebase and a way to execute WRANGLER commands.

export async function migrateHeroAds(firebaseConfig: any) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const snapshot = await getDocs(collection(db, 'hero_ads'));
  const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log("-- Migration SQL for Hero Ads");
  ads.forEach((ad: any) => {
    console.log(`INSERT INTO hero_ads (id, title, imageUrl, linkUrl, sort_order, active) VALUES ('${ad.id}', '${ad.title}', '${ad.imageUrl}', '${ad.linkUrl}', ${ad.order || 0}, ${ad.active ? 1 : 0});`);
  });
}

export async function migrateBlogPosts(firebaseConfig: any) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const snapshot = await getDocs(collection(db, 'blog'));
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log("-- Migration SQL for Blog Posts");
  posts.forEach((post: any) => {
    const tags = JSON.stringify(post.tags || []);
    console.log(`INSERT INTO blog_posts (id, slug, title, excerpt, content, imageUrl, authorName, authorImageUrl, authorId, category, tags, views) VALUES ('${post.id}', '${post.slug}', '${post.title}', '${post.excerpt || ''}', '${post.content}', '${post.imageUrl}', '${post.authorName}', '${post.authorImageUrl}', '${post.authorId}', '${post.category}', '${tags}', ${post.views || 0});`);
  });
}
