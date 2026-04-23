"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, Mail, Phone, FileText, Calendar, LogOut, Shield,
  Check, AlertCircle, Loader2, ArrowLeft, Trash2, X
} from "lucide-react";
import { useUser } from "@/lib/user-context";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
} as any;

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  bio?: string;
}

export default function ProfilePage({ onBack }: { onBack?: () => void }) {
  const { user, updating, updateProfile, signOut, deleteAccount } = useUser();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [toast, setToast] = useState<ToastState>({ show: false, type: "success", message: "" });
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form from user context
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setBio(user.bio);
      setPhone(user.phone);
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }
    if (phone && !/^[\d\s\-+()]*$/.test(phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (bio.length > 300) {
      newErrors.bio = "Bio must be under 300 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const result = await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatarUrl,
    });
    if (result.success) {
      setToast({ show: true, type: "success", message: "Profile updated successfully" });
      setDirty(false);
    } else {
      setToast({ show: true, type: "error", message: result.error || "Failed to update profile" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setToast({ show: true, type: "error", message: "Please select an image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ show: true, type: "error", message: "Image must be under 5MB" });
      return;
    }

    setAvatarUploading(true);
    try {
      // Read file as data URL for local storage
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        setAvatarUrl(dataUrl);
        setDirty(true);
        setAvatarUploading(false);
      };
      reader.onerror = () => {
        setToast({ show: true, type: "error", message: "Failed to read image file" });
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setToast({ show: true, type: "error", message: "Failed to upload avatar" });
      setAvatarUploading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await signOut();
  };

  const handleFieldChange = (setter: (v: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setter(e.target.value);
    setDirty(true);
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen relative">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-2xl ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-4xl mx-auto p-5 md:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl text-white/95 font-semibold tracking-tight">
              Profile
            </h1>
            <p className="text-white/25 text-sm mt-0.5">Manage your personal information</p>
          </div>
        </motion.div>

        {/* Avatar & Banner Card */}
        <motion.div
          variants={fadeUp}
          className="bg-[#140a25]/90 rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
        >
          {/* Banner */}
          <div className="h-32 md:h-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7209B7] via-[#560BAD] to-[#F72585]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:4px_4px]" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#140a25]/90 to-transparent" />
          </div>

          {/* Avatar + Info */}
          <div className="px-6 md:px-8 pb-6 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl border-4 border-[#140a25] bg-gradient-to-tr from-[#3A0CA3] to-[#F72585] overflow-hidden shadow-xl flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Name & Meta */}
              <div className="flex-1 pb-1">
                <h2 className="text-xl font-semibold text-white/95 tracking-tight">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-white/30 text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={updating || !dirty}
                className={`px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  dirty
                    ? "bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                    : "bg-white/[0.04] text-white/30 border border-white/[0.06] cursor-default"
                }`}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          variants={fadeUp}
          className="bg-[#140a25]/90 rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-white/20" />
            <p className="text-white/20 text-[11px] uppercase tracking-[0.15em] font-semibold">
              Personal Information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-[13px] font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-white/30" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={handleFieldChange(setFullName)}
                placeholder="Your full name"
                className={`h-11 w-full rounded-lg border bg-white/[0.03] px-4 text-sm text-white/90 placeholder:text-white/20 outline-none transition-colors ${
                  errors.fullName
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-[#7209B7]/60"
                }`}
              />
              {errors.fullName && (
                <span className="text-red-400 text-[12px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-[13px] font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/30" />
                Email Address
              </label>
              <div className="h-11 w-full rounded-lg border border-white/[0.06] bg-white/[0.01] px-4 text-sm text-white/40 flex items-center cursor-not-allowed">
                {user?.email || "—"}
              </div>
              <span className="text-white/20 text-[11px]">Email cannot be changed</span>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-[13px] font-medium flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/30" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handleFieldChange(setPhone)}
                placeholder="+1 (555) 000-0000"
                className={`h-11 w-full rounded-lg border bg-white/[0.03] px-4 text-sm text-white/90 placeholder:text-white/20 outline-none transition-colors ${
                  errors.phone
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-[#7209B7]/60"
                }`}
              />
              {errors.phone && (
                <span className="text-red-400 text-[12px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Member Since (read-only) */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-[13px] font-medium flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-white/30" />
                Member Since
              </label>
              <div className="h-11 w-full rounded-lg border border-white/[0.06] bg-white/[0.01] px-4 text-sm text-white/40 flex items-center cursor-not-allowed">
                {memberSince}
              </div>
            </div>

            {/* Bio - full width */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-white/60 text-[13px] font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-white/30" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={handleFieldChange(setBio)}
                placeholder="Tell us about yourself..."
                rows={3}
                className={`w-full rounded-lg border bg-white/[0.03] px-4 py-3 text-sm text-white/90 placeholder:text-white/20 outline-none transition-colors resize-none ${
                  errors.bio
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-[#7209B7]/60"
                }`}
              />
              <div className="flex items-center justify-between">
                {errors.bio ? (
                  <span className="text-red-400 text-[12px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.bio}
                  </span>
                ) : (
                  <span />
                )}
                <span
                  className={`text-[11px] ${
                    bio.length > 280 ? "text-amber-400" : "text-white/20"
                  }`}
                >
                  {bio.length}/300
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          variants={fadeUp}
          className="bg-[#140a25]/90 rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-white/20" />
            <p className="text-white/20 text-[11px] uppercase tracking-[0.15em] font-semibold">
              Account
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-[13px] font-medium">Sign Out</p>
              <p className="text-white/30 text-[12px] mt-0.5">
                Sign out of your account on this device
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signOutLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
            >
              {signOutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={fadeUp}
          className="bg-[#140a25]/90 rounded-xl border border-red-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Trash2 className="w-4 h-4 text-red-400/60" />
            <p className="text-red-400/60 text-[11px] uppercase tracking-[0.15em] font-semibold">
              Danger Zone
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-[13px] font-medium">Delete Account</p>
              <p className="text-white/30 text-[12px] mt-0.5">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </motion.div>

        {/* Delete Account Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-sm bg-[#0c0515] border border-red-500/20 rounded-2xl shadow-2xl p-6"
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-white/90 font-semibold text-base">Delete Account</h3>
                </div>
                <p className="text-white/40 text-sm mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-white/30 text-[13px] space-y-1 mb-6 pl-4">
                  <li className="flex items-center gap-2">• Your profile and personal data</li>
                  <li className="flex items-center gap-2">• All chat history and conversations</li>
                  <li className="flex items-center gap-2">• Flashcards, notes, and study data</li>
                </ul>
                <p className="text-red-400/80 text-[12px] font-medium mb-6">
                  This action is irreversible.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setDeleteLoading(true);
                      const result = await deleteAccount();
                      if (!result.success) {
                        setDeleteLoading(false);
                        setShowDeleteConfirm(false);
                        setToast({ show: true, type: "error", message: result.error || "Failed to delete account" });
                      }
                    }}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors cursor-pointer"
                  >
                    {deleteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deleteLoading ? "Deleting…" : "Delete Forever"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
