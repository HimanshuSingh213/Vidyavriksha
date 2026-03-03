"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/app/dashboard/UserContext';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function SettingOptions({ session }) {
    const [active, setActive] = useState(1);
    const { displayName, updateName } = useUser();
    const [localName, setLocalName] = useState(displayName);

    useEffect(() => {
        setLocalName(displayName);
    }, [displayName]);

    const handleSave = () => {
        updateName(localName);
        if (localName.length !== 0) alert(`Name changed to '${localName}' successfully!`);
        else alert(`Name is reverted back to ${session?.user?.name}.`)
    };

    return (
        <div className='mx-auto max-w-5xl'>
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
                                <input
                                    value={session?.user?.email}
                                    disabled={true}
                                    className='max-w-xl w-[320px] text-sm px-3 py-2 h-8 mt-1 bg-primary/5 outline outline-primary/10 focus:outline-primary/25 transition duration-200 ease-in-out rounded-lg text-secondary'
                                />
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='bg-primary/5 px-4 py-3 flex flex-row justify-between items-center'>
                            <p className='text-xs text-secondary'>Program data is used for curriculum mapping.</p>
                        </div>
                    </div>
                </div>
            )}

            {active === 2 && (
                <>

                </>
            )}

        </div>
    );
}