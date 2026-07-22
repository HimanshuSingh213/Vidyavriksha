import React from 'react';
import { getVaultData } from '@/actions/vault';
import { SemDetail } from '@/components/vault/SemDetail';

export default async function VaultPage() {
  const data = await getVaultData();
  const totalSems = data?.TotalSemesters || [];
  const totalCredits = data?.totalCredits || 0;
  const userData = data?.userData || null;

  return (
    <div className='min-h-full bg-obsidian p-4 md:p-10 font-sans'>
      {/* Heading */}
      <div className='bg-primary/8 rounded-sm backdrop-blur-lg py-3 px-4 sm:px-6 border border-secondary/20 flex justify-between items-center'>
        {/* Left */}
        <div className='left flex flex-col justify-center items-start'>
          <h4 className='text-sm text-primary font-serif font-semibold'>Academic Record</h4>
          <p className='text-xs sm:text-sm text-secondary '>{userData?.program || "N/A"}</p>
        </div>
        {/* Right */}
        <div className='flex items-center justify-center gap-3 sm:gap-4'>
          <div className='flex flex-col gap-0.5 justify-center'>
            <p className='text-secondary text-[10px] text-center font-sans uppercase tracking-wide'>Semesters</p>
            <h2 className='text-primary text-lg text-right font-bold font-mono'>{totalSems.length}</h2>
          </div>
          <div className='flex flex-col gap-0.5 justify-center'>
            <p className='text-secondary text-[10px] text-center font-sans uppercase tracking-wide'>total Credits</p>
            <h2 className='text-primary text-lg text-right font-bold font-mono'>{totalCredits}</h2>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 mt-4 max-w-5xl mx-auto'>
        {totalSems.map((sem) => (
          <div key={sem._id}>
            <SemDetail semData={sem} />
          </div>
        ))}
      </div>
    </div>
  );
}