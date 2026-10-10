import React from 'react';
import { CloudUpload, Waves } from 'lucide-react';

interface SelloFooterProps {
  onOpenDriveModal: () => void;
  onOpenTracker: () => void;
}

export const SelloFooter: React.FC<SelloFooterProps> = ({ onOpenDriveModal, onOpenTracker }) => {
  return (
    <footer className="relative bg-[#031820] text-[#b9e3ee] pt-16 pb-8 border-t-4 border-[#1bb6d4] text-sm mt-20">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-5">
        {/* Top brand row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 40 40" aria-hidden="true">
                <rect width="40" height="40" rx="11" fill="#1bb6d4" />
                <circle cx="29" cy="12" r="4" fill="#3fae49" />
                <path
                  d="M7 22c3-3 5-3 8 0s5 3 8 0 5-3 8 0M7 30c3-3 5-3 8 0s5 3 8 0 5-3 8 0"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-extrabold text-2xl text-white font-heading">
                Sello <span className="text-[#1bb6d4]">Pools</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-[#9fd0de] max-w-md leading-relaxed">
              New fibreglass pools, relining renovations, and complete filtration installations in Pretoria and surrounds. Pump and sand filter always included.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDriveModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-full text-xs flex items-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Add Projects to Google Drive</span>
            </button>
            <button
              onClick={onOpenTracker}
              className="px-4 py-2 border border-white/20 text-white rounded-full text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              Track Quotations
            </button>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-xs">
          <div>
            <h4 className="font-bold text-white text-sm mb-3 font-heading">Core Services</h4>
            <ul className="space-y-2 list-none p-0 m-0 text-[#8fbfce]">
              <li>New Fibreglass Pools</li>
              <li>Pool Relining & Resurfacing</li>
              <li>Pump & Sand Filter Fitment</li>
              <li>Mosaic Border Replacement</li>
              <li>Crack & Leak Repair</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 font-heading">Included Standard</h4>
            <ul className="space-y-2 list-none p-0 m-0 text-[#8fbfce]">
              <li>0.75kW Speck Porpoise Pump</li>
              <li>2-Bag High-Rate Sand Filter</li>
              <li>High-Grade Silica Sand Media</li>
              <li>Electrical Timer DB Box</li>
              <li>Class 9 High-Pressure PVC</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 font-heading">Service Areas</h4>
            <ul className="space-y-2 list-none p-0 m-0 text-[#8fbfce]">
              <li>Centurion & Eldoraigne</li>
              <li>Pretoria East & Garsfontein</li>
              <li>Waterkloof & Faerie Glen</li>
              <li>The Moot & Montana</li>
              <li>Midrand & Surrounds</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 font-heading">Operating Hours</h4>
            <ul className="space-y-2 list-none p-0 m-0 text-[#8fbfce]">
              <li>Monday – Friday: 08:00 – 17:00</li>
              <li>Saturday: 08:30 – 13:00</li>
              <li>Sunday & Holidays: On Request</li>
              <li className="text-[#3fae49] font-semibold pt-1">Free Quotations & Inspections</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8fbfce]">
          <p className="m-0">
            &copy; {new Date().getFullYear()} Sello Pools. All rights reserved. Registered pool construction contractor in Pretoria.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Firebase Firestore & Auth Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
