import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Clock,
  Inbox,
  AlertTriangle
} from 'lucide-react';

interface ManualVerificationCheckpointProps {
  onVerifiedSuccess?: () => void;
  onToast: (msg: string) => void;
}

export const ManualVerificationCheckpoint: React.FC<ManualVerificationCheckpointProps> = ({
  onVerifiedSuccess,
  onToast,
}) => {
  const { user, sendVerificationEmail, checkEmailVerification, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const userEmail = user?.email || 'your email';

  // Manual verification check triggered by user button click
  const handleCheckVerification = async () => {
    setChecking(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        setSuccessMessage('Email verified successfully! Unlocking full access to Sello Pools...');
        onToast('Email confirmed! Welcome to Sello Pools.');
        if (onVerifiedSuccess) {
          setTimeout(() => onVerifiedSuccess(), 1000);
        }
      } else {
        setErrorMessage(
          'Email not yet confirmed. Please open your inbox, click the verification link in the email, and then click this button again.'
        );
      }
    } catch (err: any) {
      console.error('Verification check error:', err);
      setErrorMessage(err?.message || 'Could not verify status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  // Resend marked verification email manually
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage(null);
    setResendSuccess(null);

    try {
      await sendVerificationEmail();
      setResendSuccess(`A marked verification email was resent to ${userEmail}. Please check your inbox.`);
      onToast(`Marked verification email sent to ${userEmail}!`);
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error resending verification:', err);
      if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Too many requests. Please wait a minute before requesting another verification email.');
      } else {
        setErrorMessage(err?.message || 'Could not send verification email. Try again shortly.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-4 py-12 sm:py-16">
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-[#1bb6d4] to-[#3fae49]" />

        {/* Header icon and badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Manual Confirmation Required
                </span>
                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                  Pending
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] mt-0.5 font-heading">
                Verify Your Email to Continue
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] bg-[var(--bg)] px-3 py-1.5 rounded-full border border-[var(--line)] self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3fae49]" />
            <span>Anti-Automation Policy Active</span>
          </div>
        </div>

        {/* Main message */}
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p className="text-[var(--ink)] font-medium">
            A marked verification email was dispatched to:
          </p>

          <div className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1bb6d4]/10 text-[#1bb6d4] flex items-center justify-center shrink-0">
                <Inbox className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)]">Destination Inbox</p>
                <p className="font-bold text-[var(--ink)] text-sm sm:text-base truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30 shrink-0">
              Awaiting Link Click
            </span>
          </div>

          {/* Security rule notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Manual Confirmation Notice</span>
            </div>
            <p>
              In accordance with security requirements, <strong>automated verifications are strictly disabled</strong>. You must open the verification email manually in your email provider and click the confirmation link before access to the website is unlocked.
            </p>
          </div>

          {/* Steps required */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-3">
              Follow these steps to continue:
            </h4>
            <ol className="space-y-2.5 text-xs text-[var(--ink)]">
              <li className="flex items-start gap-2.5 bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                <span className="w-5 h-5 rounded-full bg-[#06364d] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong>Open your email inbox</strong> for <span className="text-[#1bb6d4]">{userEmail}</span> (check your Spam/Junk folder if you don't see it).
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                <span className="w-5 h-5 rounded-full bg-[#06364d] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Click the verification link</strong> in the email sent by Sello Pools / Firebase Authentication.
                </div>
              </li>
              <li className="flex items-start gap-2.5 bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                <span className="w-5 h-5 rounded-full bg-[#06364d] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong>Click "I Have Confirmed in My Email" below</strong> to refresh your account verification status and proceed to the website.
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mt-5 p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Not yet confirmed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {resendSuccess && (
          <div className="mt-5 p-3.5 bg-cyan-500/10 border border-cyan-500/40 rounded-2xl text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full sm:flex-1 py-3 px-5 rounded-full font-bold bg-[var(--lime)] text-[#06210a] text-sm hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Firebase Status...' : "I Have Confirmed in My Email"}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full sm:w-auto py-3 px-5 rounded-full font-semibold bg-[var(--bg)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 text-[#1bb6d4]" />
            <span>
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : resending
                ? 'Sending Email...'
                : 'Resend Verification Email'}
            </span>
          </button>
        </div>

        {/* Secondary options */}
        <div className="mt-5 flex items-center justify-between text-xs text-[var(--muted)] pt-3 border-t border-[var(--line)]/50">
          <span>Entered the wrong email?</span>
          <button
            type="button"
            onClick={signOut}
            className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out / Change account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
