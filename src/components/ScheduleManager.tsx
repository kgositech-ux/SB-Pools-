import React, { useState } from 'react';
import { Booking, BookingStatus, PoolProfile, ServiceType, UserRole } from '../types';
import { updateBookingStatus, assignTechnicianToBooking, createBooking, createTechnicianTask } from '../firebase/services';
import { Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle, Plus, Filter, Search, Sparkles, Phone, DollarSign } from 'lucide-react';

interface ScheduleManagerProps {
  bookings: Booking[];
  pools: PoolProfile[];
  currentRole: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  onSeedData: () => void;
  onSelectBookingForTask?: (booking: Booking) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  bookings,
  pools,
  currentRole,
  currentUserId,
  currentUserName,
  onSeedData,
  onSelectBookingForTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState(currentUserName || '');
  const [customerPhone, setCustomerPhone] = useState('(805) 555-0192');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('742 Evergreen Terrace, Santa Barbara');
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [poolType, setPoolType] = useState('saltwater');
  const [serviceType, setServiceType] = useState<ServiceType>('weekly_cleaning');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 11:00 AM');
  const [assignedTechnician, setAssignedTechnician] = useState('Carlos Ramirez (Lead Tech)');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState(125);

  const techniciansList = [
    { id: 'tech_carlos', name: 'Carlos Ramirez (Lead Tech)' },
    { id: 'tech_dave', name: 'Dave Walker (Pool Specialist)' },
    { id: 'tech_sarah', name: 'Sarah Jenkins (Certified Tech)' },
  ];

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.assignedTechnicianName && b.assignedTechnicianName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedTechObj = techniciansList.find((t) => t.name === assignedTechnician);
      const bookingId = await createBooking({
        customerId: currentUserId || 'cust_guest',
        customerName: customerName || 'Pool Owner',
        customerEmail: customerEmail || 'customer@sbpools.test',
        customerPhone,
        address,
        poolId: selectedPoolId || undefined,
        poolType,
        serviceType,
        scheduledDate,
        timeSlot,
        status: selectedTechObj ? 'confirmed' : 'pending',
        assignedTechnicianId: selectedTechObj?.id,
        assignedTechnicianName: selectedTechObj?.name,
        notes,
        price,
      });

      // If technician assigned, also generate a matching TechnicianTask automatically
      if (selectedTechObj) {
        await createTechnicianTask({
          bookingId,
          technicianId: selectedTechObj.id,
          technicianName: selectedTechObj.name,
          customerId: currentUserId || 'cust_guest',
          customerName: customerName || 'Pool Owner',
          address,
          serviceType,
          scheduledDate,
          status: 'scheduled',
          notes: notes || 'Scheduled pool maintenance service',
        });
      }

      setIsModalOpen(false);
      setNotes('');
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleTechChange = async (bookingId: string, techName: string) => {
    const tech = techniciansList.find((t) => t.name === techName);
    if (!tech) return;
    try {
      await assignTechnicianToBooking(bookingId, tech.id, tech.name);
    } catch (err) {
      console.error('Error assigning technician:', err);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/60">Confirmed</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-700/60 animate-pulse">In Progress</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-900/60 text-rose-300 border border-rose-700/60">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Pool Maintenance Schedules & Technician Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of technician maintenance routes, pool visits, and service bookings.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {bookings.length === 0 && (
            <button
              onClick={onSeedData}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              Load Sample Schedule
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Maintenance Schedule
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, address, technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings & Schedules Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No maintenance schedules found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filter tags.'
              : 'Add your first maintenance appointment or load sample data to see the technician routes.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Add Schedule
            </button>
            <button
              onClick={onSeedData}
              className="px-3.5 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700"
            >
              Load Sample Routes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Row: Date, Time & Status */}
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-800/60">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {b.scheduledDate}
                        {b.timeSlot && (
                          <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {b.timeSlot}
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                        {b.serviceType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div>{getStatusBadge(b.status)}</div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{b.customerName}</span>
                      {b.customerPhone && <span className="text-slate-400 ml-2">({b.customerPhone})</span>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>

                  {b.notes && (
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-slate-400 italic text-[11px]">
                      &quot;{b.notes}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Technician Assignment & Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                {/* Technician Picker */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-400 font-medium">Technician:</span>
                  <select
                    value={b.assignedTechnicianName || 'Unassigned'}
                    onChange={(e) => handleTechChange(b.id, e.target.value)}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {techniciansList.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'in_progress')}
                      className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-600/40 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Start Task
                    </button>
                  )}

                  {b.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'completed')}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-600/40 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Mark Done
                    </button>
                  )}

                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="px-2 py-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Maintenance Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Schedule Pool Maintenance Visit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter customer pool specs, date, and assign a technician to the maintenance route.
            </p>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Harrison Miller"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Customer Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="(805) 555-0192"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Service Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="742 Evergreen Terrace, Santa Barbara"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      const st = e.target.value as ServiceType;
                      setServiceType(st);
                      if (st === 'weekly_cleaning') setPrice(125);
                      else if (st === 'chemical_balance') setPrice(95);
                      else if (st === 'filter_deep_clean') setPrice(150);
                      else if (st === 'equipment_inspection') setPrice(110);
                      else if (st === 'pool_opening_closing') setPrice(250);
                      else if (st === 'green_to_clean') setPrice(300);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="weekly_cleaning">Weekly Cleaning ($125)</option>
                    <option value="chemical_balance">Chemical Balance ($95)</option>
                    <option value="filter_deep_clean">Filter Deep Clean ($150)</option>
                    <option value="equipment_inspection">Equipment Inspection ($110)</option>
                    <option value="pool_opening_closing">Opening / Closing ($250)</option>
                    <option value="green_to_clean">Green-to-Clean Recovery ($300)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pool Sanitizer Type</label>
                  <select
                    value={poolType}
                    onChange={(e) => setPoolType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="saltwater">Saltwater Inground</option>
                    <option value="in_ground_chlorine">Standard Chlorine</option>
                    <option value="fiberglass">Fiberglass</option>
                    <option value="commercial">Commercial Facility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Time Window</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Early)</option>
                    <option value="10:30 AM - 12:30 PM">10:30 AM - 12:30 PM (Mid-day)</option>
                    <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM (Afternoon)</option>
                    <option value="03:30 PM - 05:30 PM">03:30 PM - 05:30 PM (Late)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Assign Technician</label>
                <select
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {techniciansList.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Service Notes / Gate Access Codes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Gate code #4912, dogs secured inside, inspect skimmer basket..."
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Save & Dispatch Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
