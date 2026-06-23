"use client"
import React from 'react'
import DistributedBarGraph from './DistributedBarGraph'
import RadialChart from './RadialChart'
import MarksStackedChart from './MarksStackedChart'
import SGPAProgressionChart from './SGPAProgressionChart'
import GPASimulator from './GPASimulator'
import { useUser } from '@/app/Context/UserContext'


export default function ChartsWrapper({stackedData, radialData, distributedGraphData, sgpaProgressionData, totalSems}) {
    const { targetCGPA, currentCGPA, currentSem } = useUser();

    return (
        <div>
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
                <SGPAProgressionChart data={sgpaProgressionData} targetCgpa={targetCGPA} dbCgpa={currentCGPA} />
            </div>

            {/* GPA Simulator / What-If Forecaster (Feature A) */}
            <div className='mt-5'>
                <GPASimulator 
                    totalSems={totalSems || []} 
                    targetCgpa={targetCGPA || 9.0} 
                    currentCgpa={currentCGPA || 0.0} 
                    currentSem={Number(currentSem) || 1} 
                />
            </div>
        </div>
    )
}
