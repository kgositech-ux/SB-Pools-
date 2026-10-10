import React, { useState } from 'react';
import { PoolProfile, Booking, PoolType } from '../types';
import { createPoolProfile, createBooking } from '../firebase/services';
import { Waves, Plus, Calendar, CheckCircle2, Droplets, MapPin, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface CustomerPortalProps {
  pools: PoolProfile[];
  bookings: Booking[];
  currentUserId?: string;
  currentUserName?: string;
  onOpenScheduleModal: () => void;
  onSeedData: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  pools,
  bookings,
  currentUserId,
  currentUserName,
  onOpenScheduleModal,
  onSeedData,
}) => {
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pool form state
  const [poolName, setPoolName] = useState('');
  const [address, setAddress] = useState('');
  const [poolType, setPoolType] = useState<PoolType>('saltwater');
  const [volumeGallons, setVolumeGallons] = useState(25000);
  const [filtrationType, setFiltrationType] = useState('Hayward Sand Filter');
  const [sanitizerType, setSanitizerType] = useState('Salt Chlorine Generator');
  const [notes, setNotes] = useState('');

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPoolProfile({
        customerId: currentUserId || 'cust_guest',
        customerName: currentUserName || 'Harrison Miller',
        poolName,
        address,
        poolType,
        volumeGallons,
        filtrationType,
        sanitizerType,
        notes,
      });
      setIsPoolModalOpen(false);
      setPoolName('');
      setAddress('');
      setNotes('');
    } catch (err) {
      console.error('Error creating pool:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            Customer Pool Profiles & Booking History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your registered pool properties, review water quality reports, and book maintenance visits.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {pools.length === 0 && (
            <button
              onClick={onSeedData}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              Load Sample Pools
            </button>
          )}

          <button
            onClick={() => setIsPoolModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Pool Profile
          </button>

          <button
            onClick={onOpenScheduleModal}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Book Service
          </button>
        </div>
      </div>

      {/* Pool Profiles Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Registered Swimming Pools ({pools.length})
        </h3>

        {pools.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-slate-400">No pools registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {pool.poolName}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {pool.address}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 capitalize">
                    {pool.poolType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Water Capacity</span>
                    <span className="font-semibold text-slate-200">{pool.volumeGallons.toLocaleString()} Gal</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block">Sanitizer</span>
                    <span className="font-semibold text-slate-200 truncate block">{pool.sanitizerType || 'Standard'}</span>
                  </div>
                </div>

                {pool.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    {pool.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Booking History */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Maintenance Visit History ({bookings.length} Bookings)
        </h3>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {booking.serviceType.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      booking.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : booking.status === 'in_progress'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {booking.scheduledDate}
                  </span>
                  {booking.timeSlot && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {booking.timeSlot}
                    </span>
                  )}
                </p>
                <p className="text-slate-400">
                  Technician: <span className="text-cyan-300 font-medium">{booking.assignedTechnicianName || 'Pending Assignment'}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold text-base text-white">${booking.price || 0}</span>
                <p className="text-[10px] text-slate-500">Service Fee</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Pool Profile Modal */}
      {isPoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Register New Swimming Pool
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter pool dimensions, filtration setup, and address for accurate chemical dosage calculation.
            </p>

            <form onSubmit={handleCreatePool} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Pool Name / Identifier</label>
                <input
                  type="text"
                  required
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="e.g. Backyard Heated Lagoon"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Property Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="1048 Ocean Breeze Way, Santa Barbara"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pool Type</label>
                  <select
                    value={poolType}
                    onChange={(e) => setPoolType(e.target.value as PoolType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="saltwater">Saltwater Inground</option>
                    <option value="in_ground_chlorine">Standard Chlorine</option>
                    <option value="fiberglass">Fiberglass</option>
                    <option value="above_ground">Above Ground</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Volume (Gallons)</label>
                  <input
                    type="number"
                    required
                    value={volumeGallons}
                    onChange={(e) => setVolumeGallons(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Filtration System</label>
                  <input
                    type="text"
                    value={filtrationType}
                    onChange={(e) => setFiltrationType(e.target.value)}
                    placeholder="Hayward Sand Filter"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Sanitizer Unit</label>
                  <input
                    type="text"
                    value={sanitizerType}
                    onChange={(e) => setSanitizerType(e.target.value)}
                    placeholder="Hayward T-CELL-15"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes / Access Codes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Gate code, dogs, equipment pad location..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPoolModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Pool Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
