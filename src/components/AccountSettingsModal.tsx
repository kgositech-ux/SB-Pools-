import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { uploadTaskPhoto } from '../firebase/storage';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Camera,
  CheckCircle2,
  X,
  LogOut,
  Save,
  Calendar,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const {
    user,
    profile,
    isBootstrapAdmin,
    effectiveRole,
    emailVerified,
    sendVerificationEmail,
    checkEmailVerification,
    updateUserProfile,
    signOut,
  } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('');
  const [address, setAddress] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user || profile) {
      setDisplayName(profile?.displayName || user?.displayName || '');
      setPhone(profile?.phone || '');
      setSuburb(profile?.suburb || 'Centurion, Pretoria');
      setAddress(profile?.address || '');
      setPhotoURL(profile?.photoURL || user?.photoURL || '');
    }
  }, [user, profile, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const downloadUrl = await uploadTaskPhoto(`avatar_${user.uid}`, file);
      setPhotoURL(downloadUrl);
      await updateUserProfile({ photoURL: downloadUrl });
      onToast('Profile picture updated!');
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        phone: phone.trim(),
        suburb: suburb.trim(),
        address: address.trim(),
        photoURL,
      });

      setSuccessMessage('Profile and account settings updated successfully!');
      onToast('Account settings saved!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChoosePresetAvatar = async (url: string) => {
    setPhotoURL(url);
    await updateUserProfile({ photoURL: url });
    onToast('Avatar updated!');
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  const roleLabel = isBootstrapAdmin
    ? 'Master Administrator'
    : effectiveRole === 'technician'
    ? 'Pool Maintenance Technician'
    : 'Pool Owner / Client';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Today';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(3,24,32,0.7)] backdrop-blur-sm animate-fade-in">
      <div className="relative bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[24px] p-6 sm:p-8 w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--bg)] text-[var(--ink)] text-2xl flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer border border-[var(--line)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--line)]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0a6f93] to-[#1bb6d4] text-white flex items-center justify-center shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[var(--ink)]">
              Account Settings & Profile Edits
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Manage your personal details, contact number, and service address in Pretoria.
            </p>
          </div>
        </div>

        {/* Status notification */}
        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-5 text-xs">
          {/* Avatar & Role Header Box */}
          <div className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName || 'User'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1bb6d4] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#06364d] text-white flex items-center justify-center font-bold text-xl border-2 border-[#1bb6d4]">
                  {(displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}

              <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#1bb6d4] text-[#06210a] shadow-md hover:brightness-110 cursor-pointer transition-all">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-base text-[var(--ink)] font-heading">
                  {displayName || 'Pool Client'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3fae49] text-[#06210a] uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
              <p className="text-[var(--muted)] text-xs mt-0.5">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-[11px] text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#1bb6d4]" />
                  Member since {memberSince}
                </span>
                <span>•</span>
                <span className="font-mono text-[10px]">UID: {user?.uid.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Quick Avatar Presets */}
          <div>
            <label className="block text-[var(--muted)] font-semibold mb-1.5">
              Choose or upload profile avatar
            </label>
            <div className="flex items-center gap-2">
              {presetAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChoosePresetAvatar(url)}
                  className="w-9 h-9 rounded-full overflow-hidden border border-[var(--line)] hover:border-[#1bb6d4] hover:scale-105 transition-all cursor-pointer"
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
              <span className="text-[11px] text-[var(--muted)] ml-2">or tap camera icon to upload</span>
            </div>
          </div>

          {/* Form inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1 text-[var(--ink)]">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Johan van der Merwe"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[var(--ink)]">Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 082 555 4912"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1 text-[var(--ink)]">Suburb / Area</label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="e.g. Centurion, Pretoria East"
                className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[var(--ink)]">Email Address</label>
                {emailVerified ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Email
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Unverified
                  </span>
                )}
              </div>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[var(--bg)]/50 border border-[var(--line)] rounded-xl p-2.5 text-sm text-[var(--muted)] opacity-70 cursor-not-allowed"
              />
              {!emailVerified && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-900">
                  <span>Verification link needed?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await sendVerificationEmail();
                          onToast('Verification email sent! Please check your inbox.');
                        } catch (err: any) {
                          onToast(err?.message || 'Error sending email');
                        }
                      }}
                      className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 rounded font-bold transition-colors cursor-pointer"
                    >
                      Resend Link
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const verified = await checkEmailVerification();
                        if (verified) onToast('Email verified successfully!');
                        else onToast('Email not yet verified. Please click the link in your email.');
                      }}
                      className="px-2 py-0.5 bg-white border border-amber-300 hover:bg-amber-100 rounded font-bold transition-colors cursor-pointer"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[var(--ink)]">Street Address / Property Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 142 Wierda Rd, Centurion"
              className="w-full bg-[var(--bg)] border border-[var(--line)] rounded-xl p-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--aqua)]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-full font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 bg-[var(--bg)] border border-[var(--line)] text-[var(--ink)] hover:opacity-80 rounded-full font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingAvatar}
                className="flex-1 sm:flex-none px-6 py-2 bg-[#3fae49] text-[#06210a] hover:brightness-105 rounded-full font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
