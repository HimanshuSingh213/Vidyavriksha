"use client"
import React from 'react'
import DistributedBarGraph from './DistributedBarGraph'
import RadialChart from './RadialChart'
import MarksStackedChart from './MarksStackedChart'
import SGPAProgressionChart from './SGPAProgressionChart'
import { useUser } from '@/app/Context/UserContext'


export default function ChartsWrapper({stackedData, radialData, distributedGraphData, sgpaProgressionData}) {
    const { targetCGPA, currentCGPA } = useUser();

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

        </div>
    )
}
