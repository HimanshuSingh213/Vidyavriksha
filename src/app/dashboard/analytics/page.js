"use server";
import stackedMarksData, { fetchDistributedBarGraph, fetchSGPAProgressionChart, getSems, RadialChartData } from '@/actions/analyticCharts';
import SemesterDropdown from '@/components/analytics/SemesterDropdown';
import ChartsWrapper from '@/components/analytics/ChartsWrapper';
import AnalyticsToast from '@/components/analytics/AnalyticsToast';
import { getUserSettings } from '@/actions/userSettings';

async function AnalyticsPage({ searchParams }) {

  // const [totalSems, setTotalSems] = useState([]);
  // const [selectedSem, setSelectedSem] = useState({});
  // const [stackedData, setStackedData] = useState({});
  // const [radialData, setRadialData] = useState({});
  // const [distributedGraphData, setDistributedGraphData] = useState({});
  // const [sgpaProgressionData, setSgpaProgressionData] = useState({});
  // const { targetCGPA } = useUser()
  // const [selectionOpen, setSelectionOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);

  // Fetching available semesters and user settings
  const [totalSems, userSettings] = await Promise.all([
    getSems(),
    getUserSettings()
  ]);

  if (!totalSems || totalSems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-secondary/80 text-sm font-medium">
          No semester is added. Please add a semester from the settings tab.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  let currentSemId = params?.sem;

  if(!currentSemId){
    const defaultSem = totalSems.find(s => s.semester === userSettings?.currentSem);
    currentSemId = defaultSem? defaultSem._id : totalSems[0]._id;
  }
  const selectedSem = totalSems.find(s => s._id === currentSemId) || totalSems[0];

  let serverError = null;
  let stackedData = {}, radialData = {}, distributedGraphData = {}, sgpaProgressionData = {};


  try {
    const [res1, res2, res3, res4] = await Promise.all([
      stackedMarksData(selectedSem._id),
      RadialChartData(selectedSem._id),
      fetchDistributedBarGraph(selectedSem._id),
      fetchSGPAProgressionChart()
    ])

    if (res1.success && res2.success && res3.success && res4.success) {
      stackedData = res1.data;
      radialData = res2.data;
      distributedGraphData = res3.data;
      sgpaProgressionData = res4.data;
    }
    else {
      serverError = res1.error || "Failed to fetch Semester details.";
    }
  } catch (err) {
    serverError = `Failed to fetch Semester details.\n${err.message || err}`;
  }

  return (
    <>
      <div className='p-6 md:p-10'>

        {/* Toast State */}
        <AnalyticsToast error={serverError} />


        {/* Upper Deck */}
        <div>
          {/* Sem Selection */}
          <div className='flex justify-start items-center rounded-xl bg-primary/3 border-2 border-primary/5 px-4 py-5'>
            <div className='flex justify-center items-center gap-4'>
              <p className='text-sm text-primary font-medium'>Select Semester:</p>

              <SemesterDropdown totalSems={totalSems} selectedSem={selectedSem} />
            </div>
          </div>

          {/* Lower Deck */}
          {!serverError && (
            <ChartsWrapper
              stackedData={stackedData}
              radialData={radialData}
              distributedGraphData={distributedGraphData}
              sgpaProgressionData={sgpaProgressionData}
            />
          )}

        </div>
      </div>
    </>
  )
}

export default AnalyticsPage