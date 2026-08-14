"use server"

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { subject } from "@/models/subject.model";
import { Timetable } from "@/models/timetable.model";
import { User } from "@/models/user.model";
import { syncUserCGPAIfAuto, updateSemesterSGPA } from "./semester";
import { revalidatePath } from "next/cache";

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

        const updatedSGPA = await updateSemesterSGPA(result.semester, userId);
        const updatedCGPA = await syncUserCGPAIfAuto(userId);

        // Get updated user settings for currentSem
        const user = await User.findById(userId).select("currentSem currentCGPA autoCalculateCGPA targetCGPA").lean();

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/analytics", "page");
        revalidatePath("/dashboard/simulator", "page");

        return {
            success: true,
            message: "Marks updated successfully!",
            updatedSGPA,
            updatedCGPA: updatedCGPA ?? user?.currentCGPA ?? 0,
            updatedCurrentSem: user?.currentSem ?? 1,
            updatedAutoCalculateCGPA: user?.autoCalculateCGPA ?? true,
            updatedTargetCGPA: user?.targetCGPA ?? 9.0
        };

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

        const updatedSGPA = await updateSemesterSGPA(SubToDelete.semester, userId);
        const updatedCGPA = await syncUserCGPAIfAuto(userId);

        // Get updated user settings for currentSem
        const user = await User.findById(userId).select("currentSem currentCGPA autoCalculateCGPA targetCGPA").lean();

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/analytics", "page");
        revalidatePath("/dashboard/simulator", "page");

        return {
            success: true,
            message: "Subject deleted successfully",
            updatedSGPA,
            updatedCGPA: updatedCGPA ?? user?.currentCGPA ?? 0,
            updatedCurrentSem: user?.currentSem ?? 1,
            updatedAutoCalculateCGPA: user?.autoCalculateCGPA ?? true,
            updatedTargetCGPA: user?.targetCGPA ?? 9.0
        };
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
            defaultRoom: subjectData.room || "",
            defaultTeacher: subjectData.teacher || "",
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

        const updatedSGPA = await updateSemesterSGPA(subjectData.semester, userId);
        const updatedCGPA = await syncUserCGPAIfAuto(userId);

        // Get updated user settings for currentSem
        const user = await User.findById(userId).select("currentSem currentCGPA autoCalculateCGPA targetCGPA").lean();

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/analytics", "page");
        revalidatePath("/dashboard/simulator", "page");

        return {
            success: true,
            message: "Subject added successfully!",
            id: subToAdd._id.toString(),
            updatedSGPA,
            updatedCGPA: updatedCGPA ?? user?.currentCGPA ?? 0,
            updatedCurrentSem: user?.currentSem ?? 1,
            updatedAutoCalculateCGPA: user?.autoCalculateCGPA ?? true,
            updatedTargetCGPA: user?.targetCGPA ?? 9.0
        };
    } catch (err) {
        return { success: false, error: err.message || "Failed to add subject" };
    }
}

// Helper function to convert raw marks to a Grade Point (0-10)
export async function getGradePointFromMarks(marks) {
    const numMarks = Number(marks);
    if (isNaN(numMarks) || numMarks < 0) return 0;
    
    if (numMarks >= 90) return 10; // Grade O
    if (numMarks >= 75) return 9;  // Grade A+
    if (numMarks >= 65) return 8;  // Grade A
    if (numMarks >= 55) return 7;  // Grade B+
    if (numMarks >= 50) return 6;  // Grade B
    if (numMarks >= 45) return 5;  // Grade C
    if (numMarks >= 40) return 4;  // Grade P
    return 0;                      // Grade F
}

export async function addTimetableSlot(slotData) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;
    await dbConnect();

    try {
        let itemsToCreate = [];

        if (Array.isArray(slotData)) {
            // Direct array of slot objects
            for (const item of slotData) {
                const startMinutes = typeof item.startTime === 'number' ? item.startTime : parseTimeToMinutes(item.startTime);
                const endMinutes = typeof item.endTime === 'number' ? item.endTime : parseTimeToMinutes(item.endTime);
                itemsToCreate.push({
                    userId,
                    subjectId: item.subjectId,
                    dayOfWeek: Number(item.dayOfWeek),
                    startMinutes,
                    endMinutes,
                    room: item.room || 'TBA',
                    teacher: item.teacher || 'TBA'
                });
            }
        } else if (slotData.slots && Array.isArray(slotData.slots)) {
            // { subjectId, slots: [ { days: [1,3], startTime, endTime, room, teacher }, ... ] }
            for (const grp of slotData.slots) {
                const days = Array.isArray(grp.days) ? grp.days : (grp.dayOfWeek !== undefined ? [grp.dayOfWeek] : [1]);
                const startMinutes = typeof grp.startTime === 'number' ? grp.startTime : parseTimeToMinutes(grp.startTime);
                const endMinutes = typeof grp.endTime === 'number' ? grp.endTime : parseTimeToMinutes(grp.endTime);
                const room = grp.room || slotData.room || 'TBA';
                const teacher = grp.teacher || slotData.teacher || 'TBA';

                for (const d of days) {
                    itemsToCreate.push({
                        userId,
                        subjectId: grp.subjectId || slotData.subjectId,
                        dayOfWeek: Number(d),
                        startMinutes,
                        endMinutes,
                        room,
                        teacher
                    });
                }
            }
        } else if (Array.isArray(slotData.daysOfWeek) && slotData.daysOfWeek.length > 0) {
            // { subjectId, daysOfWeek: [1, 3, 5], startTime, endTime, room, teacher }
            const startMinutes = parseTimeToMinutes(slotData.startTime);
            const endMinutes = parseTimeToMinutes(slotData.endTime);
            for (const d of slotData.daysOfWeek) {
                itemsToCreate.push({
                    userId,
                    subjectId: slotData.subjectId,
                    dayOfWeek: Number(d),
                    startMinutes,
                    endMinutes,
                    room: slotData.room || 'TBA',
                    teacher: slotData.teacher || 'TBA'
                });
            }
        } else {
            // Standard single slot { subjectId, dayOfWeek, startTime, endTime, room, teacher }
            const startMinutes = parseTimeToMinutes(slotData.startTime);
            const endMinutes = parseTimeToMinutes(slotData.endTime);
            itemsToCreate.push({
                userId,
                subjectId: slotData.subjectId,
                dayOfWeek: Number(slotData.dayOfWeek),
                startMinutes,
                endMinutes,
                room: slotData.room || 'TBA',
                teacher: slotData.teacher || 'TBA'
            });
        }

        if (itemsToCreate.length === 0) {
            return { success: false, error: "No class slots to schedule." };
        }

        for (const item of itemsToCreate) {
            if (!item.subjectId) throw new Error("Subject is required for each class slot.");
            if (isNaN(item.dayOfWeek) || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
                throw new Error("Please select valid days of the week.");
            }
            if (item.startMinutes >= item.endMinutes) {
                throw new Error("End time must be after start time for all slots.");
            }
        }

        await Timetable.insertMany(itemsToCreate);

        revalidatePath("/dashboard", "layout");
        return { 
            success: true, 
            message: itemsToCreate.length === 1 
                ? "Timetable slot added successfully!" 
                : `${itemsToCreate.length} timetable slots added successfully!` 
        };
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
        revalidatePath("/dashboard", "layout");
        return { success: true, message: "Timetable slot deleted successfully!" };
    } catch (err) {
        return { success: false, error: err.message || "Failed to delete slot" };
    }
}
