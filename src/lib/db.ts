import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Show } from '@/types';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Get all shows for an artist
export async function getShows(artistId: string): Promise<Show[]> {
  const showsRef = collection(db, 'shows');
  const q = query(
    showsRef,
    where('artistId', '==', artistId)
  );
  
  const snapshot = await getDocs(q);
  
  const shows = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: timestampToDate(data.date),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Show;
  });

  // Sort by date in JavaScript instead of Firestore
  return shows.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Add a new show
export async function addShow(show: Omit<Show, 'id'>): Promise<string> {
  const showsRef = collection(db, 'shows');
  const docRef = await addDoc(showsRef, {
    ...show,
    date: Timestamp.fromDate(show.date),
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
}

// Upload a file to Firebase Storage
export async function uploadFile(
  file: File,
  showId: string,
  orgId: string
): Promise<string> {
  const filePath = `organizations/${orgId}/shows/${showId}/${file.name}`;
  const fileRef = ref(storage, filePath);
  
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  
  return downloadURL;
}