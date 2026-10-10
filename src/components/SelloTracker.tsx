import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { updateBookingStatus } from '../firebase/services';
import { useAuth } from '../firebase/authContext';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Phone, User, DollarSign, Filter, Search, Sparkles } from 'lucide-react';

interface SelloTrackerProps {
  bookings: Booking[];
  onSeedData: () => void;
  onOpenNewQuote: () => void;
  onOpenDriveModal: () => void;
}

export const SelloTracker: React.FC<SelloTrackerProps> = ({
  bookings,
  onSeedData,
  onOpenNewQuote,
  onOpenDriveModal,
}) => {
  const { user, isBootstrapAdmin, effectiveRole } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = isBootstrapAdmin || effectiveRole === 'admin';

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-[#06364d] border border-cyan-300">
            Quote Approved & Scheduled
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            Installation In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Completed & Commissioned
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Quotation Under Review
          </span>
        );
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
    } catch (err) {
      console.error('Error updating quotation status:', err);
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto px-4 sm:px-5 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
            Live Database Persistence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] font-heading mt-1">
            Track Quotations & Project Schedules
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Review status updates for new pool installations, relining renovations, and equipment replacements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {bookings.length === 0 && (
            <button
              onClick={onSeedData}
              className="py-2.5 px-4 rounded-full font-bold bg-[#1bb6d4] text-[#032633] text-xs hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Sello Projects
            </button>
          )}

          <button
            onClick={onOpenNewQuote}
            className="py-2.5 px-4 rounded-full font-bold bg-[#3fae49] text-[#06210a] text-xs hover:brightness-105 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            + Request New Quotation
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[var(--surface)] p-3 rounded-2xl border border-[var(--line)]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client or suburb..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg)] text-xs text-[var(--ink)] rounded-xl border border-[var(--line)] focus:outline-none focus:border-[var(--aqua)]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full font-semibold capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#06364d] text-white shadow-sm'
                  : 'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings / Quotation Cards List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--line)]">
          <Calendar className="w-12 h-12 text-[var(--muted)] opacity-40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[var(--ink)] font-heading">No quotation records found</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            Submit a quotation request through the form or load sample projects to preview real-time tracking.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={onOpenNewQuote}
              className="px-4 py-2 bg-[#3fae49] text-[#06210a] font-bold rounded-full text-xs cursor-pointer"
            >
              Request a Free Quote
            </button>
            <button
              onClick={onSeedData}
              className="px-4 py-2 bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] font-semibold rounded-full text-xs cursor-pointer"
            >
              Load Demo Records
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-[var(--surface)] border border-[var(--line)] hover:border-[#1bb6d4]/50 rounded-[20px] p-6 shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
                <div>
                  <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                    Reference: #{b.id.substring(0, 10)}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--ink)] font-heading mt-0.5">
                    {b.serviceType.replace(/_/g, ' ').toUpperCase()}
                  </h3>
                </div>
                <div>{getStatusBadge(b.status)}</div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Client Details</span>
                  <p className="font-bold text-[var(--ink)] mt-0.5">{b.customerName}</p>
                  {b.customerPhone && (
                    <p className="text-[var(--muted)] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#1bb6d4]" /> {b.customerPhone}
                    </p>
                  )}
                  {b.customerEmail && <p className="text-[var(--muted)] truncate">{b.customerEmail}</p>}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Project Location</span>
                  <p className="font-semibold text-[var(--ink)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#1bb6d4] shrink-0" /> {b.address}
                  </p>
                  <p className="text-[var(--muted)] mt-0.5">
                    Target Date: <span className="font-medium text-[var(--ink)]">{b.scheduledDate}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">
                    Contractor & Estimate
                  </span>
                  <p className="font-bold text-[var(--ink)] text-sm text-[#0a6f93]">
                    {b.price ? `R ${b.price.toLocaleString()} ZAR` : 'Quote pending'}
                  </p>
                  <p className="text-[var(--muted)] mt-0.5">
                    Lead: <span className="font-medium">{b.assignedTechnicianName || 'Sello Pools Construction Lead'}</span>
                  </p>
                </div>
              </div>

              {b.notes && (
                <div className="mt-4 p-3 bg-[var(--bg)] rounded-xl border border-[var(--line)] text-xs text-[var(--muted)] italic">
                  &quot;{b.notes}&quot;
                </div>
              )}

              {/* Action bar for Admin / Contractor */}
              <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[var(--muted)] text-[11px]">
                  Specs: Speck pump & 2-bag sand filter included in project scope.
                </span>

                <div className="flex items-center gap-2">
                  {isAdmin && b.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      className="px-3 py-1 bg-cyan-600 text-white rounded-full font-bold hover:bg-cyan-500 cursor-pointer"
                    >
                      Approve Quote & Dispatch Team
                    </button>
                  )}

                  {isAdmin && b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'in_progress')}
                      className="px-3 py-1 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-500 cursor-pointer"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {isAdmin && b.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'completed')}
                      className="px-3 py-1 bg-[#3fae49] text-[#06210a] rounded-full font-bold hover:brightness-105 cursor-pointer"
                    >
                      Mark Complete & Commissioned
                    </button>
                  )}

                  <button
                    onClick={onOpenDriveModal}
                    className="px-3 py-1 border border-[var(--line)] text-[var(--ink)] rounded-full hover:bg-[var(--bg)] cursor-pointer"
                  >
                    Sync to Google Drive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
