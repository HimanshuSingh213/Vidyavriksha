"use client";
import React, { useEffect, useState } from 'react'
import { getVaultData } from '@/actions/vault';
import { Loader2 } from 'lucide-react';
import { SemDetail } from '@/components/vault/SemDetail';

function VaultPage() {
  const [totalSems, setTotalSems] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchVault = async () => {
      try {
        const data = await getVaultData();
        if (data) {
          setTotalCredits(data.totalCredits);
          setTotalSems(data.TotalSemesters);
          setUserData(data.userData);
        }

      } catch (err) {
        console.error("Failed to fetch vault data:", err);
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchVault();
  }, [])

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="animate-spin text-brand w-8 h-8" />
      </div>
    );
  }

  return (
    <div className='min-h-full bg-obsidian p-6 md:p-10 font-sans'>
      {/* Heading */}
      <div className='bg-primary/8 rounded-sm backdrop-blur-lg py-3 px-6 border border-secondary/20 flex justify-between items-center'>
        {/* Left */}
        <div className='left flex flex-col justify-center items-start'>
          <h4 className='text-sm text-primary font-serif font-semibold'>Academic Record</h4>
          <p className='text-xs text-secondary '>{userData?.program || "N/A"}</p>
        </div>
        {/* Right */}
        <div className='flex items-center justify-center gap-4'>
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
  )
}

export default VaultPage