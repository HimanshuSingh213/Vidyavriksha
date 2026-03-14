"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";

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

export async function deleteSemester(SemId){
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    await dbConnect();

    try {
        const semToDelete = await Semester.findByIdAndDelete({
            _id: SemId,
            userId: userId
        });
        
        if (!semToDelete) {
             return { success: false, error: "Semester not found" };
        }
        
        return { success: true, message: "Semester deleted successfully" };
    } catch (err) {
        return { success: false, error: "Failed to delete semester" };
    }
}

export async function getSemData(SemId){
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    await dbConnect();

    try {
        const allSubjects = await subject.find({
            userId: userId,
            semester: SemId
        }).lean();

        const formattedSubjects = allSubjects.map((sub) => ({
            id: sub._id.toString(),
            name: sub.name,
            code: sub.code,
            credits: sub.credits,
            marks: sub.marks 
        }));

        return { success: true, data: formattedSubjects };


    } catch (err) {
        return { success: false, error: "Failed to fetch subjects." };
    }
}