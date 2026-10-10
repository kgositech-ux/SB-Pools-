import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { subscribeToBookings, subscribeToTasks, subscribeToPools, seedSampleData } from './firebase/services';
import { Booking, TechnicianTask, PoolProfile } from './types';
import { SelloHeader } from './components/SelloHeader';
import { SelloLanding } from './components/SelloLanding';
import { SelloTracker } from './components/SelloTracker';
import { ScheduleManager } from './components/ScheduleManager';
import { TechnicianBoard } from './components/TechnicianBoard';
import { CustomerPortal } from './components/CustomerPortal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { AuthDialog } from './components/AuthDialog';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { ManualVerificationCheckpoint } from './components/ManualVerificationCheckpoint';
import { SelloFooter } from './components/SelloFooter';
import { Sparkles, Calendar, HardHat, Waves, CheckCircle2 } from 'lucide-react';

function SelloAppContent() {
  const { user, profile, effectiveRole, isBootstrapAdmin, emailVerified } = useAuth();
  const [activeSection, setActiveSection] = useState<'home' | 'tracker' | 'management'>('home');
  const [adminSubTab, setAdminSubTab] = useState<'schedules' | 'technician' | 'pools'>('schedules');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [pools, setPools] = useState<PoolProfile[]>([]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time Firestore collections only when authenticated
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setTasks([]);
      setPools([]);
      return;
    }

    const isAdmin = isBootstrapAdmin || effectiveRole === 'admin';
    const filter = isAdmin
      ? { role: 'admin' }
      : effectiveRole === 'technician'
      ? { role: 'technician', technicianId: user.uid }
      : { role: 'customer', customerId: user.uid };

    const unsubBookings = subscribeToBookings((data) => {
      setBookings(data);
    }, filter);

    const unsubTasks = subscribeToTasks((data) => {
      setTasks(data);
    }, filter);

    const unsubPools = subscribeToPools((data) => {
      setPools(data);
    }, filter);

    return () => {
      if (unsubBookings) unsubBookings();
      if (unsubTasks) unsubTasks();
      if (unsubPools) unsubPools();
    };
  }, [user?.uid, isBootstrapAdmin, effectiveRole]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeedData = async () => {
    try {
      await seedSampleData(
        user?.uid || 'user_sello_demo',
        user?.displayName || 'Dr. Johan van der Merwe'
      );
      showToast('Loaded sample Sello Pools projects, quotations & field tasks!');
    } catch (err) {
      console.error('Seed error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans transition-colors duration-200">
      {/* Sello Pools Navigation Header */}
      <SelloHeader
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
      />

      {/* Main View Router - Gated by Manual Email Verification */}
      <main className="flex-1 w-full">
        {user && !emailVerified ? (
          <ManualVerificationCheckpoint
            onToast={showToast}
            onVerifiedSuccess={() => {
              showToast('Email verified! You may now continue to the website.');
            }}
          />
        ) : (
          <>
            {/* Landing Page */}
            {activeSection === 'home' && (
              <SelloLanding
                onOpenAuth={(mode) => {
                  setAuthMode(mode);
                  setIsAuthOpen(true);
                }}
                onOpenTracker={() => setActiveSection('tracker')}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
              />
            )}

            {/* Quotation & Booking Tracker */}
            {activeSection === 'tracker' && (
              <SelloTracker
                bookings={bookings}
                onSeedData={handleSeedData}
                onOpenNewQuote={() => setActiveSection('home')}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
              />
            )}

            {/* Contractor / Technician Management Portal */}
            {activeSection === 'management' && (
              <div className="max-w-[1080px] mx-auto px-4 sm:px-5 py-6 space-y-6">
                {/* Sub-navigation tabs */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
                      Field Operations
                    </span>
                    <h2 className="text-2xl font-extrabold text-[var(--ink)] font-heading">
                      Technician Tasks & Project Dispatch
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[var(--surface)] p-1 rounded-full border border-[var(--line)] text-xs">
                    <button
                      onClick={() => setAdminSubTab('schedules')}
                      className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                        adminSubTab === 'schedules'
                          ? 'bg-[#06364d] text-white shadow-sm'
                          : 'text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Schedules
                    </button>
                    <button
                      onClick={() => setAdminSubTab('technician')}
                      className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                        adminSubTab === 'technician'
                          ? 'bg-[#06364d] text-white shadow-sm'
                          : 'text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Field Logs
                    </button>
                    <button
                      onClick={() => setAdminSubTab('pools')}
                      className={`px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                        adminSubTab === 'pools'
                          ? 'bg-[#06364d] text-white shadow-sm'
                          : 'text-[var(--muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      Pool Profiles
                    </button>
                  </div>
                </div>

                {adminSubTab === 'schedules' && (
                  <ScheduleManager
                    bookings={bookings}
                    pools={pools}
                    currentRole={effectiveRole}
                    currentUserId={user?.uid}
                    currentUserName={user?.displayName || user?.email || undefined}
                    onSeedData={handleSeedData}
                  />
                )}

                {adminSubTab === 'technician' && (
                  <TechnicianBoard
                    tasks={tasks}
                    onSeedData={handleSeedData}
                  />
                )}

                {adminSubTab === 'pools' && (
                  <CustomerPortal
                    pools={pools}
                    bookings={bookings}
                    currentUserId={user?.uid}
                    currentUserName={user?.displayName || user?.email || undefined}
                    onOpenScheduleModal={() => setAdminSubTab('schedules')}
                    onSeedData={handleSeedData}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sello Pools Footer */}
      <SelloFooter
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenTracker={() => setActiveSection('tracker')}
      />

      {/* Auth Dialog (#adlg) */}
      <AuthDialog
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccessToast={showToast}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Account Settings & Profile Edits Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onToast={showToast}
      />

      {/* Google Drive Projects Sync Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        pools={pools}
        bookings={bookings}
        tasks={tasks}
      />

      {/* Toast Notification Element */}
      {toastMessage && (
        <div
          id="toast"
          className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-[#06364d] text-white border border-white/20 py-3 px-6 rounded-full text-xs sm:text-sm font-semibold shadow-2xl z-50 flex items-center gap-2 animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4 text-[#3fae49] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SelloAppContent />
    </AuthProvider>
  );
}
