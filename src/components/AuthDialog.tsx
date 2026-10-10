import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { Sparkles, User, Phone, MapPin, CheckSquare, Square } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  initialMode?: 'signup' | 'login';
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
  onOpenSettings?: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccessToast,
  onOpenSettings,
}) => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('Centurion, Pretoria');
  const [openSettingsAfterSignup, setOpenSettingsAfterSignup] = useState(true);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setStatusMessage(null);
    setIsError(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsError(false);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setIsError(true);
        setStatusMessage('Please enter email and password.');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (password.length < 6) {
          setIsError(true);
          setStatusMessage('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const { verificationSent } = await signUpWithEmail(fullName, email, password, {
          phone: phone.trim(),
          suburb: suburb.trim(),
        });

        if (verificationSent) {
          onSuccessToast?.(`A marked verification email was dispatched to ${email}. You must confirm manually to continue.`);
        } else {
          onSuccessToast?.(`Account created! Please check ${email} for your verification link.`);
        }

        onClose();
        // Do not pop settings over the manual verification gate
      } else {
        await signInWithEmail(email, password);
        onSuccessToast?.('Welcome back! Logged in successfully.');
        onClose();
      }
    } catch (err: any) {
      setIsError(true);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setStatusMessage('This email is already registered. Try logging in.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setStatusMessage('Invalid email or password.');
      } else if (code === 'auth/user-not-found') {
        setStatusMessage('No account found with this email. Please sign up.');
      } else {
        setStatusMessage(err?.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setStatusMessage(null);
    setIsError(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccessToast?.('Signed in with Google securely!');
      onClose();
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(3,24,32,0.65)] backdrop-blur-sm animate-fade-in">
      <div
        id="adlg"
        data-mode={mode}
        className="relative bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[24px] p-6 sm:p-8 w-full max-w-[460px] shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          id="aclose"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--bg)] text-[var(--ink)] text-2xl flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer border border-[var(--line)]"
        >
          &times;
        </button>

        {/* Mode Toggle (Segment) */}
        <div className="inline-flex p-1 border border-[var(--line)] rounded-full bg-[var(--bg)]" role="group">
          <button
            type="button"
            data-mode="signup"
            aria-pressed={mode === 'signup'}
            onClick={() => {
              setMode('signup');
              setStatusMessage(null);
            }}
            className={`font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--lime)] text-[#06210a] shadow-sm'
                : 'text-[var(--ink)] opacity-70 hover:opacity-100'
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            data-mode="login"
            aria-pressed={mode === 'login'}
            onClick={() => {
              setMode('login');
              setStatusMessage(null);
            }}
            className={`font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--lime)] text-[#06210a] shadow-sm'
                : 'text-[var(--ink)] opacity-70 hover:opacity-100'
            }`}
          >
            Log in
          </button>
        </div>

        {/* Title & Subtitle */}
        <h2 id="adt" className="text-2xl sm:text-3xl font-extrabold mt-4 mb-1">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          {mode === 'signup'
            ? 'Sign up to keep track of your quotations, project timeline, and edit account settings.'
            : 'Log in to view quotation status, bookings, and technician logs.'}
        </p>

        {/* Status display */}
        {statusMessage && (
          <div
            id="ast"
            role="status"
            className={`p-3 rounded-xl text-xs font-medium mb-3 border ${
              isError
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-cyan-50 border-cyan-300 text-cyan-900'
            }`}
          >
            {statusMessage}
          </div>
        )}

        <form id="aform" onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <>
              <label id="anl" className="block font-semibold">
                <span className="block mb-1 text-[var(--ink)]">Full name</span>
                <input
                  name="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Johan van der Merwe"
                  className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)] text-sm"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="block font-semibold">
                  <span className="block mb-1 text-[var(--ink)]">Phone / WhatsApp (Optional)</span>
                  <input
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="082 555 4912"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)] text-sm"
                  />
                </label>

                <label className="block font-semibold">
                  <span className="block mb-1 text-[var(--ink)]">Suburb in Pretoria</span>
                  <input
                    name="suburb"
                    type="text"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    placeholder="Centurion"
                    className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)] text-sm"
                  />
                </label>
              </div>
            </>
          )}

          <label className="block font-semibold">
            <span className="block mb-1 text-[var(--ink)]">Email *</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="name@example.co.za"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)] text-sm"
            />
          </label>

          <label className="block font-semibold">
            <span className="block mb-1 text-[var(--ink)]">Password *</span>
            <input
              name="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)] text-sm"
            />
          </label>

          {mode === 'signup' && (
            <div
              onClick={() => setOpenSettingsAfterSignup(!openSettingsAfterSignup)}
              className="flex items-center gap-2 cursor-pointer pt-1 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {openSettingsAfterSignup ? (
                <CheckSquare className="w-4 h-4 text-[#1bb6d4]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-[11px]">Open profile & account settings after creating account</span>
            </div>
          )}

          <button
            type="submit"
            id="asub"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full font-bold bg-[var(--lime)] text-[#06210a] text-sm hover:brightness-105 transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account & Setup Profile' : 'Log in'}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[var(--line)]" />
            <span className="text-[var(--muted)] text-xs">or</span>
            <div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          <button
            type="button"
            id="agoogle"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full font-semibold bg-white text-[#1f1f1f] border border-[#dadce0] text-sm hover:bg-[#f8fafc] flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};
