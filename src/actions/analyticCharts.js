"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { redirect } from "next/navigation";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";

export default async function stackedMarksData(SemId) {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    try {
        await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            const stackedData = rawSubjects.map(sub => ({
                subject: sub.name,
                internal: sub.marks.internal || 0,
                external: sub.marks.endsem || 0
            }));

        return { success: true, data: stackedData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export async function getSems() {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    try {
        await dbConnect();
            const TotalSemesters = await Semester.find({
                userId,
            }).sort({ semester: 1 }).lean();

            // Fetch subject credits for each semester in parallel to get accurate weights
            const semestersWithCredits = await Promise.all(
                TotalSemesters.map(async (sem) => {
                    const subjects = await subject.find({ userId, semester: sem._id }).lean();
                    const credits = subjects.reduce((sum, sub) => sum + (Number(sub.credits) || 0), 0);
                    return {
                        ...sem,
                        credits: credits > 0 ? credits : 20 // Default to 20 if no subjects are added yet
                    };
                })
            );

            return JSON.parse(JSON.stringify(semestersWithCredits));
    } catch (err) {
        return [];
    }
}

export const RadialChartData = async (SemId) => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    try {
        await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            const performanceData = rawSubjects.map(sub => {
                const totalScore = (sub.marks?.internal || 0) + (sub.marks?.endsem || 0);
                return {
                    subject: sub.name,
                    score: totalScore,
                    fullMark: 100
                };
            });

        return { success: true, data: performanceData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export const fetchDistributedBarGraph = async (SemId) => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    try {
        await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            const nonLabSubjects = rawSubjects.filter(
                sub => !sub.name.toLowerCase().includes("lab")
            );

            const examTrendData = nonLabSubjects.map(sub => ({
                subject: sub.name,
                minor1: sub.marks?.minor1 || 0,
                minor2: sub.marks?.minor2 || 0,
                endsem: sub.marks?.endsem || 0
            }));
        return { success: true, data: examTrendData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export const fetchSGPAProgressionChart = async () => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    try {
        await dbConnect();

            const rawSemesters = await Semester.find({ userId }).sort({ semester: 1 }).lean();

            const sgpaProgressionData = rawSemesters.map(sem => ({
                semester: `Sem ${sem.semester}`,
                sgpa: sem.sgpa || 0,
                status: sem.status || "Ongoing"
            }));

        return { success: true, data: sgpaProgressionData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}