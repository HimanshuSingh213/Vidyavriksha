"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";
import { Timetable } from "@/models/timetable.model";
import { User } from "@/models/user.model";
import { revalidatePath } from "next/cache";
import { getGradePointFromMarks } from "./subject";

export async function getSemesterSummaries() {
    const session = await auth();
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    await dbConnect();

    const user = await User.findById(userId).select("currentSem").lean();
    const currentSem = user?.currentSem || 1;

    const rawSemData = await Semester.find({ userId: session.user.id })
        .sort({ semester: 1 })
        .lean();

    return rawSemData.map((sem) => ({
        id: sem._id.toString(),
        semester: sem.semester,
        sgpa: sem.sgpa ?? 0,
        status: sem.semester < currentSem ? "Completed" : "Ongoing"
    }));
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

        const updatedCGPA = await syncUserCGPAIfAuto(userId);
        const user = await User.findById(userId).select("currentSem currentCGPA autoCalculateCGPA targetCGPA").lean();

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/analytics", "page");
        revalidatePath("/dashboard/simulator", "page");

        return {
            success: true,
            message: `Semester ${semNum} added successfully!`,
            id: newSem._id.toString(),
            updatedCGPA: updatedCGPA ?? user?.currentCGPA ?? 0,
            updatedCurrentSem: user?.currentSem ?? 1,
            updatedAutoCalculateCGPA: user?.autoCalculateCGPA ?? true,
            updatedTargetCGPA: user?.targetCGPA ?? 9.0
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

        const updatedCGPA = await syncUserCGPAIfAuto(userId);
        const user = await User.findById(userId).select("currentSem currentCGPA autoCalculateCGPA targetCGPA").lean();

        revalidatePath("/dashboard", "layout");
        revalidatePath("/dashboard/analytics", "page");
        revalidatePath("/dashboard/simulator", "page");

        return {
            success: true,
            message: "Semester and all related data deleted successfully!",
            updatedCGPA: updatedCGPA ?? user?.currentCGPA ?? 0,
            updatedCurrentSem: user?.currentSem ?? 1,
            updatedAutoCalculateCGPA: user?.autoCalculateCGPA ?? true,
            updatedTargetCGPA: user?.targetCGPA ?? 9.0
        };

    } catch (err) {
        return { success: false, error: "Failed to delete semester" };
    }
}

export async function getSemData(SemId) {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    try {
        await dbConnect();
        const allSubjects = await subject.find({
            userId: userId,
            semester: SemId
        }).lean();

        const checkIsLab = (sub) => {
            const nameLower = (sub.name || "").toLowerCase();
            const codeLower = (sub.code || "").toLowerCase();
            return nameLower.includes("lab") || nameLower.includes("practical") || nameLower.includes("laboratory") || nameLower.includes("workshop") || codeLower.includes("lab") || codeLower.endsWith("p") || codeLower.endsWith("l");
        };

        const formattedSubjects = allSubjects.map((sub) => ({
            id: sub._id.toString(),
            name: sub.name,
            code: sub.code,
            credits: sub.credits,
            marks: sub.marks,
            isLab: checkIsLab(sub)
        })).sort((a, b) => (a.isLab === b.isLab ? 0 : a.isLab ? 1 : -1));

        const totalSubjects = formattedSubjects.length;
        let totalCredits = 0;
        formattedSubjects.forEach((sub) => totalCredits += sub.credits);

        return { success: true, data: formattedSubjects, totalSubjects, totalCredits };
    } catch (err) {
        return { success: false, error: "Failed to fetch subjects." };
    }
}

export async function getCGPAData() {
    const session = await auth();
    if (!session?.user?.id)
        return { success: false, error: "Unauthorized access" };

    const userId = session?.user?.id;

    try {
        await dbConnect();
        const allSems = await Semester.find({ userId }).sort({ semester: 1 }).lean();

        const Data = allSems.map((sem) => ({
            Name: `Sem ${sem.semester}`,
            sgpa: sem.sgpa ?? 0
        }));
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
        const intMarks = Number(sub.marks?.internal) || 0;
        const endMarks = Number(sub.marks?.endsem) || 0;
        const marks = intMarks + endMarks;

        if (credits > 0) {
            const gradePoint = await getGradePointFromMarks(marks);
            totalPoints += (gradePoint * credits);
            totalCredits += credits;
        }
    }

    const finalSGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

    await Semester.findByIdAndUpdate(SemId, { sgpa: finalSGPA });

    return finalSGPA;
}

