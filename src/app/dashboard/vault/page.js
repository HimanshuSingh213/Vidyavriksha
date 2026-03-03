import dbConnect from '@/lib/db'
import { Semester } from '@/models/semester.model';
import React from 'react'
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';

async function VaultPage() {
  const session = await auth();

  if(!session) redirect("/login");
  const userId = session?.user?.id;

  // Calculating all Historical SemesterWise Data
  await dbConnect();
  const TotalSemesters = Semester.find({
    userId,
  }).lean()
  return (
    <div className='min-h-full bg-obsidian p-6 md:p-10 font-sans'>
      {/* Heading */}
      <div className='bg-neutral-900 rounded-2xl backdrop-blur-lg p-3 border border-secondary/20'>
      {/* Left */}
        <div className='left flex flex-col justify-center items-start'>
          <h4 className='text-sm text-primary font-serif font-semibold'>Academic Record</h4>
          <p className='text-xs text-secondary '>Btech CSE-DS</p>
        </div>
        {/* Right */}
        <div>

        </div>
      </div>
    </div>
  )
}

export default VaultPage