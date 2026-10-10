import React from 'react';
import { useAuth } from '../firebase/authContext';
import { Waves, Sparkles, HardHat, User, Shield, LogOut, LogIn, CloudUpload } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDriveModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenDriveModal }) => {
  const { user, profile, effectiveRole, isBootstrapAdmin, signInWithGoogle, signOut, switchDemoRole } = useAuth();

  const roleColors: Record<UserRole, { bg: string; text: string; label: string; icon: any }> = {
    admin: { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'text-amber-700', label: 'Admin / Manager', icon: Shield },
    technician: { bg: 'bg-sky-100 text-sky-800 border-sky-300', text: 'text-sky-700', label: 'Pool Technician', icon: HardHat },
    customer: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'text-emerald-700', label: 'Customer / Owner', icon: User },
  };

  const currentRoleConfig = roleColors[effectiveRole] || roleColors.customer;
  const RoleIcon = currentRoleConfig.icon;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('schedules')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  SB POOLS
                </span>
                <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  Cloud DB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Pool Maintenance Schedules & Technician Dispatch
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'schedules'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Schedules & Dispatch
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'technician'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <HardHat className="w-4 h-4" />
              Technician Field Log
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'customer'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Bookings & Pools
            </button>
            <button
              onClick={onOpenDriveModal}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 flex items-center gap-1.5"
            >
              <CloudUpload className="w-4 h-4 text-amber-400" />
              Drive Sync
            </button>
          </nav>

          {/* Auth & Role Switching */}
          <div className="flex items-center gap-3">
            {/* Perspective Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 hidden lg:inline">View as:</span>
              <select
                value={effectiveRole}
                onChange={(e) => switchDemoRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
                title="Switch active role perspective"
              >
                <option value="admin" className="bg-slate-800 text-white">Admin (Manager)</option>
                <option value="technician" className="bg-slate-800 text-white">Technician</option>
                <option value="customer" className="bg-slate-800 text-white">Customer (Owner)</option>
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-cyan-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-xs text-white">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                      {user.displayName || user.email}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${currentRoleConfig.bg}`}>
                        {currentRoleConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-1 px-2 rounded ${activeTab === 'schedules' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('technician')}
            className={`py-1 px-2 rounded ${activeTab === 'technician' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Field Tasks
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`py-1 px-2 rounded ${activeTab === 'customer' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Bookings
          </button>
          <button
            onClick={onOpenDriveModal}
            className="py-1 px-2 text-amber-400 font-medium"
          >
            Drive Sync
          </button>
        </div>
      </div>
    </header>
  );
};
