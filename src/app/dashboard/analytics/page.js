"use client";
import stackedMarksData, { fetchDistributedBarGraph, fetchSGPAProgressionChart, getSems, RadialChartData } from '@/actions/analyticCharts';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import MarksStackedChart from '@/components/analytics/MarksStackedChart';
import React, { useEffect, useState } from 'react';
import Toast from '@/components/ui/Toast';
import RadialChart from '@/components/analytics/RadialChart';
import DistributedBarGraph from '@/components/analytics/DistributedBarGraph';
import SgpaProgressChart from '@/components/analytics/SGPAProgressionChart';
import { useUser } from '@/app/Context/UserContext';

function AnalyticsPage() {

  const [totalSems, setTotalSems] = useState([]);
  const [selectedSem, setSelectedSem] = useState({});
  const [stackedData, setStackedData] = useState({});
  const [radialData, setRadialData] = useState({});
  const [distributedGraphData, setDistributedGraphData] = useState({});
  const [sgpaProgressionData, setSgpaProgressionData] = useState({});
  const { targetCGPA } = useUser()
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast State
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    type: "info"
  });
  const closeToast = () => setToastConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const fetchSemsData = async () => {
      try {
        const data = await getSems();

        if (data && data.length > 0) {
          setTotalSems(data);
          setSelectedSem(data[0]);
        } else {
          setTotalSems([]);
          setIsLoading(false);
        }

      } catch (err) {
        console.error('Error while fetching SemData');
        setIsLoading(false);
      }
    }

    fetchSemsData();
  }, [])

  useEffect(() => {
    const fetchMarksData = async () => {
      if (!selectedSem || !selectedSem._id) return;

      setIsLoading(true);
      try {
        const [res1, res2, res3, res4] = await Promise.all([
          stackedMarksData(selectedSem._id),
          RadialChartData(selectedSem._id),
          fetchDistributedBarGraph(selectedSem._id),
          fetchSGPAProgressionChart()
        ])

        if (res1.success && res2.success && res3.success && res4.success) {
          setStackedData(res1.data);
          setRadialData(res2.data);
          setDistributedGraphData(res3.data);
          setSgpaProgressionData(res4.data);
        }
        else {
          setToastConfig({
            isOpen: true,
            title: "Error",
            description: res1.error || "Failed to fetch Semester details.",
            type: "error",
          });
        }
      } catch (err) {
        setToastConfig({
          isOpen: true,
          title: "Error",
          description: `Failed to fetch Semester details.\n${err.message || err}`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchMarksData();
  }, [selectedSem])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="animate-spin text-brand w-8 h-8" />
      </div>
    );
  }

  if (!totalSems || totalSems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-secondary/80 text-sm font-medium">
              No semester is added. Please add a semester from the settings tab.
          </p>
      </div>
    );
  }

  return (
    <>
      <Toast
        isOpen={toastConfig.isOpen}
        onClose={closeToast}
        title={toastConfig.title}
        description={toastConfig.description}
        type={toastConfig.type}
      />

      <div className='p-6 md:p-10'>

        {/* Upper Deck */}
        <div>
          {/* Sem Selection */}
          <div className='flex justify-start items-center rounded-xl bg-primary/3 border-2 border-primary/5 px-4 py-5'>
            <div className='flex justify-center items-center gap-4'>
              <p className='text-sm text-primary font-medium'>Select Semester:</p>
              <div
                onClick={() => setSelectionOpen(!selectionOpen)}
                className='relative text-sm select-none text-primary bg-primary/4 rounded-lg w-fit border border-primary/5 px-3 py-2 flex justify-center items-center md:gap-12 gap-6'>
                <p>Semester {selectedSem.semester}</p>
                <span><ChevronDown className='size-3 text-secondary' /></span>

                <AnimatePresence>
                  {selectionOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.1 }}
                      className='absolute top-full left-0 bg-obsidian border border-primary/10 rounded-xl p-1 z-50'>
                      {totalSems.map((sem) => (
                        <div
                          onClick={() => setSelectedSem(sem)}
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
            </div>
          </div>

          {/* Internal vs External chart */}
          <div className='mt-5'>
            <MarksStackedChart data={stackedData} />
          </div>

          {/* Radial Marks Chart */}
          <div className='mt-5'>
            <RadialChart data={radialData} />
          </div>

          {/* Distributed Marks Bar Graph */}
          <div className='mt-5'>
            <DistributedBarGraph data={distributedGraphData} />
          </div>

          {/* SGPA Progression Chart */}
          <div className='mt-5'>
            <SgpaProgressChart data={sgpaProgressionData} targetCgpa={targetCGPA} />
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalyticsPage