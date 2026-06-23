"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";
import { Timetable } from "@/models/timetable.model";
import { User } from "@/models/user.model";
import { revalidateTag, unstable_cache } from "next/cache";
import { getGradePointFromMarks } from "./subject";

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

        const [timetableDel] = await Promise.all([
            Timetable.deleteMany({ userId, subjectId: { $in: subjectIds } })
        ]);

        if (!timetableDel.acknowledged) {
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

        await syncUserCGPAIfAuto(userId);

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

export const updateSemesterSGPA = async (SemId, userId) => {
    await dbConnect();

    const subjects = await subject.find({ userId: userId, semester: SemId }).lean();

    if (!subjects || subjects.length === 0) {
        await Semester.findByIdAndUpdate(SemId, { sgpa: 0 });
        return 0;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const sub of subjects) {
        const credits = Number(sub.credits) || 0;
        const marks = (Number(sub.marks?.internal) || 0) + (Number(sub.marks?.endsem) || 0);
        const gradePoint = await getGradePointFromMarks(marks);

        if (credits > 0) {
            totalPoints += (gradePoint * credits);
            totalCredits += credits;
        }
    }

    const finalSGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

    await Semester.findByIdAndUpdate(SemId, { sgpa: finalSGPA });

    return finalSGPA;
}

export const calculateUserCGPA = async (userId, currentSem) => {
    const pastSems = await Semester.find({
        userId: userId,
        semester: { $lt: currentSem }
    }).lean();

    let totalWeightedPoints = 0;
    let totalCreditsOverall = 0;

    for (const sem of pastSems) {
        let currentSgpa = sem.sgpa;

        if (!currentSgpa || currentSgpa === 0) {
            currentSgpa = await updateSemesterSGPA(sem._id, userId);
        }

        const subjects = await subject.find({ userId: userId, semester: sem._id }).lean();
        const semCredits = subjects.reduce((sum, sub) => sum + (sub.credits || 0), 0);

        if (semCredits > 0 && currentSgpa > 0) {
            totalWeightedPoints += (currentSgpa * semCredits);
            totalCreditsOverall += semCredits;
        }
    }

    return totalCreditsOverall > 0 ? Number((totalWeightedPoints / totalCreditsOverall).toFixed(2)) : 0;
}

export const syncUserCGPAIfAuto = async (userId) => {
    await dbConnect();

    const user = await User.findById(userId)
        .select("autoCalculateCGPA currentCGPA currentSem")
        .lean();

    const shouldAutoCalculate = user?.autoCalculateCGPA !== undefined
        ? user.autoCalculateCGPA
        : !(user?.currentCGPA > 0);

    if (!shouldAutoCalculate) return null;

    const currentSem = Number(user.currentSem) || 1;
    const currentCGPA = currentSem > 1 ? await calculateUserCGPA(userId, currentSem) : 0;

    await User.findByIdAndUpdate(userId, { currentCGPA });

    revalidateTag(`settings-${userId}`);
    revalidateTag(`vault-${userId}`);
    revalidateTag(`dashboard-${userId}`);

    return currentCGPA;
}
