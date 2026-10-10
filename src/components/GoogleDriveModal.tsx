import React, { useState } from 'react';
import { generateGoogleDriveExport, downloadFile } from '../utils/googleDriveExport';
import { PoolProfile, Booking, TechnicianTask } from '../types';
import { X, CloudUpload, FileSpreadsheet, FileText, CheckCircle2, Copy, ExternalLink, Download, Sparkles } from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: PoolProfile[];
  bookings: Booking[];
  tasks: TechnicianTask[];
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  pools,
  bookings,
  tasks,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const bundle = generateGoogleDriveExport(pools, bookings, tasks);

  const handleCopyForGoogleDocs = async () => {
    try {
      await navigator.clipboard.writeText(bundle.markdownDocument);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Copy error', err);
    }
  };

  const handleDownloadDocsHtml = () => {
    downloadFile(bundle.htmlDocument, 'SB_Pools_Maintenance_Projects_Dossier.html', 'text/html');
    setDownloadSuccess('Dossier for Google Docs downloaded');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadBookingsCsv = () => {
    downloadFile(bundle.bookingsCsv, 'SB_Pools_Customer_Bookings_Schedules.csv', 'text/csv');
    setDownloadSuccess('Bookings sheet downloaded');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadTasksCsv = () => {
    downloadFile(bundle.tasksCsv, 'SB_Pools_Technician_Tasks_and_Chemical_Logs.csv', 'text/csv');
    setDownloadSuccess('Technician chemical logs sheet downloaded');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadJsonBackup = () => {
    downloadFile(bundle.fullJsonBackup, 'SB_Pools_Full_Database_Backup.json', 'application/json');
    setDownloadSuccess('Full JSON backup downloaded');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadAllDriveFiles = () => {
    handleDownloadDocsHtml();
    setTimeout(() => handleDownloadBookingsCsv(), 400);
    setTimeout(() => handleDownloadTasksCsv(), 800);
    setTimeout(() => handleDownloadJsonBackup(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl text-slate-950 shadow-md shadow-amber-500/20">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Add All Projects to Google Drive
              </h2>
              <p className="text-xs text-slate-400">
                Sync swimming pool maintenance schedules, customer booking history & technician logs to Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-600/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}! Drop this file into your Google Drive folder.</span>
          </div>
        )}

        {/* Content body */}
        <div className="mt-5 space-y-4 relative z-10 text-sm">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block">Pool Projects</span>
              <span className="text-xl font-bold text-cyan-400">{pools.length}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block">Booking Records</span>
              <span className="text-xl font-bold text-blue-400">{bookings.length}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <span className="text-xs text-slate-400 block">Technician Logs</span>
              <span className="text-xl font-bold text-emerald-400">{tasks.length}</span>
            </div>
          </div>

          {/* Primary Quick Sync to Drive Actions */}
          <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-800/60 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-cyan-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  One-Click Complete Google Drive Export Bundle
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Prepares the Google Docs dossier, Sheets CSV tables, and database archive formatted for Google Drive.
                </p>
              </div>
              <button
                onClick={handleDownloadAllDriveFiles}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download All for Drive
              </button>
            </div>
          </div>

          {/* Individual Drive Formats */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Individual Files for Google Drive
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Google Docs Dossier */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-center justify-between hover:bg-slate-800/90 transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Google Docs Dossier</p>
                    <p className="text-[11px] text-slate-400">Full Project Report (.html)</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadDocsHtml}
                  className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download HTML for Google Docs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Google Sheets - Bookings */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-center justify-between hover:bg-slate-800/90 transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Bookings Spreadsheet</p>
                    <p className="text-[11px] text-slate-400">Google Sheets format (.csv)</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadBookingsCsv}
                  className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download Bookings CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Google Sheets - Tasks & Chemical logs */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-center justify-between hover:bg-slate-800/90 transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Technician Water Chem Log</p>
                    <p className="text-[11px] text-slate-400">Google Sheets format (.csv)</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTasksCsv}
                  className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download Tasks CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Database JSON Backup */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-center justify-between hover:bg-slate-800/90 transition-colors">
                <div className="flex items-center gap-2.5">
                  <CloudUpload className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Full Cloud JSON Archive</p>
                    <p className="text-[11px] text-slate-400">Firestore Export (.json)</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadJsonBackup}
                  className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download JSON Backup"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Direct Actions & Quick Links */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleCopyForGoogleDocs}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Markdown to Paste into Google Docs</span>
                </>
              )}
            </button>

            <a
              href="https://drive.google.com/drive/my-drive"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open My Google Drive</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
