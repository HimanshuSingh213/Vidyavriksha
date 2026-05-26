"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { attendance } from "@/models/Attendance.model";
import { Exam } from "@/models/exam.model";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";
import { Timetable } from "@/models/timetable.model";
import { revalidateTag, unstable_cache } from "next/cache";

export async function getSemesterSummaries() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    const getCachedSummaries = unstable_cache(
        async () => {
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
        },
        [`semester-summaries-${userId}`], // Unique Key
        { tags: [`semester-${userId}`], revalidate: 86400 }
    )

    return await getCachedSummaries();
}

export async function addingSemester(semNum) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized access" };
    const userId = session.user.id;

    await dbConnect();

    try {
        const existing = await Semester.findOne({
            userId: userId,
            semester: semNum
        });

        if (existing) {
            return { success: false, error: `Semester ${semNum} already exists.` };
        }

        const newSem = await Semester.create({
            userId: userId,
            semester: semNum
        })

        revalidateTag(`semester-${userId}`);
        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);

        return {
            success: true,
            message: `Semester ${semNum} added successfully!`,
            id: newSem._id.toString()
        };

    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function deleteSemester(SemId) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized access" };
    const userId = session?.user?.id;

    await dbConnect();

    try {
        const allSubjects = await subject.find({
            userId,
            semester: SemId
        }, { _id: 1 }).lean();

        const subjectIds = allSubjects.map((sub) => sub._id);

        const [timetableDel, attendanceDel, examsDel] = await Promise.all([
            Timetable.deleteMany({ userId, subjectId: { $in: subjectIds } }),
            attendance.deleteMany({ userId, subjectId: { $in: subjectIds } }),
            Exam.deleteMany({ userId, subjectId: { $in: subjectIds } })
        ]);

        if (!timetableDel.acknowledged || !attendanceDel.acknowledged || !examsDel.acknowledged) {
            return { success: false, error: "Failed to clean up associated subject records." };
        }

        const subjectDel = await subject.deleteMany({ userId, semester: SemId });
        if (!subjectDel.acknowledged) {
            return { success: false, error: "Failed to delete subjects." };
        }

        const semToDelete = await Semester.findOneAndDelete({
            _id: SemId,
            userId: userId
        });

        if (!semToDelete) {
            return { success: false, error: "Semester not found or unauthorized." };
        }

        revalidateTag(`semester-${userId}`);
        revalidateTag(`analytics-${userId}`);
        revalidateTag(`vault-${userId}`);
        revalidateTag(`dashboard-${userId}`);

        return { success: true, message: "Semester and all related data deleted successfully!" };

    } catch (err) {
        return { success: false, error: "Failed to delete semester" };
    }
}

export async function getSemData(SemId) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    const getCachedSemData = unstable_cache(
        async () => {
            await dbConnect();
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

            const totalSubjects = formattedSubjects.length;
            let totalCredits = 0;
            formattedSubjects.forEach((sub) => totalCredits += sub.credits);

            return { success: true, data: formattedSubjects, totalSubjects, totalCredits };
        },
        [`sem-data-${userId}-${SemId}`], // Unique Key per semester
        { tags: [`semester-${userId}`], revalidate: 86400 }
    );

    try {
        return await getCachedSemData();
    } catch (err) {
        return { success: false, error: "Failed to fetch subjects." };
    }
}

export async function getCGPAData() {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    const getCachedCGPA = unstable_cache(
        async () => {
            await dbConnect();
            const allSems = await Semester.find({ userId }).sort({ semester: 1 }).lean();

            return allSems.map((sem) => ({
                Name: `Sem ${sem.semester}`,
                sgpa: sem.sgpa ?? 0
            }));
        },
        [`cgpa-data-${userId}`],
        { tags: [`analytics-${userId}`, `semester-${userId}`], revalidate: 86400 }
    );

    try {
        const Data = await getCachedCGPA();
        return { success: true, data: Data };
    } catch (err) {
        return { success: false, error: "Failed to fetch semester Data." };
    }
}