export const calculateUserCGPA = async (userId, currentSem) => {
    // Ordinance 11 CGPA is based on all past semesters (excluding the ongoing current one).
    const pastSems = await Semester.find({
        userId: userId,
        semester: { $lt: currentSem }
    }).lean();

    let totalWeightedPoints = 0;
    let totalCreditsOverall = 0;

    for (const sem of pastSems) {
        // According to GGSIPU Ordinance 11, CGPA is the exact sum of (Credits × Grade Point) 
        // across all semesters divided by total credits. We should NOT use the rounded SGPA.
        const subjects = await subject.find({ userId: userId, semester: sem._id }).lean();
        
        for (const sub of subjects) {
            const credits = Number(sub.credits) || 0;
            const intMarks = Number(sub.marks?.internal) || 0;
            const endMarks = Number(sub.marks?.endsem) || 0;
            const marks = intMarks + endMarks;
            
            if (credits > 0) {
                // Re-calculate grade point instead of relying on rounded intermediate values
                let gradePoint = 0;
                if (marks >= 90) gradePoint = 10;
                else if (marks >= 75) gradePoint = 9;
                else if (marks >= 65) gradePoint = 8;
                else if (marks >= 55) gradePoint = 7;
                else if (marks >= 50) gradePoint = 6;
                else if (marks >= 45) gradePoint = 5;
                else if (marks >= 40) gradePoint = 4;
                else gradePoint = 0;

                totalWeightedPoints += (gradePoint * credits);
                totalCreditsOverall += credits;
            }
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

    revalidatePath("/dashboard", "layout");

    return currentCGPA;
}

export async function getDetailedSemesterMarksheet(semId) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized access" };
    const userId = session.user.id;

    await dbConnect();

    try {
        const semDoc = await Semester.findOne({ _id: semId, userId }).lean();
        if (!semDoc) return { success: false, error: "Semester not found" };

        const userDoc = await User.findById(userId).select("name email program currentCGPA currentSem").lean();
        const subjects = await subject.find({ userId, semester: semId }).lean();
        
        const dynamicStatus = semDoc.semester < (userDoc?.currentSem || 1) ? "Completed" : "Ongoing";

        let totalObtainedMarks = 0;
        let totalRegisteredCredits = 0;
        let earnedCredits = 0;
        let backCount = 0;
        let qualityPointsEarned = 0;
        let qualityPointsMax = 0;

        const gradeCounts = {
            O: 0,
            "A+": 0,
            A: 0,
            "B+": 0,
            B: 0,
            C: 0,
            P: 0,
            F: 0
        };

        const formattedSubjects = subjects.map((sub) => {
            const intMarks = Number(sub.marks?.internal) || 0;
            const endMarks = Number(sub.marks?.endsem) || 0;
            const totalMarks = intMarks + endMarks;
            const credits = Number(sub.credits) || 0;

            let grade = "F";
            let gradePoint = 0;
            let isEvaluated = true;

            if (intMarks === 0 && endMarks === 0) {
                grade = "N/A";
                gradePoint = 0;
                isEvaluated = false;
            } else if (totalMarks >= 90) { grade = "O"; gradePoint = 10; }
            else if (totalMarks >= 75) { grade = "A+"; gradePoint = 9; }
            else if (totalMarks >= 65) { grade = "A"; gradePoint = 8; }
            else if (totalMarks >= 55) { grade = "B+"; gradePoint = 7; }
            else if (totalMarks >= 50) { grade = "B"; gradePoint = 6; }
            else if (totalMarks >= 45) { grade = "C"; gradePoint = 5; }
            else if (totalMarks >= 40) { grade = "P"; gradePoint = 4; }
            else { grade = "F"; gradePoint = 0; }

            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;

            if (isEvaluated) {
                totalObtainedMarks += totalMarks;
                qualityPointsEarned += (credits * gradePoint);
                qualityPointsMax += (credits * 10);
                
                if (totalMarks >= 40) {
                    earnedCredits += credits;
                } else {
                    backCount++;
                }
            }

            totalRegisteredCredits += credits;

            const nameLower = (sub.name || "").toLowerCase();
            const codeLower = (sub.code || "").toLowerCase();
            const isLab = nameLower.includes("lab") || nameLower.includes("practical") || nameLower.includes("laboratory") || nameLower.includes("workshop") || codeLower.includes("lab") || codeLower.endsWith("p") || codeLower.endsWith("l");

            return {
                id: sub._id.toString(),
                name: sub.name,
                code: sub.code,
                credits,
                marks: sub.marks,
                totalMarks,
                grade,
                gradePoint,
                isLab,
                isBack: isEvaluated ? totalMarks < 40 : false
            };
        }).sort((a, b) => (a.isLab === b.isLab ? 0 : a.isLab ? 1 : -1));

        const evaluatedSubjectsCount = formattedSubjects.filter(s => s.grade !== "N/A").length;
        const maxPossibleMarks = evaluatedSubjectsCount * 100;
        const percentage = maxPossibleMarks > 0 ? Number(((totalObtainedMarks / maxPossibleMarks) * 100).toFixed(2)) : 0;
        const sgpa = semDoc.sgpa ?? 0;

        let academicStanding = "Pass Division";
        if (backCount > 0) {
            academicStanding = "Backlog / Re-appear";
        } else if (sgpa >= 8.5) {
            academicStanding = "First Class with Distinction";
        } else if (sgpa >= 6.5) {
            academicStanding = "First Class";
        } else if (sgpa >= 4.0) {
            academicStanding = "Pass Division";
        } else {
            academicStanding = "Under Evaluation";
        }

        return {
            success: true,
            data: {
                semesterId: semDoc._id.toString(),
                semesterNumber: semDoc.semester,
                status: dynamicStatus,
                sgpa,
                totalObtainedMarks,
                maxPossibleMarks,
                percentage,
                totalRegisteredCredits,
                earnedCredits,
                backCount,
                qualityPointsEarned,
                qualityPointsMax,
                academicStanding,
                gradeCounts,
                user: {
                    name: userDoc?.name || "Student",
                    email: userDoc?.email || "",
                    program: userDoc?.program || "Bachelor of Technology",
                    cgpa: userDoc?.currentCGPA || 0
                },
                subjects: formattedSubjects
            }
        };
    } catch (err) {
        console.error("Error in getDetailedSemesterMarksheet:", err);
        return { success: false, error: "Failed to generate mark sheet." };
    }
}
