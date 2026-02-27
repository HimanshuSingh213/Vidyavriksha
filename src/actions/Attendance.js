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

  const date = new Date(dateIso);
  date.setHours(0, 0, 0, 0);

  console.log("Marking attendance:", { subjectId, slotId, status, originalDate: dateIso, dbDate: date });

  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  await attendance.deleteMany({
    userId: session?.user?.id,
    slotId: slotId,
    date: { $gte: dayStart, $lte: dayEnd }
  });

  if (status) {
    await attendance.create({
      userId: session?.user?.id,
      subjectId: subjectId,
      slotId: slotId,
      date: date,
      status: status
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/timetable");
}