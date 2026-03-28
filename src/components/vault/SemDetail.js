"use client";
import { getSemData } from "@/actions/semester";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
                    setSemSubjectData(res.data);
                    setSubjectNum(res.totalSubjects);
                    setCreditsNum(res.totalCredits);

                }
                else if (!res.success) {
                    console.error(res.error);
                }
            }
            catch (err) {
                console.error(err);
            }

        }

        fetchSemData();
        
    }, []);

    return (
        <>
            <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsSemOpen(!isSemOpen)}
                className={`rounded-2xl backdrop-blur-lg py-3 px-6 border  flex justify-between items-center transition duration-200
                             ${isSemOpen ? "bg-brand/5 border-brand/20" : "bg-primary/2 border-secondary/20"}`}>
                {/* Left */}
                <div className='left flex gap-2 justify-center items-center'>
                    <div><ChevronDown className={`size-4 transition duration-200 ${isSemOpen ? "rotate-180" : "rotate-0"}`} /></div>
                    <div>
                        <h2 className="text-primary font-semibold text-lg">Semester {semData.semData.semester}</h2>
                        <p className="text-secondary text-[10px] font-sans">{subjectNum} subjects · {creditsNum} credits</p>
                    </div>
                </div>
                {/* Right */}
                <div className='flex flex-col gap-0.5 justify-center'>
                    <p className='text-secondary text-[10px] text-center font-sans uppercase tracking-wide'>sgpa</p>
                    <h2 className='text-primary text-lg text-right font-bold font-mono'>{semData.semData.sgpa}</h2>
                </div>
            </motion.div>

            {/* Subjects List Dropdown */}
            <AnimatePresence>
                {isSemOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex flex-col gap-2 pl-4 overflow-hidden"
                    >
                    {semSubjectData.length > 0 ? (
                        semSubjectData.map((subject, index) => {
                            const totalMarks = (subject.marks?.internal ?? 0) + (subject.marks?.endsem ?? 0);
                            const percent = Math.min(totalMarks, 100);

                            return (
                                <motion.div 
                                initial={{opacity: 0, y: -15}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -15}}
                                key={subject.id || index} className="p-4 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-primary text-sm font-medium">{subject.name}</h3>
                                            <p className="text-secondary text-[10px] uppercase font-mono mt-0.5">{subject.code} • {subject.credits} Credits</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-secondary text-[8px] uppercase">Minor 1</p>
                                                <p className="text-primary text-xs font-mono">{subject.marks?.minor1 ?? '-'}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-secondary text-[8px] uppercase">Minor 2</p>
                                                <p className="text-primary text-xs font-mono">{subject.marks?.minor2 ?? '-'}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-secondary text-[8px] uppercase">Internal</p>
                                                <p className="text-primary text-xs font-mono">{subject.marks?.internal ?? '-'}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-secondary text-[8px] uppercase">End Sem</p>
                                                <p className="text-primary text-xs font-mono">{subject.marks?.endsem ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Status Bar */}
                                    <div className="w-full flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                                className={`h-full rounded-full ${percent >= 40 ? percent >= 75? "bg-success": "bg-warning" : "bg-danger"}`}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-secondary w-8 text-right">{totalMarks}</span>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-secondary text-xs text-center">No subjects found for this semester.</div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </>
    )
}
