"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Semester } from "@/models/semester.model";

export async function getSemesterSummaries() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();

    const rawSemData = await Semester.find({ userId: session.user.id })
        .sort({ semester: 1 })
        .lean();

    return rawSemData.map((sem) => ({
        id: sem._id.toString(),
        semester: sem.semester,
        sgpa: sem.sgpa ?? 0,
        status: sem.status
    }));
}

export async function addingSemester(semNum) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    await dbConnect();

    try {
        const newSem = await Semester.create({
            userId: session.user.id,
            semester: semNum
        })

        return {
            success: true,
            message: `Semester ${semNum} added successfully!`,
            id: newSem._id.toString()
        };

    } catch (err) {
        return { success: false, error: err.message };
    }
}