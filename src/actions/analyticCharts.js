"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { redirect } from "next/navigation";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";
import { User } from "@/models/user.model";

export default async function stackedMarksData(SemId) {
    const session = await auth();

    if (!session) redirect("/login");

    try {
        const userId = session?.user?.id;

        await dbConnect();

        const rawSubjects = await subject.find({
            userId,
            semester: SemId
        });

        const stackedMarksData = rawSubjects.map(sub => ({
            subject: sub.name,
            internal: sub.marks.internal || 0,
            external: sub.marks.endsem || 0
        }));

        return { success: true, data: stackedMarksData }

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export async function getSems() {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    await dbConnect();
    const TotalSemesters = await Semester.find({
        userId,
    }).sort({ semester: 1 }).lean();

    return JSON.parse(JSON.stringify(TotalSemesters));
}

export const RadialChartData = async (SemId) => {
    const session = await auth();

    if (!session) redirect("/login");
    try {
        const userId = session?.user?.id;

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

    try {
        const userId = session?.user?.id;

        await dbConnect();

        const rawSubjects = await subject.find({
            userId,
            semester: SemId
        }).lean();

        const examTrendData = rawSubjects.map(sub => ({
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

    try {
        const userId = session?.user?.id;

        await dbConnect();

        const userDoc = await User.findById(userId).lean();
        const targetCgpa = userDoc?.targetCgpa || 8.0;

        const rawSemesters = await Semester.find({ userId }).sort({ semester: 1 }).lean();

        const sgpaProgressionData = rawSemesters.map(sem => ({
            semester: `Sem ${sem.semester}`,
            sgpa: sem.sgpa || 0,
        }));

        return { success: true, data: sgpaProgressionData, targetCgpa: targetCgpa };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}