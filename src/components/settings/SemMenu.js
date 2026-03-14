"use client";

import React, { useEffect, useState } from "react";
import { getSemesterSummaries, addingSemester, deleteSemester } from "@/actions/semester";
import { ChevronDown, Trash2Icon } from "lucide-react";
import UniversalModal from "@/components/ui/UniversalModal";
import { useUser } from "@/app/Context/UserContext";
import { motion } from "framer-motion";

export default function SemMenu() {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const alreadyAddedSems = semesters.map((sem) => sem.semester);
    const availableSems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((num) => !alreadyAddedSems.includes(num));

    const { selectedSem, setSelectedSem } = useUser();
    const [Sem, addSem] = useState(1);
    const [addSemLoading, setAddSemLoading] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        type: "info",
        confirmText: "Confirm",
        confirmDisabled: false,
        onConfirm: () => { }
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));


    const fetchSemData = async () => {
        const data = await getSemesterSummaries();
        return Array.isArray(data) ? data : [];
    };

    useEffect(() => {
        let active = true;

        async function loadSemesters() {
            try {
                const fetchedSemesters = await fetchSemData();

                if (!active) return;

                setSemesters(fetchedSemesters);

                if (fetchedSemesters.length > 0 && selectedSem === "") {
                    setSelectedSem(fetchedSemesters[0].id);
                }

                const existingNumbers = fetchedSemesters.map((sem) => sem.semester);
                const newAvailableSems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((num) => !existingNumbers.includes(num));

                if (newAvailableSems.length > 0) {
                    addSem(newAvailableSems[0]);
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
            const response = await addingSemester(Sem);
            
            if (response.success) {
                setModalConfig({
                    isOpen: true,
                    title: "Success",
                    description: `Semester ${Sem} added successfully!`,
                    type: "success",
                });
                const freshData = await fetchSemData();
                setSemesters(freshData);
            } else {
                setModalConfig({
                    isOpen: true,
                    title: "Error",
                    description: response.error || "Failed to add Semester.",
                    type: "error",
                });
            }

        } catch (err) {
            setModalConfig({
                isOpen: true,
                title: "Error",
                description: `Failed to add Semester.\n${err.message || err}`,
                type: "error",
            });
        } finally {
            setAddSemLoading(false);
        }
    }

    // const triggerDeleteSem = (semId, e) => {
    //     e.stopPropagation();
    //     setModalConfig({
    //         isOpen: true,
    //         title: "Delete Semester",
    //         description: "Are you sure you want to delete this semester? This action cannot be undone and deletes all its subjects too.",
    //         type: "confirm",
    //         confirmText: "Delete",
    //         confirmDisabled: false,
    //         onConfirm: () => handleDeleteSem(semId)
    //     });
    // };

    // const handleDeleteSem = async (semId) => {
    //     try {
    //         setModalConfig(prev => ({ ...prev, confirmDisabled: true, description: "Deleting..." }));
    //         const response = await deleteSemester(semId);
    //         if (response && response.success) {
    //             setModalConfig({
    //                 isOpen: true,
    //                 title: "Deleted",
    //                 description: "Semester deleted successfully.",
    //                 type: "success",
    //             });
    //             const freshData = await fetchSemData();
    //             setSemesters(freshData);
    //             if (selectedSem === semId) {
    //                 if (freshData.length > 0) setSelectedSem(freshData[0].id);
    //                 else setSelectedSem("");
    //             }
    //         } else {
    //             setModalConfig({
    //                 isOpen: true,
    //                 title: "Error",
    //                 description: response?.error || "Failed to delete semester.",
    //                 type: "error",
    //             });
    //         }
    //     } catch (err) {
    //         setModalConfig({
    //             isOpen: true,
    //             title: "Error",
    //             description: `Failed to delete semester.\n${err.message || err}`,
    //             type: "error",
    //         });
    //     }
    // };

    return (
        <>
            <UniversalModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                description={modalConfig.description}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                confirmDisabled={modalConfig.confirmDisabled}
                onConfirm={modalConfig.onConfirm}
            />

            {/* Displaying Current Semesters */}
            <ul className="space-y-2 w-full">
                {semesters.map((sem) => (
                    <li
                        key={sem.id}
                        onClick={() => setSelectedSem(sem.id)}
                        className={`w-full group text-xs flex cursor-default justify-between items-center text-primary ${selectedSem === sem.id ? "bg-primary/8" : ""} rounded-lg px-3 py-2 md:h-8.5`}
                    >
                        <span className="font-semibold">Semester {sem.semester}</span>
                        <Trash2Icon
                            // onClick={(e) => triggerDeleteSem(sem.id, e)}
                            className="size-3 opacity-0 group-hover:opacity-100 block text-danger transition duration-300 ease-in-out cursor-pointer hover:scale-110"
                        />
                    </li>
                ))}
            </ul>

            {/* Adding Semester */}
            <div className="mt-10">
                <header className="text-sm text-secondary mb-2">Add new semester:</header>
                <div className="flex items-center gap-3">

                    <div className="relative max-w-xl min-w-[120px] ">
                        <select
                            value={Sem}
                            onChange={(e) => addSem(e.target.value)}
                            className="w-full text-sm pl-3 pr-8 py-1.5 h-8 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary appearance-none cursor-pointer"
                        >
                            {availableSems.map((sem) => (
                                <option key={sem} value={sem} className="bg-obsidian text-secondary">
                                    Semester {sem}
                                </option>
                            ))}
                        </select>

                        {/* The Custom Arrow */}
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-primary opacity-70 pointer-events-none" />
                    </div>

                    <motion.button
                        onClick={handleAddSem}
                        disabled={addSemLoading}
                        whileTap={{scale: 0.98}}
                        className='px-3 py-2 text-xs text-obsidian bg-primary rounded-lg font-medium'>Add
                    </motion.button>
                </div>
            </div>
        </>
    );
}
