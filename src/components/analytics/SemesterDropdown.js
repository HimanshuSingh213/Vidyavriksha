"use client"
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react'

export default function SemesterDropdown({totalSems, selectedSem}) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleSelect = (semId) => {
        setIsOpen(false);
        router.push(`${pathname}?sem=${semId}`, {scroll: false});
    }
    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className='relative text-sm select-none text-primary bg-primary/4 rounded-lg w-fit border border-primary/5 px-3 py-2 flex justify-center items-center md:gap-12 gap-6'>
            <p>Semester {selectedSem.semester}</p>
            <span><ChevronDown className='size-3 text-secondary' /></span>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className='absolute top-full left-0 bg-obsidian border border-primary/10 rounded-xl p-1 z-50'>
                        {totalSems.map((sem) => (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(sem._id);
                                }}
                                className='hover:bg-primary/10 rounded-lg px-3 py-2 flex justify-start items-center'
                                key={sem._id} value={sem._id}>
                                <p className='mr-6'>Semester {sem.semester}</p>
                                {selectedSem.semester === sem.semester && (
                                    <span><Check className='text-secondary size-4' /></span>
                                )}

                            </div>
                        ))}
                    </motion.div>
                )}

            </AnimatePresence>


        </div>
    )
}
