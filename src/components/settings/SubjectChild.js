import updateSubjectMarks, { deleteSubject } from '@/actions/subject';
import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

function SubjectChild({ subject, setModalConfig, setToastConfig, refreshData }) {

    const [isOpen, setIsOpen] = useState(false)

    const [minor1, setMinor1] = useState(subject.marks.minor1);
    const [minor2, setMinor2] = useState(subject.marks.minor2);
    const [internal, setInternal] = useState(subject.marks.internal);
    const [endsem, setEndsem] = useState(subject.marks.endsem);

    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isDifferent =
        Number(minor1) !== subject.marks.minor1 ||
        Number(minor2) !== subject.marks.minor2 ||
        Number(internal) !== subject.marks.internal ||
        Number(endsem) !== subject.marks.endsem;

    const handleSaveMarks = async () => {
        try {
            setIsUpdating(true);

            const marks = {
                minor1: Number(minor1),
                minor2: Number(minor2),
                internal: Number(internal),
                endsem: Number(endsem)
            };

            const response = await updateSubjectMarks(subject.id, marks);

            if (response && response.success) {
                setToastConfig({
                    isOpen: true,
                    title: "Success",
                    description: "Marks saved successfully!",
                    type: "success"
                });

                if (refreshData) refreshData();
            } else {
                setToastConfig({
                    isOpen: true,
                    title: "Error",
                    description: response?.error || "Failed to save marks.",
                    type: "error"
                });
            }
        }
        catch (err) {
            setToastConfig({
                isOpen: true,
                title: "Error",
                description: err.message || "Failed to save marks.",
                type: "error"
            });
        }
        finally {
            setIsUpdating(false);
        }

    }

    const handleDeleteSubject = () => {
        setModalConfig({
            isOpen: true,
            title: "Delete Subject",
            description: `Are you sure you want to delete ${subject.name} (${subject.code})? This action cannot be undone.`,
            type: "confirm",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    setIsDeleting(true);
                    setModalConfig(prev => ({ ...prev, confirmDisabled: true }));
                    
                    const response = await deleteSubject(subject.id);

                    if (response && response.success) {
                        setModalConfig(prev => ({...prev, isOpen: false}));
                        setToastConfig({
                            isOpen: true,
                            title: "Success",
                            description: "Subject deleted successfully!",
                            type: "success"
                        });
                        
                        if (refreshData) refreshData();
                    } else {
                        setModalConfig(prev => ({...prev, isOpen: false}));
                        setToastConfig({
                            isOpen: true,
                            title: "Error",
                            description: response?.error || "Failed to delete subject.",
                            type: "error"
                        });
                    }
                } catch (err) {
                    setModalConfig(prev => ({...prev, isOpen: false}));
                    setToastConfig({
                        isOpen: true,
                        title: "Error",
                        description: err.message || "Failed to delete subject.",
                        type: "error"
                    });
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    }

    return (
        <>
            <div className='rounded-xl select-none border border-primary/10 bg-primary/2 overflow-hidden'>
                <div onClick={() => setIsOpen(!isOpen)}
                    className='flex items-center justify-between p-4 hover:bg-primary/4 transition-colors duration-150 cursor-pointer'>
                    {/* left */}
                    <div className='flex items-center gap-3'>
                        <span className='py-1.5 px-2 bg-primary/5 text-secondary text-xs font-mono border border-primary/15 rounded-md'>{subject.code}</span>
                        <h3 className='text-sm text-primary truncate'>{subject.name}</h3>
                    </div>
                    {/* Right */}
                    <div className='flex items-center gap-3'>
                        <p className='text-[10px] text-secondary font-mono font-medium'>{subject.credits} CREDITS</p>
                        <ChevronDown className={`size-3 text-secondary transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {/* The Drawer */}
                <div
                    className={`grid transition-all duration-300 ease-in-out border-t border-t-primary/10 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 mt-0 "}`}
                >
                    <div className='overflow-hidden'>
                        {/* actual content inside the drawer */}
                        <div className='p-6 grid grid-cols-2 sm:grid-cols-4 gap-6'>

                            <div className='flex flex-col items-start gap-1'>
                                <span className='text-[10px] text-secondary  tracking-wider'>MINOR 1</span>
                                <div className='relative'>
                                    <input
                                        value={minor1}
                                        onChange={(e) => setMinor1(e.target.value)}
                                        type="number" name="minor1"
                                        className='rounded-lg h-full border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full
                                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]
                                '
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col items-start gap-1'>
                                <span className='text-[10px] text-secondary  tracking-wider'>MINOR 2</span>
                                <div className='relative'>
                                    <input
                                        value={minor2}
                                        onChange={(e) => setMinor2(e.target.value)}
                                        type="number" name="minor2"
                                        className='rounded-lg h-full border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full
                                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]
                                '
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col items-start gap-1'>
                                <span className='text-[10px] text-secondary  tracking-wider'>INTERNAL</span>
                                <div className='relative'>
                                    <input
                                        value={internal}
                                        onChange={(e) => setInternal(e.target.value)}
                                        max={40}
                                        type="number" name="internal"
                                        className='rounded-lg h-full border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full
                                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]
                                '
                                    />
                                    <span className='text-secondary/60 font-mono cursor-default text-xs absolute top-1/2 right-1/10 -translate-y-1/2'>/40</span>
                                </div>
                            </div>

                            <div className='flex flex-col items-start gap-1'>
                                <span className='text-[10px] text-secondary tracking-wider'>END SEM</span>
                                <div className='relative'>
                                    <input
                                        value={endsem}
                                        onChange={(e) => setEndsem(e.target.value)}
                                        max={60}
                                        type="number" name="endsem"
                                        className='rounded-lg h-full border text-xs text-primary border-primary/10 bg-primary/5 focus:ring focus:ring-primary/15 focus:outline-none transition-all duration-200 px-2 py-1 w-full
                                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]
                                '
                                    />
                                    <span className='text-secondary/60 font-mono cursor-default text-xs absolute top-1/2 right-1/10 -translate-y-1/2'>/60</span>
                                </div>
                            </div>

                        </div>

                        <div className='flex items-center justify-between border-t border-t-primary/10 bg-primary/6 px-5 py-2'>
                            <p onClick={handleDeleteSubject} className={`text-xs hover:underline text-danger transition-colors ${isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>{isDeleting ? "Deleting..." : "Delete Subject"}</p>
                            <button
                                onClick={handleSaveMarks}
                                disabled={isUpdating || !isDifferent}
                                className={`px-3 py-2 text-xs text-obsidian  rounded-xl font-medium cursor-pointer transition-colors ${isUpdating || !isDifferent ? "bg-primary/40" : "bg-primary"}`}>
                                {isUpdating ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}

export default SubjectChild