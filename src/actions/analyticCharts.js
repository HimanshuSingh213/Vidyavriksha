"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { redirect } from "next/navigation";
import { Semester } from "@/models/semester.model";
import { subject } from "@/models/subject.model";
import { unstable_cache } from "next/cache";

export default async function stackedMarksData(SemId) {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    const getCachedData = unstable_cache(
        async () => {
            await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            return rawSubjects.map(sub => ({
                subject: sub.name,
                internal: sub.marks.internal || 0,
                external: sub.marks.endsem || 0
            }));
        },
        [`stacked-marks-${userId}-${SemId}`],
        {
            tags: [`analytics-${userId}`],
            revalidate: 86400
        }
    )
    try {
        const stackedData = await getCachedData();
        return { success: true, data: stackedData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export async function getSems() {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    const getCachedSems = unstable_cache(
        async () => {
            await dbConnect();
            const TotalSemesters = await Semester.find({
                userId,
            }).sort({ semester: 1 }).lean();

            return JSON.parse(JSON.stringify(TotalSemesters));
        },
        [`sems-${userId}`],
        { tags: [`analytics-${userId}`], revalidate: 86400 }
    )

    return await getCachedSems();
}

export const RadialChartData = async (SemId) => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    const getCachedData = unstable_cache(
        async () => {
            await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            return rawSubjects.map(sub => {
                const totalScore = (sub.marks?.internal || 0) + (sub.marks?.endsem || 0);
                return {
                    subject: sub.name,
                    score: totalScore,
                    fullMark: 100
                };
            });
        },
        [`radial-chart-${userId}-${SemId}`],
        { tags: [`analytics-${userId}`], revalidate: 86400 }
    )

    try {
        const performanceData = await getCachedData();
        return { success: true, data: performanceData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export const fetchDistributedBarGraph = async (SemId) => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    const getCachedData = unstable_cache(
        async () => {
            await dbConnect();

            const rawSubjects = await subject.find({
                userId,
                semester: SemId
            }).lean();

            const nonLabSubjects = rawSubjects.filter(
                sub => !sub.name.toLowerCase().includes("lab")
            );

            return nonLabSubjects.map(sub => ({
                subject: sub.name,
                minor1: sub.marks?.minor1 || 0,
                minor2: sub.marks?.minor2 || 0,
                endsem: sub.marks?.endsem || 0
            }));
        },
        [`distributed-bar-${userId}-${SemId}`],
        { tags: [`analytics-${userId}`], revalidate: 86400 }
    )
    try {
        const examTrendData = await getCachedData();
        return { success: true, data: examTrendData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}

export const fetchSGPAProgressionChart = async () => {
    const session = await auth();

    if (!session) redirect("/login");
    const userId = session?.user?.id;

    const getCachedData = unstable_cache(
        async () => {
            await dbConnect();

            const rawSemesters = await Semester.find({ userId }).sort({ semester: 1 }).lean();

            return rawSemesters.map(sem => ({
                semester: `Sem ${sem.semester}`,
                sgpa: sem.sgpa || 0,
                status: sem.status || "Ongoing"
            }));
        },
        [`sgpa-progression-${userId}`],
        { tags: [`analytics-${userId}`], revalidate: 86400 }
    )
    try {
        const sgpaProgressionData = await getCachedData();
        return { success: true, data: sgpaProgressionData };

    } catch (err) {
        return { success: false, error: "Error while fetching data for charts" }
    }
}