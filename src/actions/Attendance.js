"use server";

import { auth } from "../../auth";
import dbConnect from "@/lib/db.js";
import { attendance } from "@/models/Attendance.model";
import { revalidatePath } from "next/cache";

export async function markAttendance(subjectId, slotId, status, dateIso) {
  // Verify the user is logged in
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await dbConnect();

  await attendance.findOneAndUpdate(
    { 
      userEmail: session.user.email,
      subjectId: subjectId,
      slotId: slotId,
      date: new Date(dateIso) 
    },
    { status: status },
    { upsert: true, new: true }
  );

  revalidatePath("/dashboard");
}