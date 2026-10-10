import React from 'react';
import { useAuth } from '../firebase/authContext';
import { CloudUpload, Sun, Moon } from 'lucide-react';

interface SelloHeaderProps {
  onOpenAuth: (mode: 'signup' | 'login') => void;
  onOpenDriveModal: () => void;
  onOpenSettings?: () => void;
  activeSection: 'home' | 'tracker' | 'management';
  setActiveSection: (sec: 'home' | 'tracker' | 'management') => void;
}

export const SelloHeader: React.FC<SelloHeaderProps> = ({
  onOpenAuth,
  onOpenDriveModal,
  onOpenSettings,
  activeSection,
  setActiveSection,
}) => {
  const { user, profile, isBootstrapAdmin, effectiveRole, emailVerified, signOut } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Client';
  const isAdmin = isBootstrapAdmin || effectiveRole === 'admin';

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[rgba(6,40,56,0.92)] backdrop-blur-md border-b border-[rgba(255,255,255,0.1)] text-[#eaf8fb]">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-5">
        <nav className="flex justify-between items-center py-3 sm:py-4 gap-3 relative" aria-label="Main">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <a
              href="#top"
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-2 text-inherit no-underline"
              aria-label="Sello Pools home"
            >
              <svg className="w-9 h-9 shrink-0" viewBox="0 0 40 40" aria-hidden="true">
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
              <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                Sello <span className="text-[#1bb6d4]">Pools</span>
              </span>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex items-center gap-6 list-none m-0 p-0 text-sm font-medium">
            <li>
              <button
                onClick={() => setActiveSection('home')}
                className={`transition-colors cursor-pointer ${
                  activeSection === 'home' ? 'text-[#1bb6d4] font-bold' : 'text-[#eaf8fb] hover:text-[#1bb6d4]'
                }`}
              >
                Home & Services
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('tracker')}
                className={`transition-colors cursor-pointer ${
                  activeSection === 'tracker' ? 'text-[#1bb6d4] font-bold' : 'text-[#eaf8fb] hover:text-[#1bb6d4]'
                }`}
              >
                Track Quotations & Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('management')}
                className={`transition-colors cursor-pointer ${
                  activeSection === 'management' ? 'text-[#1bb6d4] font-bold' : 'text-[#eaf8fb] hover:text-[#1bb6d4]'
                }`}
              >
                {isAdmin ? 'Admin & Tech Dispatch' : 'Technician Logs'}
              </button>
            </li>
            <li>
              <button
                onClick={onOpenDriveModal}
                className="text-[#3fae49] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                Drive Sync
              </button>
            </li>
          </ul>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className="p-1.5 rounded-full text-[#9bbcc8] hover:text-white hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer text-left"
                  title="Account Settings & Profile Edits"
                >
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full object-cover border border-[#1bb6d4]"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#1bb6d4] text-[#031820] font-bold text-[10px] flex items-center justify-center">
                      {(displayName || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs font-semibold max-w-[90px] truncate text-white">
                    {displayName}
                  </span>
                  {!emailVerified ? (
                    <span className="bg-amber-400 text-slate-950 rounded-full px-1.5 py-0.2 text-[9px] font-extrabold tracking-wider uppercase">
                      Unverified
                    </span>
                  ) : isAdmin ? (
                    <span className="bg-[#3fae49] text-[#06210a] rounded-full px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase">
                      Admin
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs font-semibold border border-white/40 hover:border-white text-white rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="inline-flex p-0.5 border border-white/30 rounded-full" role="group" aria-label="Sign up or log in">
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="text-xs font-semibold text-white px-2.5 py-1 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="text-xs font-semibold bg-[#3fae49] text-[#06210a] px-3 py-1 rounded-full hover:brightness-105 transition-colors cursor-pointer"
                >
                  Log in
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-white/30 text-white"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <span className="block w-4 h-0.5 bg-white mb-1" />
              <span className="block w-4 h-0.5 bg-white mb-1" />
              <span className="block w-4 h-0.5 bg-white" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-[#06364d] border border-white/20 rounded-2xl p-4 shadow-2xl mt-2 flex flex-col gap-3 text-sm z-50">
              <button
                onClick={() => {
                  setActiveSection('home');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-1.5 ${activeSection === 'home' ? 'text-[#1bb6d4] font-bold' : 'text-white'}`}
              >
                Home & Services
              </button>
              <button
                onClick={() => {
                  setActiveSection('tracker');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-1.5 ${activeSection === 'tracker' ? 'text-[#1bb6d4] font-bold' : 'text-white'}`}
              >
                Track Quotations & Bookings
              </button>
              <button
                onClick={() => {
                  setActiveSection('management');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-1.5 ${activeSection === 'management' ? 'text-[#1bb6d4] font-bold' : 'text-white'}`}
              >
                {isAdmin ? 'Admin & Tech Dispatch' : 'Technician Field Logs'}
              </button>
              <button
                onClick={() => {
                  onOpenDriveModal();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 text-[#3fae49] font-bold flex items-center gap-1.5"
              >
                <CloudUpload className="w-4 h-4" />
                Add Projects to Google Drive
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
