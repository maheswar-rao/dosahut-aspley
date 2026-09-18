import { maskMobile, normaliseMobile } from "@/lib/vip/mobile";
import { findByPhone, recordReturnVisit, touchBranchVisit } from "@/lib/vip/repo";

/**
 * The first step of registration: is this number already one of ours?
 *
 * Membership is decided by presence in vip_members and nothing else. That
 * matters because customers migrated in from the existing contact list have a
 * member row but no reward row — judging by vip_rewards would wrongly read
 * them as new and hand them a welcome gift they are not owed.
 *
 * A recognised member is finished here: no email asked for, no code sent, no
 * reward issued. Their visit is counted and that is all.
 */
export async function POST(request: Request) {
  let body: { phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }

  const phone = normaliseMobile(
    typeof body.phone === "string" ? body.phone : "",
  );
  if (!phone) {
    return Response.json(
      { message: "Please enter a valid Australian mobile number." },
      { status: 400 },
    );
  }

  const member = await findByPhone(phone);

  if (!member) {
    return Response.json({ isExisting: false, phone, phoneMasked: maskMobile(phone) });
  }

  // Known already — count the visit rather than start a registration.
  const updated = (await recordReturnVisit(phone)) ?? member;
  await touchBranchVisit(phone);

  return Response.json({
    isExisting: true,
    phone,
    phoneMasked: maskMobile(phone),
    member: {
      name: updated.name,
      visitCount: updated.visitCount ?? 1,
      homeBranch: updated.homeBranch,
    },
  });
}
