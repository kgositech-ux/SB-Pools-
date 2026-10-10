import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { createBooking } from '../firebase/services';
import { ServiceType } from '../types';
import { CheckCircle2, Send, Sparkles } from 'lucide-react';

interface QuotationFormProps {
  onSuccess: (bookingId: string) => void;
  onOpenAuth: (mode: 'signup' | 'login') => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ onSuccess, onOpenAuth }) => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [suburb, setSuburb] = useState('Centurion, Pretoria');
  const [serviceType, setServiceType] = useState<ServiceType>('new_fibreglass_pool');
  const [dimensions, setDimensions] = useState('6m x 3m (with pump & sand filter)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<{ text: string; isError?: boolean } | null>(null);

  React.useEffect(() => {
    if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setStatusText({ text: 'Please provide your full name and phone number.', isError: true });
      return;
    }

    setSubmitting(true);
    setStatusText(null);

    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 2);

      let estimatedPrice = 85000;
      if (serviceType === 'pool_renovation') estimatedPrice = 32000;
      else if (serviceType === 'pump_filter_replacement') estimatedPrice = 8900;
      else if (serviceType === 'routine_maintenance') estimatedPrice = 1850;

      const bookingId = await createBooking({
        customerId: user?.uid || 'guest_client',
        customerName: name,
        customerEmail: email || 'quotation@sellopools.co.za',
        customerPhone: phone,
        address: suburb || 'Pretoria and surrounds',
        suburb,
        poolType: 'fibreglass',
        poolDimensions: dimensions,
        serviceType,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        timeSlot: '09:00 AM - 12:00 PM',
        status: 'pending',
        notes: `Dimensions: ${dimensions}. Message: ${notes || 'Standard free quotation request'}`,
        price: estimatedPrice,
        quoteAmount: estimatedPrice,
      });

      setStatusText({
        text: `Quotation request #${bookingId.substring(0, 8)} saved to database! Sello Pools team will contact you.`,
      });
      onSuccess(bookingId);
      setNotes('');
    } catch (err: any) {
      console.error('Error submitting quotation:', err);
      setStatusText({
        text: 'Failed to record quotation. Please check network connection.',
        isError: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-6 sm:p-10 shadow-lg text-[var(--ink)]">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
          Free Quotation Request
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 font-heading">
          Request a Quotation with Pump & Sand Filter Included
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1.5">
          Tell us about your project in Pretoria or surrounds. We will review and provide a free quotation.
        </p>
      </div>

      {statusText && (
        <div
          className={`p-4 rounded-xl text-xs font-medium mb-5 border flex items-center gap-2 ${
            statusText.isError
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {!statusText.isError && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          <span>{statusText.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Full Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Johan van der Merwe"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </label>

          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.co.za"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Phone / WhatsApp *</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 082 555 1234"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </label>

          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Suburb / Area in Pretoria</span>
            <input
              type="text"
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              placeholder="e.g. Centurion, Pretoria East, Moot"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Service Needed</span>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            >
              <option value="new_fibreglass_pool">New fibreglass pool installation (pump & filter included)</option>
              <option value="pool_renovation">Pool renovation & fibreglass relining</option>
              <option value="pump_filter_replacement">Speck pump & sand filter replacement</option>
              <option value="routine_maintenance">Routine pool maintenance & water testing</option>
            </select>
          </label>

          <label className="block">
            <span className="block mb-1 text-[var(--ink)] font-semibold">Pool Dimensions or Size</span>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 6m x 3m, 8m x 4m, or custom"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </label>
        </div>

        <label className="block">
          <span className="block mb-1 text-[var(--ink)] font-semibold">Project Notes / Backyard Access</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us about backyard access, ground slope, existing pool condition, or preferred start dates..."
            className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
          />
        </label>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-6 rounded-full font-bold bg-[var(--lime)] text-[#06210a] text-sm hover:brightness-105 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting Request...' : 'Submit Free Quotation Request'}</span>
          </button>

          {!user && (
            <p className="text-xs text-[var(--muted)]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="text-[#1bb6d4] font-bold hover:underline cursor-pointer"
              >
                Log in
              </button>{' '}
              to link your quotation.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
