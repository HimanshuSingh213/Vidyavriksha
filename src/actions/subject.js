"use server"

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { subject } from "@/models/subject.model";
import { Timetable } from "@/models/timetable.model";
import { syncUserCGPAIfAuto, updateSemesterSGPA } from "./semester";
import { revalidateTag } from "next/cache";

function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export default async function updateSubjectMarks(SubId, updatedMarks) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    await dbConnect();

    try {
        const result = await subject.findOneAndUpdate({
            userId: userId,
            _id: SubId
        },
            {
                $set: {
                    "marks.minor1": updatedMarks.minor1,
                    "marks.minor2": updatedMarks.minor2,
                    "marks.internal": updatedMarks.internal,
                    "marks.endsem": updatedMarks.endsem
                }
            },
            { new: true }
        ).lean();

        if (!result) {
            return { success: false, error: "Subject not found or you don't have permission." };
        }

        await updateSemesterSGPA(result.semester, userId);
        await syncUserCGPAIfAuto(userId);
        revalidateTag(`analytics-${userId}`);
        revalidateTag(`semester-${userId}`);

        return { success: true, message: "Marks updated successfully!" };

    } catch (error) {
        return { success: false, error: "Failed to update marks." };
    }
}

export async function deleteSubject(SubId) {
    const session = await auth();

    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    await dbConnect();

    try {
        const SubToDelete = await subject.findByIdAndDelete({
            _id: SubId,
            userId: userId
        });

        if (!SubToDelete) {
            return { success: false, error: "Subject not found" };
        }

        // Clean up any timetable entries associated with this subject
        await Timetable.deleteMany({ userId, subjectId: SubId });

        await updateSemesterSGPA(SubToDelete.semester, userId);
        await syncUserCGPAIfAuto(userId);
        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);
        revalidateTag(`semester-${userId}`);
        revalidateTag(`dashboard-${userId}`);

        return { success: true, message: "Subject deleted successfully" };
    } catch (err) {
        return { success: false, error: "Failed to delete Subject" };
    }
}

export async function addSubject(subjectData){
    const session = await auth();

    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    await dbConnect();

    try {
        const subToAdd = await subject.create({
            name: subjectData.name,
            code: subjectData.code,
            credits: subjectData.credits || 0,
            semester: subjectData.semester,
            userId: userId
        });

        // Add timetable entry if dayOfWeek is provided
        if (subjectData.dayOfWeek !== undefined && subjectData.dayOfWeek !== null && subjectData.dayOfWeek !== "") {
            const startMinutes = parseTimeToMinutes(subjectData.startTime);
            const endMinutes = parseTimeToMinutes(subjectData.endTime);

            await Timetable.create({
                userId,
                subjectId: subToAdd._id,
                dayOfWeek: Number(subjectData.dayOfWeek),
                startMinutes,
                endMinutes,
                room: subjectData.room || 'TBA',
                teacher: subjectData.teacher || 'TBA'
            });
        }

        await updateSemesterSGPA(subjectData.semester, session.user.id);
        await syncUserCGPAIfAuto(userId);

        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);
        revalidateTag(`semester-${userId}`);
        revalidateTag(`dashboard-${userId}`);

        return {
            success: true,
            message: "Subject added successfully!",
            id: subToAdd._id.toString()
        };
    } catch (err) {
        return { success: false, error: err.message || "Failed to add subject" };
    }
}

// Helper function to convert raw marks to a Grade Point (0-10)
export async function getGradePointFromMarks(marks) {
    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0) return 0;
    
    if (numMarks >= 90) return 10;
    if (numMarks >= 80) return 9;
    if (numMarks >= 70) return 8;
    if (numMarks >= 60) return 7;
    if (numMarks >= 50) return 6;
    if (numMarks >= 40) return 5; 
    return 0;
}

export async function addTimetableSlot(slotData) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;
    await dbConnect();

    try {
        const startMinutes = parseTimeToMinutes(slotData.startTime);
        const endMinutes = parseTimeToMinutes(slotData.endTime);

        await Timetable.create({
            userId,
            subjectId: slotData.subjectId,
            dayOfWeek: Number(slotData.dayOfWeek),
            startMinutes,
            endMinutes,
            room: slotData.room || 'TBA',
            teacher: slotData.teacher || 'TBA'
        });

        revalidateTag(`dashboard-${userId}`);
        return { success: true, message: "Timetable slot added successfully!" };
    } catch (err) {
        return { success: false, error: err.message || "Failed to add timetable slot" };
    }
}

export async function deleteTimetableSlot(slotId) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;
    await dbConnect();

    try {
        await Timetable.deleteOne({ _id: slotId, userId });
        revalidateTag(`dashboard-${userId}`);
        return { success: true, message: "Timetable slot deleted successfully!" };
    } catch (err) {
        return { success: false, error: err.message || "Failed to delete slot" };
    }
}
