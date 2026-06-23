import { getSems } from "@/actions/analyticCharts";
import { getUserSettings } from "@/actions/userSettings";
import GPASimulator from "@/components/analytics/GPASimulator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SimulatorPage() {
  const [totalSems, userSettings] = await Promise.all([
    getSems(),
    getUserSettings()
  ]);

  return (
    <div className="p-4 md:p-10 min-h-screen bg-obsidian">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-secondary hover:text-brand text-xs font-mono transition-colors duration-200"
        >
          <ArrowLeft size={14} /> Back to Command Center
        </Link>
      </div>

      <GPASimulator 
        totalSems={totalSems || []} 
        targetCgpa={userSettings?.targetCGPA || 9.0} 
        currentCgpa={userSettings?.currentCGPA || 0.0} 
        currentSem={Number(userSettings?.currentSem) || 1} 
      />
    </div>
  );
}
