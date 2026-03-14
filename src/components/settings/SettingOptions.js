"use client";
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/app/Context/UserContext';
import { updateUserSettings } from '@/actions/userSettings';
import SemMenu from './SemMenu';
import SemData from './SemData';

export default function SettingOptions({ session }) {
    const [active, setActive] = useState(1);
    const { displayName, setDisplayName, program, setProgram } = useUser();
    const [localName, setLocalName] = useState(displayName);
    const [localProgram, setLocalProgram] = useState(program);

    useEffect(() => {
        setLocalName(displayName);
    }, [displayName]);

    useEffect(() => {
        setLocalProgram(program);
    }, [program]);

    const courses = [
        { value: 'CSE', label: 'Computer Science & Engineering' },
        { value: 'CSE (AI & ML)', label: 'CSE Artificial Intelligence & Machine Learning' },
        { value: 'CSE (DS)', label: 'CSE Data Science' },
        { value: 'CSE (CS)', label: 'CSE Cyber Security' },
        { value: 'CSE (CC)', label: 'CSE Cloud Computing' },
        { value: 'ME', label: 'Mechanical Engineering' },
        { value: 'EE', label: 'Electrical Engineering' },
        { value: 'CE', label: 'Civil Engineering' },
        { value: 'CHE', label: 'Chemical Engineering' },
        { value: 'AE', label: 'Aerospace Engineering' },
        { value: 'BT', label: 'Biotechnology' },
        { value: 'ECE', label: 'Electronics & Communication Engineering' },
        { value: 'IT', label: 'Information Technology' },
        { value: 'EP', label: 'Engineering Physics' },
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
            await updateUserSettings({ program: localProgram });
            setProgram(localProgram);
            alert(`Academic details updated successfully!`);
        } catch (error) {
            alert("Failed to update program.");
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
                                <div className='flex flex-col justify-center items-start mt-8'>
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
                            <SemData/>
                        </div>
                    </div>
                )}

            </motion.div>
        </AnimatePresence>
    );
}
