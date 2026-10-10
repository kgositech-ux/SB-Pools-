import React from 'react';
import { PoolProfile, Booking, TechnicianTask } from '../types';
import { Waves, Calendar, HardHat, CloudUpload, Activity } from 'lucide-react';

interface StatsOverviewProps {
  pools: PoolProfile[];
  bookings: Booking[];
  tasks: TechnicianTask[];
  onOpenDriveModal: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  pools,
  bookings,
  tasks,
  onOpenDriveModal,
}) => {
  const activeSchedules = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedVisits = bookings.filter((b) => b.status === 'completed').length;
  const totalWaterGallons = pools.reduce((acc, p) => acc + (p.volumeGallons || 0), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* Total Pools */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Pool Projects
          </span>
          <span className="text-2xl font-black text-cyan-400 mt-0.5 block">
            {pools.length}
          </span>
          <span className="text-[10px] text-slate-400">
            {totalWaterGallons > 0 ? `${(totalWaterGallons / 1000).toFixed(0)}k Gallons` : 'Configured'}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 flex items-center justify-center">
          <Waves className="w-5 h-5" />
        </div>
      </div>

      {/* Active Schedules */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Active Routes
          </span>
          <span className="text-2xl font-black text-blue-400 mt-0.5 block">
            {activeSchedules}
          </span>
          <span className="text-[10px] text-slate-400">
            {completedVisits} Completed
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Technician Field Tasks */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Technician Tasks
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
            {tasks.length}
          </span>
          <span className="text-[10px] text-slate-400">
            Field Logs Logged
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
          <HardHat className="w-5 h-5" />
        </div>
      </div>

      {/* Drive Sync Metric & Quick Button */}
      <div
        onClick={onOpenDriveModal}
        className="bg-gradient-to-tr from-amber-950/40 to-slate-900 border border-amber-800/50 hover:border-amber-600/70 rounded-xl p-4 shadow-lg flex items-center justify-between cursor-pointer transition-all group"
      >
        <div>
          <span className="text-[11px] font-semibold text-amber-300 block uppercase tracking-wider flex items-center gap-1">
            Drive Ready <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
          </span>
          <span className="text-2xl font-black text-amber-400 mt-0.5 block">
            {pools.length + bookings.length}
          </span>
          <span className="text-[10px] text-amber-200/80 group-hover:underline">
            Click to Sync Drive
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
          <CloudUpload className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
