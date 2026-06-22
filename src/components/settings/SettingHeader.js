"use client";
import Image from 'next/image';
import React from 'react';
import { useUser } from '@/app/Context/UserContext';

function SettingHeader({ session }) {
    const { displayName } = useUser();
    const effectiveName = displayName || session?.user?.name;

    return (
        <div className='sticky top-0 bg-obsidian/90 backdrop-blur-md z-30 flex justify-between items-center border-b border-b-secondary/15 pb-3 pt-4 pl-14 md:pl-0 -mx-4 -mt-4 px-4 md:mx-0 md:mt-0 md:px-0'>
            {/* Left */}
            <div>
                <h1 className='text-lg sm:text-xl font-mono font-bold text-primary'>Settings</h1>
            </div>

            {/* Right */}
            <div className="flex flex-row items-center gap-2">
                <div className="max-w-60 hidden sm:block">
                    <p className="text-center truncate">{effectiveName}</p>
                </div>
                {session?.user?.image && (
                    <Image
                        src={session?.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full border border-white/8"
                    />
                )}
            </div>
        </div>
    );
}

export default SettingHeader;