"use server"

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { subject } from "@/models/subject.model";
import { syncUserCGPAIfAuto, updateSemesterSGPA } from "./semester";
import { revalidateTag } from "next/cache";

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

        await updateSemesterSGPA(SubToDelete.semester, userId);
        await syncUserCGPAIfAuto(userId);
        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);
        revalidateTag(`semester-${userId}`);

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

        await updateSemesterSGPA(subjectData.semester, session.user.id);
        await syncUserCGPAIfAuto(userId);

        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);
        revalidateTag(`semester-${userId}`);

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
