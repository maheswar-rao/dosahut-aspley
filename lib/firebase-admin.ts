import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Transaction } from "firebase-admin/firestore";

function getAdminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export function getDb() {
  return getFirestore(getAdminApp());
}

const RATE_LIMIT_COLLECTION = "apiRateLimits";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const db = getDb();
  const ref = db.collection(RATE_LIMIT_COLLECTION).doc(key);
  const now = Date.now();

  return db.runTransaction(async (tx: Transaction) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { count: number; windowStart: number } | undefined;

    if (!data || now - data.windowStart > windowMs) {
      tx.set(ref, { count: 1, windowStart: now });
      return true;
    }
    if (data.count >= limit) {
      return false;
    }
    tx.update(ref, { count: FieldValue.increment(1) });
    return true;
  });
}