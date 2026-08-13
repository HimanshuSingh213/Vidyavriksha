"use client";
import { getSemData } from "@/actions/semester";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const isLabSubject = (sub) => {
    if (!sub) return false;
    const name = (sub.name || "").toLowerCase();
    const code = (sub.code || "").toLowerCase();
    return name.includes("lab") || name.includes("practical") || name.includes("laboratory") || name.includes("workshop") || code.includes("lab") || code.endsWith("p") || code.endsWith("l");
};

const getGradeInfo = (marksObj) => {
    const internal = Number(marksObj?.internal) || 0;
    const endsem = Number(marksObj?.endsem) || 0;
    const marks = internal + endsem;

    if (internal === 0 && endsem === 0) {
        return {
            grade: "N/A",
            gradePoint: 0,
            colorClass: "text-zinc-400",
            lineBg: "bg-zinc-500 shadow-[0_0_5px_rgba(161,161,170,0.3)]",
            isBack: false
        };
    }

    if (marks >= 90) {
        return {
            grade: "O",
            gradePoint: 10,
            colorClass: "text-emerald-400",
            lineBg: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
            isBack: false
        };
    }
    if (marks >= 75) {
        return {
            grade: "A+",
            gradePoint: 9,
            colorClass: "text-green-400",
            lineBg: "bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
            isBack: false
        };
    }
    if (marks >= 65) {
        return {
            grade: "A",
            gradePoint: 8,
            colorClass: "text-teal-400",
            lineBg: "bg-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.4)]",
            isBack: false
        };
    }
    if (marks >= 55) {
        return {
            grade: "B+",
            gradePoint: 7,
            colorClass: "text-cyan-400",
            lineBg: "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]",
            isBack: false
        };
    }
    if (marks >= 50) {
        return {
            grade: "B",
            gradePoint: 6,
            colorClass: "text-blue-400",
            lineBg: "bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.4)]",
            isBack: false
        };
    }
    if (marks >= 45) {
        return {
            grade: "C",
            gradePoint: 5,
            colorClass: "text-amber-400",
            lineBg: "bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
            isBack: false
        };
    }
    if (marks >= 40) {
        return {
            grade: "P",
            gradePoint: 4,
            colorClass: "text-orange-400",
            lineBg: "bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.4)]",
            isBack: false
        };
    }
    return {
        grade: "F",
        gradePoint: 0,
        colorClass: "text-rose-400",
        lineBg: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]",
        isBack: true
    };
};

