"use client";
import Image from 'next/image';
import React from 'react';
import { useUser } from '@/app/Context/UserContext';

function SettingHeader({ session }) {
    const { displayName } = useUser();
    const effectiveName = displayName || session?.user?.name;

    return (
        <div className='flex justify-between items-center border-b border-b-secondary/15 pb-2'>
            {/* Left */}
            <div>
                <h1 className='text-2xl font-mono font-bold text-primary'>Settings</h1>
            </div>

            {/* Right */}
            <div className="flex flex-row items-center gap-2">
                <div className="max-w-60">
                    <p className="text-center">{effectiveName}</p>
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