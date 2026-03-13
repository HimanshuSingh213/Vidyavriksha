"use client";

import React, { useEffect, useState } from "react";
import { getSemesterSummaries, addingSemester } from "@/actions/semester";
import { ChevronDown, Trash2Icon } from "lucide-react";

export default function SemMenu() {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSem, setSelectedSem] = useState("");
    const [Sem, addSem] = useState(0);
    const [addSemLoading, setAddSemLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadSemesters() {
            try {
                const data = await getSemesterSummaries();
                if (!active) return;
                const fetchedSemesters = Array.isArray(data) ? data : [];
                setSemesters(fetchedSemesters);

                if (fetchedSemesters.length > 0) {
                    setSelectedSem(fetchedSemesters[0].id);
                }
            } catch (err) {
                if (!active) return;
                setError("Failed to load semesters");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadSemesters();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <div className="text-xs text-secondary p-3">Loading semesters...</div>;
    }

    if (error) {
        return <div className="text-xs text-danger p-3">{error}</div>;
    }

    if (semesters.length === 0) {
        return <div className="text-xs text-secondary p-3">No semesters found.</div>;
    }

    const handleAddSem = async () => {
        try {
            setAddSemLoading(true);
            if (Sem != 0)
            await addingSemester(Sem);
        } catch (err) {
           alert("Failed to add Semester.");
        } finally {
            setAddSemLoading(false);
        }
    }

    return (
        <>

            {/* Displaying Current Semesters */}
            <ul className="space-y-2 w-full">
                {semesters.map((sem) => (
                    <li
                        key={sem.id}
                        onClick={() => setSelectedSem(sem.id)}
                        className={`w-full group text-xs flex justify-between items-center text-primary ${selectedSem === sem.id ? "bg-primary/5 border border-primary/10" : ""} rounded-lg px-3 py-2`}
                    >
                        <span className="font-semibold">Semester {sem.semester}</span>
                        <Trash2Icon className="size-3 opacity-0 group-hover:opacity-100 block text-danger transition duration-300 ease-in-out" />
                    </li>
                ))}
            </ul>

            {/* Adding Semester */}
            <div className="mt-10">
                <header className="text-sm text-secondary mb-2">Add new semester:</header>
                <div className="flex items-center gap-3">

                    <div className="relative max-w-xl w-[120px] ">
                        <select
                            value={Sem}
                            onChange={(e) => addSem(e.target.value)}
                            className="w-full text-sm pl-3 pr-8 py-1.5 h-8 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary appearance-none cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                                <option key={sem} value={sem} className="bg-obsidian text-secondary">
                                    Semester {sem}
                                </option>
                            ))}
                        </select>

                        {/* The Custom Arrow */}
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-primary opacity-70 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAddSem}
                        disabled={addSemLoading}
                        className='px-3 py-2 text-xs text-obsidian bg-primary rounded-xl font-medium'>Add
                    </button>
                </div>
            </div>
        </>
    );
}