export function SemDetail(semData) {
    const [semSubjectData, setSemSubjectData] = useState([]);
    const [subjectNum, setSubjectNum] = useState(0);
    const [creditsNum, setCreditsNum] = useState(0);
    const [isSemOpen, setIsSemOpen] = useState(false);

    useEffect(() => {
        const fetchSemData = async () => {
            try {
                const res = await getSemData(semData.semData._id);
                if (res.success) {
                    const sortedData = [...res.data].sort((a, b) => {
                        const aLab = a.isLab ?? isLabSubject(a);
                        const bLab = b.isLab ?? isLabSubject(b);
                        return aLab === bLab ? 0 : aLab ? 1 : -1;
                    });
                    setSemSubjectData(sortedData);
                    setSubjectNum(res.totalSubjects);
                    setCreditsNum(res.totalCredits);
                } else if (!res.success) {
                    console.error(res.error);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchSemData();
    }, []);

    const backCount = semSubjectData.filter(
        (s) => {
            const intMarks = s.marks?.internal ?? 0;
            const endMarks = s.marks?.endsem ?? 0;
            const isEvaluated = intMarks > 0 || endMarks > 0;
            return isEvaluated && (intMarks + endMarks) < 40;
        }
    ).length;

    let totalObtainedMarks = 0;
    let evaluatedCount = 0;
    semSubjectData.forEach(s => {
        const intMarks = s.marks?.internal ?? 0;
        const endMarks = s.marks?.endsem ?? 0;
        if (intMarks > 0 || endMarks > 0) {
            totalObtainedMarks += (intMarks + endMarks);
            evaluatedCount++;
        }
    });

    const maxMarks = evaluatedCount * 100;
    const percentage = maxMarks > 0 ? ((totalObtainedMarks / maxMarks) * 100).toFixed(1) : 0;

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsSemOpen(!isSemOpen)}
                className={`rounded-2xl backdrop-blur-lg py-3 px-4 sm:px-6 border flex justify-between items-center transition duration-200 cursor-pointer ${
                    isSemOpen
                        ? backCount > 0
                            ? "bg-rose-500/5 border-rose-500/30"
                            : "bg-brand/5 border-brand/20"
                        : "bg-primary/2 border-secondary/20 hover:border-secondary/40"
                }`}
            >
                {/* Left */}
                <div className="left flex gap-2 justify-center items-center">
                    <div>
                        <ChevronDown
                            className={`size-4 transition duration-200 ${
                                isSemOpen ? "rotate-180" : "rotate-0"
                            }`}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-primary font-semibold text-base sm:text-lg">
                                Semester {semData.semData.semester}
                            </h2>
                            {backCount > 0 && (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                    {backCount} Back{backCount > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                        <p className="text-secondary text-[10px] font-sans">
                            {subjectNum} subjects · {creditsNum} credits
                        </p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {semSubjectData.length > 0 && (
                        <div className="hidden sm:flex flex-col gap-0.5 text-right">
                            <p className="text-secondary text-[10px] font-sans uppercase tracking-wide">
                                Total Marks
                            </p>
                            <p className="text-xs font-mono font-semibold text-primary">
                                {totalObtainedMarks} <span className="text-secondary text-[10px]">/ {maxMarks} ({percentage}%)</span>
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-0.5 justify-center">
                        <p className="text-secondary text-[10px] text-center font-sans uppercase tracking-wide">
                            sgpa
                        </p>
                        <h2 className="text-primary text-lg text-right font-bold font-mono">
                            {semData.semData.sgpa}
                        </h2>
                    </div>

                    <Link
                        href={`/dashboard/vault/${semData.semData._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-brand/20 border border-white/10 text-secondary hover:text-brand transition-all flex items-center gap-1 text-[11px] font-medium"
                        title="View Official Full Marksheet"
                    >
                        <span className="hidden md:inline">Marksheet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.div>

            {/* Subjects List Dropdown */}
            <AnimatePresence>
                {isSemOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex flex-col gap-2 pl-2 sm:pl-4 overflow-hidden"
                    >
                        {semSubjectData.length > 0 ? (
                            semSubjectData.map((subject, index) => {
                                const totalMarks =
                                    (subject.marks?.internal ?? 0) +
                                    (subject.marks?.endsem ?? 0);
                                const percent = Math.min(totalMarks, 100);
                                const gradeInfo = getGradeInfo(subject.marks);

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: -15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        key={subject.id || index}
                                        className={`p-3 sm:p-4 bg-white/2 border rounded-xl flex flex-col gap-3 transition-colors ${
                                            gradeInfo.isBack
                                                ? "border-rose-500/30 bg-rose-500/2"
                                                : "border-white/5"
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-primary text-sm font-medium">
                                                        {subject.name}
                                                    </h3>
                                                    {gradeInfo.isBack && (
                                                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse">
                                                            Back
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-secondary text-[10px] uppercase font-mono mt-0.5 flex items-center gap-1.5">
                                                    <span>{subject.code} • {subject.credits} Credits</span>
                                                    {isLabSubject(subject) && (
                                                        <span className="px-1.5 py-0.2 text-[8px] font-mono rounded bg-brand/10 text-brand border border-brand/20">
                                                            LAB
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                                                <div className="text-center">
                                                    <p className="text-secondary text-[8px] uppercase">
                                                        Minor 1
                                                    </p>
                                                    <p className={`text-xs font-mono ${isLabSubject(subject) ? "text-secondary/40 italic" : "text-primary"}`}>
                                                        {isLabSubject(subject) ? "N/A" : (subject.marks?.minor1 ?? "-")}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-secondary text-[8px] uppercase">
                                                        Minor 2
                                                    </p>
                                                    <p className={`text-xs font-mono ${isLabSubject(subject) ? "text-secondary/40 italic" : "text-primary"}`}>
                                                        {isLabSubject(subject) ? "N/A" : (subject.marks?.minor2 ?? "-")}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-secondary text-[8px] uppercase">
                                                        Internal
                                                    </p>
                                                    <p className="text-primary text-xs font-mono">
                                                        {subject.marks?.internal ?? "-"}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-secondary text-[8px] uppercase">
                                                        End Sem
                                                    </p>
                                                    <p className="text-primary text-xs font-mono">
                                                        {subject.marks?.endsem ?? "-"}
                                                    </p>
                                                </div>
                                                <div className="text-center pl-3 border-l border-white/10 shrink-0 whitespace-nowrap">
                                                    <p className="text-secondary text-[8px] uppercase">
                                                        Grade
                                                    </p>
                                                    <p className={`text-xs font-mono font-bold whitespace-nowrap ${gradeInfo.colorClass}`}>
                                                        {gradeInfo.grade}{" "}
                                                        <span className="text-[10px] opacity-75 whitespace-nowrap">
                                                            ({gradeInfo.gradePoint} GP)
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Bar */}
                                        <div className="w-full flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percent}%` }}
                                                    transition={{
                                                        duration: 1,
                                                        ease: "easeOut",
                                                        delay: 0.1,
                                                    }}
                                                    className={`h-full rounded-full ${gradeInfo.lineBg}`}
                                                />
                                            </div>
                                            <span className={`text-xs font-mono font-semibold w-12 text-right ${gradeInfo.colorClass}`}>
                                                {totalMarks}/100
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="p-3 text-secondary text-xs text-center">
                                No subjects found for this semester.
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
