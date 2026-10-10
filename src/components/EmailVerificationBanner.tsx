import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { Mail, CheckCircle2, RefreshCw, Send, AlertTriangle, X } from 'lucide-react';

interface EmailVerificationBannerProps {
  onToast: (msg: string) => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ onToast }) => {
  const { user, emailVerified, sendVerificationEmail, checkEmailVerification } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // If unauthenticated or already verified or user dismissed for this turn, do not show
  if (!user || emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await sendVerificationEmail();
      onToast(`Verification email sent to ${user.email}!`);
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
      console.error('Error sending verification email:', err);
      onToast(err?.message || 'Could not send verification email. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        onToast('Email successfully verified! Full access unlocked.');
      } else {
        onToast('Email not yet verified. Please click the link in your email first.');
      }
    } catch (err: any) {
      console.error('Error checking verification:', err);
      onToast('Could not refresh status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900 border-b border-amber-600/40 text-amber-200 px-4 py-3 sm:py-3.5 relative shadow-md animate-fade-in text-xs">
      <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                Please verify your email address
              </span>
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded uppercase">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90 mt-0.5">
              We sent a verification link to <strong className="text-white">{user.email}</strong>. Verifying your email secures your quotation records and project scheduling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="px-3 py-1.5 rounded-full font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend Email'}</span>
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="px-3 py-1.5 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : "I've Verified (Refresh)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-amber-300/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
