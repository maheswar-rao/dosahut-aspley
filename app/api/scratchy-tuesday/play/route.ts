import { NextResponse } from "next/server";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { checkRateLimit, getDb } from "@/lib/firebase-admin";
import {
  SCRATCHY_TUESDAY_LOSE_MESSAGE,
  SCRATCHY_TUESDAY_LOSE_WEIGHT,
  SCRATCHY_TUESDAY_REWARDS,
} from "@/lib/site";
import {
  buildShuffledBatch,
  EMAIL_REGEX,
  getBrisbaneDateKey,
  isValidAuMobileNormalized,
  normalizePhone,
  type ScratchOutcome,
} from "@/lib/scratchy-tuesday";

type PlayRequestBody = {
  name?: string;
  whatsapp?: string;
  suburb?: string;
  email?: string;
  termsAccepted?: boolean;
};

const ENTRIES_COLLECTION = "scratchyTuesdayEntries";
// A single document holding where we're up to in the current 100-card
// shuffled deck — see lib/scratchy-tuesday.ts for why a deck instead of a
// plain weighted roll. The deck itself lives in its own field so a plain
// play only ever has to touch the small `cursor`/`batchNumber` fields (see
// the transaction below) instead of rewriting the whole 100-entry array.
const BATCH_DOC_PATH = "scratchyTuesdayState/rewardBatch";

// Generous but real: this exists to stop a script from draining the reward
// deck with fake phone numbers, not to throttle genuine dine-in traffic —
// a busy Tuesday service handing out QR codes at once is nowhere near this.
const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type BatchState = { deck: ScratchOutcome[]; cursor: number; batchNumber: number };

function isValidOutcome(value: unknown): value is ScratchOutcome {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ScratchOutcome).label === "string" &&
    typeof (value as ScratchOutcome).isWin === "boolean"
  );
}

export async function POST(request: Request) {
  let body: PlayRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const whatsapp = body.whatsapp?.trim();
  const suburb = body.suburb?.trim();
  const email = body.email?.trim();
  const termsAccepted = body.termsAccepted === true;

  if (!name || !whatsapp || !suburb || !email) {
    return NextResponse.json(
      { error: "Name, WhatsApp number, suburb and email are all required." },
      { status: 400 },
    );
  }
  if (name.length > 100 || suburb.length > 100 || whatsapp.length > 30) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }
  if (email.length > 200 || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!termsAccepted) {
    return NextResponse.json(
      { error: "Please agree to the Terms & Conditions and Privacy Policy to continue." },
      { status: 400 },
    );
  }

  // Scratchy Tuesday is a dine-in promotion for this one Sunshine Coast
  // restaurant — an Australian mobile number (04XX XXX XXX) is required,
  // not just any digit string, matching the client's own +61-prefixed input.
  const phoneKey = normalizePhone(whatsapp);
  if (!isValidAuMobileNormalized(phoneKey)) {
    return NextResponse.json(
      { error: "Please enter a valid Australian mobile number." },
      { status: 400 },
    );
  }

  // Best-effort caller identity for rate limiting — not authentication, just
  // enough to stop a single script from hammering the endpoint with fake
  // numbers. x-forwarded-for can be spoofed by a direct client, but Vercel
  // overwrites it with the real edge-observed IP for requests that reach the
  // function, so this is reliable for traffic actually hitting production.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const withinLimit = await checkRateLimit(
    `scratchy-tuesday:${ip}`,
    RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many attempts — please try again later." },
      { status: 429 },
    );
  }

  const dateKey = getBrisbaneDateKey();
  const entryId = `${phoneKey}_${dateKey}`;
  const db = getDb();
  const entryRef = db.collection(ENTRIES_COLLECTION).doc(entryId);
  const batchRef = db.doc(BATCH_DOC_PATH);

  try {
    // A single transaction covers both the "already played today" check and
    // drawing the next card from the batch deck, so two near-simultaneous
    // requests for the same phone number can't both draw a card, and a draw
    // can't happen without the entry that records it.
    const result = await db.runTransaction(async (tx: Transaction) => {
      const [entrySnap, batchSnap] = await Promise.all([tx.get(entryRef), tx.get(batchRef)]);

      if (entrySnap.exists) {
        const outcome = entrySnap.data()!.outcome;
        if (!isValidOutcome(outcome)) {
          throw new Error(`Corrupt entry document: ${entryRef.path}`);
        }
        return { alreadyPlayed: true, outcome };
      }

      const batch = batchSnap.data() as BatchState | undefined;
      if (!batch || batch.cursor >= batch.deck.length) {
        // Only the 1-in-100 request that exhausts (or starts) the deck pays
        // the cost of writing the full 100-entry array — every other play
        // below only touches the small cursor field.
        const freshBatch: BatchState = {
          deck: buildShuffledBatch(
            SCRATCHY_TUESDAY_REWARDS,
            SCRATCHY_TUESDAY_LOSE_WEIGHT,
            SCRATCHY_TUESDAY_LOSE_MESSAGE,
          ),
          cursor: 1,
          batchNumber: (batch?.batchNumber ?? 0) + 1,
        };
        const outcome = freshBatch.deck[0];
        tx.set(batchRef, freshBatch);
        tx.set(entryRef, {
          name,
          whatsapp,
          suburb,
          email,
          termsAccepted,
          outcome,
          dateKey,
          batchNumber: freshBatch.batchNumber,
          createdAt: FieldValue.serverTimestamp(),
        });
        return { alreadyPlayed: false, outcome };
      }

      const outcome = batch.deck[batch.cursor];
      tx.update(batchRef, { cursor: FieldValue.increment(1) });
      tx.set(entryRef, {
        name,
        whatsapp,
        suburb,
        email,
        termsAccepted,
        outcome,
        dateKey,
        batchNumber: batch.batchNumber,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { alreadyPlayed: false, outcome };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("scratchy-tuesday/play transaction failed:", err);
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again in a moment." },
      { status: 500 },
    );
  }
}
