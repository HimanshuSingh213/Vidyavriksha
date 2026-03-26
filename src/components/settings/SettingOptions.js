"use client";
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/app/Context/UserContext';
import { updateUserSettings } from '@/actions/userSettings';
import SemMenu from './SemMenu';
import SemData from './SemData';
import AccountDelete from './AccountDelete';

export default function SettingOptions({ session }) {
    const [active, setActive] = useState(1);
    const {
        displayName, setDisplayName,
        program, setProgram,
        targetCGPA, setTargetCGPA,
        universityScale, setUniversityScale,
        currentCGPA, setCurrentCGPA,
        currentSem, setCurrentSem
    } = useUser();

    // Local state for form fields
    const [localName, setLocalName] = useState(displayName || "");
    const [localProgram, setLocalProgram] = useState(program || "CSE");
    const [localTargetCGPA, setLocalTargetCGPA] = useState(targetCGPA || 9.0);
    const [localUnivScale, setLocalUnivScale] = useState(universityScale || 10);
    const [localCurrentSem, setLocalCurrentSem] = useState(currentSem || 1);
    const [localCurrentCGPA, setLocalCurrentCGPA] = useState(currentCGPA || 0);

    const [isManualCGPA, setIsManualCGPA] = useState(!!currentCGPA && currentCGPA > 0);

    useEffect(() => {
        setLocalName(displayName || "");
        setLocalProgram(program || "CSE");
        setLocalTargetCGPA(targetCGPA || 9.0);
        setLocalUnivScale(universityScale || 10);
        setLocalCurrentSem(currentSem || 1);
        setLocalCurrentCGPA(currentCGPA || 0);
        setIsManualCGPA(!!currentCGPA && currentCGPA > 0);
    }, [displayName, program, targetCGPA, universityScale, currentCGPA, currentSem]);

    const courses = [
        { value: 'B.Tech CSE', label: 'B.Tech Computer Science & Engineering' },
        { value: 'B.Tech CSE (AI & ML)', label: 'B.Tech CSE Artificial Intelligence & Machine Learning' },
        { value: 'B.Tech CSE (DS)', label: 'B.Tech CSE Data Science' },
        { value: 'B.Tech CSE (CS)', label: 'B.Tech CSE Cyber Security' },
        { value: 'B.Tech CSE (CC)', label: 'B.Tech CSE Cloud Computing' },
        { value: 'B.Tech ME', label: 'B.Tech Mechanical Engineering' },
        { value: 'B.Tech EE', label: 'B.Tech Electrical Engineering' },
        { value: 'B.Tech CE', label: 'B.Tech Civil Engineering' },
        { value: 'B.Tech CHE', label: 'B.Tech Chemical Engineering' },
        { value: 'B.Tech AE', label: 'B.Tech Aerospace Engineering' },
        { value: 'B.Tech BT', label: 'B.Tech Biotechnology' },
        { value: 'B.Tech ECE', label: 'B.Tech Electronics & Communication Engineering' },
        { value: 'B.Tech IT', label: 'B.Tech Information Technology' },
        { value: 'B.Tech EP', label: 'B.Tech Engineering Physics' },
        { value: 'BBA', label: 'Bachelor of Business Administration' },
        { value: 'MBA', label: 'Master of Business Administration' },
        { value: 'MCA', label: 'Master of Computer Applications' },
        { value: 'BCA', label: 'Bachelor of Computer Applications' },
        { value: 'B.Com', label: 'Bachelor of Commerce' },
        { value: 'M.Com', label: 'Master of Commerce' },
        { value: 'B.Sc', label: 'Bachelor of Science' },
        { value: 'M.Sc', label: 'Master of Science' },
    ];


    const handleSave = async () => {
        try {
            await updateUserSettings({ name: localName });
            setDisplayName(localName);
            alert(`Settings updated successfully!`);
        } catch (error) {
            alert("Failed to update name.");
        }
    };

    const handleSaveProgram = async () => {
        try {
            const finalCGPA = isManualCGPA ? Number(localCurrentCGPA) : null;
            const res = await updateUserSettings({
                program: localProgram,
                targetCGPA: Number(localTargetCGPA),
                universityScale: Number(localUnivScale),
                currentSem: Number(localCurrentSem),
                currentCGPA: finalCGPA
            });

            if (!res.success) {
                alert(`Error: ${res.message}`);
                return;
            }
            
            if (setProgram) setProgram(localProgram);
            if (setTargetCGPA) setTargetCGPA(Number(localTargetCGPA));
            if (setUniversityScale) setUniversityScale(Number(localUnivScale));
            if (setCurrentSem) setCurrentSem(Number(localCurrentSem));
            if (setCurrentCGPA) setCurrentCGPA(finalCGPA);
            alert(`Academic details updated successfully!`);
        } catch (error) {
            alert("Failed to update academic details.");
        }
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}

                className='mx-auto max-w-4xl'
            >
                <div className='py-4'>
                    <ul className='p-4 border-b border-b-secondary/20 flex flex-row gap-8 items-center justify-start'>
                        {/* General Tab */}
                        <li
                            onClick={() => setActive(1)}
                            className={`relative cursor-default hover:text-primary font-medium text-sm transition duration-200 ease-in-out ${active === 1 ? 'text-primary' : 'text-secondary'}`}
                        >
                            General
                            {active === 1 && (
                                <motion.span
                                    layoutId="active-pill"
                                    className='absolute -bottom-[17px] left-0 bg-primary h-0.5 w-full'
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        opacity: { duration: 0.2 },
                                        layout: { type: "spring", bounce: 0.2, duration: 0.6 }
                                    }}
                                />
                            )}
                        </li>

                        {/* Academic Tab */}
                        <li
                            onClick={() => setActive(2)}
                            className={`relative cursor-default hover:text-primary font-medium text-sm transition duration-200 ease-in-out ${active === 2 ? 'text-primary' : 'text-secondary'}`}
                        >
                            Academic
                            {active === 2 && (
                                <motion.span
                                    layoutId="active-pill"
                                    className='absolute -bottom-[17px] left-0 bg-primary h-0.5 w-full'
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        opacity: { duration: 0.2 },
                                        layout: { type: "spring", bounce: 0.2, duration: 0.6 }
                                    }}
                                />
                            )}
                        </li>

                        {/* Account Tab */}
                        <li
                            onClick={() => setActive(3)}
                            className={`relative cursor-default hover:text-primary font-medium text-sm transition duration-200 ease-in-out ${active === 3 ? 'text-primary' : 'text-secondary'}`}
                        >
                            Account
                            {active === 3 && (
                                <motion.span
                                    layoutId="active-pill"
                                    className='absolute -bottom-[17px] left-0 bg-primary h-0.5 w-full'
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        opacity: { duration: 0.2 },
                                        layout: { type: "spring", bounce: 0.2, duration: 0.6 }
                                    }}
                                />
                            )}
                        </li>
                    </ul>
                </div>


                {active === 1 && (
                    <div className='space-y-8 mt-8'>
                        <div className='flex flex-col rounded-2xl overflow-hidden border border-primary/15'>
                            <div className='flex flex-col gap-1 justify-center items-start p-6 bg-obsidian/10'>
                                <h1 className='text-primary text-lg font-medium'>Display Name</h1>
                                <h3 className='text-secondary text-sm'>This is your name as it appears on the dashboard.</h3>
                                <input
                                    value={localName}
                                    onChange={(e) => setLocalName(e.target.value)}
                                    type="text"
                                    maxLength={32}
                                    className='max-w-xl w-[320px] text-sm px-3 py-2 h-8 mt-3 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg' />
                            </div>
                            <div className='bg-primary/5 px-4 py-3 flex flex-row justify-between items-center'>
                                <p className='text-xs text-secondary'>Please use 32 characters at maximum.</p>
                                <button
                                    onClick={handleSave}
                                    className='px-3 py-2 text-xs text-obsidian bg-primary rounded-xl font-medium'>Save
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col rounded-2xl overflow-hidden border border-primary/15'>
                            <div className='flex flex-col gap-1 justify-center items-start p-6 bg-obsidian/10'>
                                <h1 className='text-primary text-lg font-medium'>Email Address</h1>
                                <h3 className='text-secondary text-sm'>The email address associated with your account.</h3>
                                <input
                                    value={session?.user?.email}
                                    disabled={true}
                                    className='max-w-xl w-[320px] text-sm px-3 py-2 h-8 mt-3 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-secondary' />
                            </div>
                            <div className='bg-primary/5 px-4 py-3 flex flex-row justify-between items-center'>
                                <p className='text-xs text-secondary'>Email is managed via your Google Account.</p>
                            </div>
                        </div>
                        <div className='flex flex-col rounded-2xl overflow-hidden border border-primary/15'>
                            <div className='flex flex-col gap-1 justify-center items-start p-6 bg-obsidian/10'>
                                <h1 className='text-primary text-lg font-medium'>Academic Identity</h1>
                                <h3 className='text-secondary text-sm'>Your institutional program details.</h3>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full max-w-2xl mt-8'>
                                    {/* Degree Program */}
                                    <div className='flex flex-col justify-center items-start'>
                                        <p className='text-xs text-secondary'>Degree Program</p>
                                        <select
                                            value={localProgram}
                                            onChange={(e) => setLocalProgram(e.target.value)}
                                            className='max-w-xl w-[320px] text-sm px-3 py-1.5 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary appearance-none cursor-pointer'
                                        >
                                            {courses.map((course) => (
                                                <option key={course.label} value={course.value} className='bg-obsidian text-secondary'>
                                                    {course.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Current Semester */}
                                    <div className='flex flex-col justify-center items-start'>
                                        <p className='text-xs text-secondary'>Current Semester</p>
                                        <input
                                            value={localCurrentSem}
                                            onChange={(e) => setLocalCurrentSem(e.target.value)}
                                            type="number" min="1" max="10"
                                            className='w-full text-sm px-3 py-2 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]'
                                        />
                                    </div>

                                    {/* University Scale */}
                                    <div className='flex flex-col justify-center items-start'>
                                        <p className='text-xs text-secondary'>University Scale (e.g., 10.0)</p>
                                        <input
                                            value={localUnivScale}
                                            onChange={(e) => setLocalUnivScale(e.target.value)}
                                            type="number" step="0.1"
                                            className='w-full text-sm px-3 py-2 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]'
                                        />
                                    </div>

                                    {/* Target CGPA */}
                                    <div className='flex flex-col justify-center items-start'>
                                        <p className='text-xs text-secondary'>Target CGPA</p>
                                        <input
                                            value={localTargetCGPA}
                                            onChange={(e) => setLocalTargetCGPA(e.target.value)}
                                            type="number" step="0.01" max={localUnivScale}
                                            className='w-full text-sm px-3 py-2 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]'
                                        />
                                    </div>

                                    {/* CGPA Calculation Toggle */}
                                    <div className='col-span-1 md:col-span-2 flex items-center mt-2'>
                                        <label className='flex items-center cursor-pointer'>
                                            <div className='relative'>
                                                <input
                                                    type="checkbox"
                                                    className='sr-only'
                                                    checked={!isManualCGPA}
                                                    onChange={() => {
                                                        const nextManualState = !isManualCGPA;
                                                        setIsManualCGPA(nextManualState);
                                                        if (!nextManualState) setLocalCurrentCGPA(0);
                                                    }}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${!isManualCGPA ? 'bg-primary' : 'bg-primary/20'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-obsidian w-4 h-4 rounded-full transition-transform ${!isManualCGPA ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <div className='ml-3 text-sm text-secondary font-medium'>
                                                Auto-calculate CGPA from past semesters
                                            </div>
                                        </label>
                                    </div>

                                    {/* Manual Current CGPA Input */}
                                    <AnimatePresence>
                                        {isManualCGPA && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className='col-span-1 md:col-span-2 flex flex-col justify-center items-start overflow-hidden'
                                            >
                                                <p className='text-xs text-secondary'>Manual CGPA (Prior to current sem)</p>
                                                <input
                                                    value={localCurrentCGPA}
                                                    onChange={(e) => setLocalCurrentCGPA(e.target.value)}
                                                    type="number" step="0.01" max={localUnivScale}
                                                    className='w-1/2 text-sm px-3 py-2 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [appearance:textfield]'
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className='bg-primary/5 px-4 py-3 flex flex-row justify-between items-center'>
                                <p className='text-xs text-secondary'>Program data is used for curriculum mapping.</p>
                                <button
                                    onClick={handleSaveProgram}
                                    className='px-3 py-2 text-xs text-obsidian bg-primary rounded-xl font-medium'>Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {active === 2 && (
                    <div className='flex md:flex-row gap-12 space-y-12 '>
                        {/* Sem Selection */}
                        <div className='min-w-56'>
                            <p className='text-[10px] text-secondary p-3 font-semibold'>SEMESTERS</p>
                            <SemMenu />
                        </div>
                        {/* Sem Subject Data */}
                        <div className='w-full'>
                            <SemData />
                        </div>
                    </div>
                )}

                {active === 3 && (
                    <div>
                        <AccountDelete />
                    </div>
                )}

            </motion.div>
        </AnimatePresence>
    );
}
