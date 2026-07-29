import React from "react";
import Link from "next/link";
import { getDetailedSemesterMarksheet } from "@/actions/semester";
import { ArrowLeft, Award, BookOpen, CheckCircle2, AlertTriangle, FileText, Star } from "lucide-react";
import DownloadPDFButton from "./DownloadPDFButton";

export default async function SemesterMarksheetPage({ params }) {
    const { semId } = await params;
    const res = await getDetailedSemesterMarksheet(semId);

    if (!res || !res.success || !res.data) {
        return (
            <div className="min-h-screen bg-obsidian text-primary flex flex-col items-center justify-center p-6 font-sans">
                <div className="p-8 rounded-2xl bg-white/2 border border-white/10 text-center max-w-md">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Marksheet Not Found</h1>
                    <p className="text-secondary text-sm mb-6">
                        {res?.error || "We couldn't load the requested semester mark sheet."}
                    </p>
                    <Link
                        href="/dashboard/vault"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white font-medium rounded-xl hover:bg-brand/90 transition-all text-xs"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Vault
                    </Link>
                </div>
            </div>
        );
    }

    const {
        semesterNumber,
        status,
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
        user,
        subjects
    } = res.data;

    const getGradeBadge = (grade) => {
        switch (grade) {
            case "O": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            case "A+": return "bg-green-500/10 text-green-400 border-green-500/30";
            case "A": return "bg-teal-500/10 text-teal-400 border-teal-500/30";
            case "B+": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
            case "B": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
            case "C": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
            case "P": return "bg-orange-500/10 text-orange-400 border-orange-500/30";
            default: return "bg-rose-500/10 text-rose-400 border-rose-500/30";
        }
    };

    const getProgressColor = (marks) => {
        if (marks >= 90) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
        if (marks >= 75) return "bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.4)]";
        if (marks >= 65) return "bg-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.4)]";
        if (marks >= 55) return "bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]";
        if (marks >= 50) return "bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.4)]";
        if (marks >= 45) return "bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]";
        if (marks >= 40) return "bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.4)]";
        return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]";
    };

    const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-full bg-obsidian p-4 md:p-10 font-sans text-primary print:bg-white print:p-0 print:text-black">
            <div className="block print:hidden">
                <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
                    <Link
                        href="/dashboard/vault"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-primary transition-all text-xs font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Vault
                    </Link>

                    <div className="flex items-center gap-3">
                        <DownloadPDFButton fileName={`Vidyavriksha_Semester_${semesterNumber}_Marksheet.pdf`} />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-brand/10 via-primary/5 to-white/2 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2.5 py-0.5 rounded-md bg-brand/20 text-brand text-xs font-mono font-bold tracking-wider uppercase border border-brand/30">
                                        Semester {semesterNumber}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold uppercase border ${
                                        status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                    }`}>
                                        {status}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-primary">
                                    Official Academic Statement
                                </h1>
                                <p className="text-xs md:text-sm text-secondary mt-1">
                                    {user.program} • {user.name} ({user.email})
                                </p>
                            </div>

                            <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 ${
                                backCount > 0
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            }`}>
                                {backCount > 0 ? (
                                    <AlertTriangle className="w-5 h-5" />
                                ) : (
                                    <Award className="w-5 h-5" />
                                )}
                                <div>
                                    <p className="text-[10px] uppercase font-mono tracking-wider opacity-75">Academic Standing</p>
                                    <p className="text-xs font-bold font-sans">{academicStanding}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="p-4 md:p-5 rounded-xl bg-white/2 border border-white/8 backdrop-blur-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-secondary tracking-wider">Total Marks</span>
                                <div className="p-2 rounded-lg bg-brand/10 text-brand">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl md:text-2xl font-bold font-mono text-primary">{totalObtainedMarks}</span>
                                    <span className="text-xs font-mono text-secondary">/ {maxPossibleMarks}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand/20 text-brand border border-brand/30">
                                        {percentage}%
                                    </span>
                                    <span className="text-[10px] text-secondary">Overall Score</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-5 rounded-xl bg-white/2 border border-white/8 backdrop-blur-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-secondary tracking-wider">Semester SGPA</span>
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                    <Star className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xl md:text-2xl font-bold font-mono text-amber-400">{sgpa.toFixed(2)}</span>
                                <p className="text-[10px] text-secondary mt-2">Grade Point Average</p>
                            </div>
                        </div>

                        <div className="p-4 md:p-5 rounded-xl bg-white/2 border border-white/8 backdrop-blur-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-secondary tracking-wider">Credits Earned</span>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">{earnedCredits}</span>
                                    <span className="text-xs font-mono text-secondary">/ {totalRegisteredCredits}</span>
                                </div>
                                <p className="text-[10px] text-secondary mt-2">
                                    {backCount > 0 ? `${backCount} course(s) pending credit` : "All credits completed"}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 md:p-5 rounded-xl bg-white/2 border border-white/8 backdrop-blur-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-secondary tracking-wider">Quality Points</span>
                                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl md:text-2xl font-bold font-mono text-teal-400">{qualityPointsEarned}</span>
                                    <span className="text-xs font-mono text-secondary">/ {qualityPointsMax}</span>
                                </div>
                                <p className="text-[10px] text-secondary mt-2">Σ (Credits × Grade Points)</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-5 rounded-xl bg-white/2 border border-white/8 backdrop-blur-xl">
                        <h3 className="text-xs font-mono uppercase text-secondary tracking-wider mb-3">Grade Distribution Summary</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(gradeCounts).map(([gr, cnt]) => {
                                if (cnt === 0) return null;
                                return (
                                    <div key={gr} className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getGradeBadge(gr)}`}>
                                        <span className="text-xs font-bold font-mono">{gr}</span>
                                        <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.2 rounded bg-white/10">{cnt} {cnt === 1 ? "Subject" : "Subjects"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/2 backdrop-blur-xl overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-white/8 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-primary font-serif">Course-wise Evaluation Breakdown</h3>
                            <span className="text-xs text-secondary font-mono">{subjects.length} Total Courses</span>
                        </div>

                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left text-xs font-sans min-w-180">
                                <thead className="bg-white/5 text-secondary uppercase font-mono text-[10px] tracking-wider border-b border-white/8">
                                    <tr>
                                        <th className="py-3 px-4 min-w-40 whitespace-nowrap">Course Name & Code</th>
                                        <th className="py-3 px-3 text-center whitespace-nowrap">Credits</th>
                                        <th className="py-3 px-3 text-center whitespace-nowrap">Minor 1</th>
                                        <th className="py-3 px-3 text-center whitespace-nowrap">Minor 2</th>
                                        <th className="py-3 px-3 text-center whitespace-nowrap">Internal</th>
                                        <th className="py-3 px-3 text-center whitespace-nowrap">End Sem</th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Total Marks</th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Grade (GP)</th>
                                        <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-primary">
                                    {subjects.map((sub) => (
                                        <tr key={sub.id} className={`hover:bg-white/2 transition-colors ${sub.isBack ? "bg-rose-500/5" : ""}`}>
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-sm text-primary">{sub.name}</div>
                                                <div className="text-[10px] text-secondary font-mono uppercase mt-0.5 flex items-center gap-1.5">
                                                    <span>{sub.code}</span>
                                                    {sub.isLab && (
                                                        <span className="px-1.5 py-0.2 text-[8px] font-mono rounded bg-brand/10 text-brand border border-brand/20">
                                                            LAB
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono font-semibold whitespace-nowrap">{sub.credits}</td>
                                            <td className="py-3.5 px-3 text-center font-mono text-secondary whitespace-nowrap">
                                                {sub.isLab ? <span className="italic text-secondary/40">N/A</span> : (sub.marks?.minor1 ?? "-")}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono text-secondary whitespace-nowrap">
                                                {sub.isLab ? <span className="italic text-secondary/40">N/A</span> : (sub.marks?.minor2 ?? "-")}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono text-secondary whitespace-nowrap">{sub.marks?.internal ?? "-"}</td>
                                            <td className="py-3.5 px-3 text-center font-mono text-secondary whitespace-nowrap">{sub.marks?.endsem ?? "-"}</td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="font-mono font-bold text-xs">{sub.totalMarks} / 100</span>
                                                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${getProgressColor(sub.totalMarks)}`}
                                                            style={{ width: `${Math.min(sub.totalMarks, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded font-mono font-bold text-xs border inline-block whitespace-nowrap ${getGradeBadge(sub.grade)}`}>
                                                    {sub.grade} ({sub.gradePoint} GP)
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                {sub.isBack ? (
                                                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse inline-block whitespace-nowrap">
                                                        Back
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-block whitespace-nowrap">
                                                        Pass
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* DEDICATED MARKSHEET DOCUMENT CONTAINER (TARGETED BY HTML2CANVAS & PRINT) */}
            <div
                id="official-marksheet-document"
                className="hidden print:block print:w-full print:max-w-none p-8 bg-white text-slate-900 font-serif relative"
                style={{ width: "800px", margin: "0 auto" }}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden opacity-8">
                    <p className="text-7xl font-bold font-serif uppercase tracking-widest text-slate-900 -rotate-30 select-none border-4 border-slate-900 px-10 py-4">
                        VIDYAVRIKSHA
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                        <h1 className="text-2xl font-bold font-serif uppercase tracking-wider text-slate-900">
                            VIDYAVRIKSHA ACADEMIC TRANSCRIPT
                        </h1>
                        <p className="text-xs font-sans text-slate-600 uppercase tracking-widest mt-1">
                            Official Statement of Evaluation & Marks Breakdown
                        </p>
                    </div>

                    <div className="mb-6 border border-slate-800 rounded-sm overflow-hidden text-xs font-sans">
                        <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-800 uppercase text-[10px] tracking-wider text-slate-800">
                            Student & Academic Profile
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
                            <div className="p-2.5 flex flex-col gap-1">
                                <div><span className="font-semibold text-slate-700">Student Name:</span> {user.name}</div>
                                <div><span className="font-semibold text-slate-700">Email Address:</span> {user.email}</div>
                                <div><span className="font-semibold text-slate-700">Program:</span> {user.program}</div>
                            </div>
                            <div className="p-2.5 flex flex-col gap-1">
                                <div><span className="font-semibold text-slate-700">Semester:</span> Semester {semesterNumber} ({status})</div>
                                <div><span className="font-semibold text-slate-700">Academic Standing:</span> {academicStanding}</div>
                                <div><span className="font-semibold text-slate-700">Statement Date:</span> {formattedDate}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 divide-x divide-slate-800 bg-slate-50 p-2.5 text-center font-mono">
                            <div>
                                <p className="text-[9px] uppercase text-slate-500 font-sans">Cumulative CGPA</p>
                                <p className="text-sm font-bold text-slate-900">{user.cgpa ? Number(user.cgpa).toFixed(2) : "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase text-slate-500 font-sans">Semester SGPA</p>
                                <p className="text-sm font-bold text-slate-900">{Number(sgpa).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase text-slate-500 font-sans">Percentage</p>
                                <p className="text-sm font-bold text-slate-900">{percentage}%</p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase text-slate-500 font-sans">Total Marks Obtained</p>
                                <p className="text-sm font-bold text-slate-900">{totalObtainedMarks} / {maxPossibleMarks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-800 mb-2">
                            Course Evaluation Details ({subjects.length} Subjects • {earnedCredits}/{totalRegisteredCredits} Credits Earned)
                        </h2>
                        <table className="w-full text-left text-[11px] font-sans border-collapse border border-slate-800">
                            <thead>
                                <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[9px] border-b border-slate-800">
                                    <th className="p-2 border-r border-slate-800 text-center w-8">#</th>
                                    <th className="p-2 border-r border-slate-800">Course Code & Title</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Type</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Credits</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Minor 1</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Minor 2</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Internal</th>
                                    <th className="p-2 border-r border-slate-800 text-center">End Sem</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Total</th>
                                    <th className="p-2 border-r border-slate-800 text-center">Grade</th>
                                    <th className="p-2 border-r border-slate-800 text-center">GP</th>
                                    <th className="p-2 text-center">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-400">
                                {subjects.map((sub, idx) => (
                                    <tr key={sub.id} className="border-b border-slate-300">
                                        <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-600">{idx + 1}</td>
                                        <td className="p-2 border-r border-slate-300">
                                            <div className="font-semibold text-slate-900">{sub.name}</div>
                                            <div className="text-[9px] font-mono text-slate-500">{sub.code}</div>
                                        </td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono uppercase text-[9px]">
                                            {sub.isLab ? "LAB" : "THEORY"}
                                        </td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">{sub.credits}</td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">
                                            {sub.isLab ? "N/A" : (sub.marks?.minor1 ?? "-")}
                                        </td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">
                                            {sub.isLab ? "N/A" : (sub.marks?.minor2 ?? "-")}
                                        </td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">{sub.marks?.internal ?? "-"}</td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">{sub.marks?.endsem ?? "-"}</td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{sub.totalMarks}</td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{sub.grade}</td>
                                        <td className="p-2 border-r border-slate-300 text-center font-mono">{sub.gradePoint}</td>
                                        <td className="p-2 text-center font-mono font-bold text-[10px]">
                                            {sub.isBack ? (
                                                <span className="text-rose-700 uppercase">BACK</span>
                                            ) : (
                                                <span className="text-emerald-700 uppercase">PASS</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-12 pt-4 border-t border-slate-800 flex justify-between items-end text-[10px] font-sans text-slate-600">
                        <div>
                            <p className="font-semibold text-slate-800">Generated Electronically via Vidyavriksha Student Portal</p>
                            <p>This statement contains official academic evaluation data recorded for {user.name}.</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono font-bold text-slate-800 uppercase tracking-widest">AUTHENTICATED TRANSCRIPT</p>
                            <p className="italic text-slate-500">No physical signature required</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
