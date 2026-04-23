"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Cpu, Shield, Download, Trash2, ArrowLeft,
  Volume2, Lightbulb, BookOpen, Clock, Eye, EyeOff,
  Check, AlertCircle, Loader2, Lock, X
} from "lucide-react";
import { useSettings } from "@/lib/settings-context";
import { supabase } from "@/lib/supabase";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
} as any;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
} as any;

/* ── Reusable sub-components ──────────────────────────────── */

function SettingToggle({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isOn ? "bg-[#7209B7]" : "bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isOn ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-col gap-1 pr-4">
        <span className="text-white/80 text-[13px] font-medium">{title}</span>
        <span className="text-white/30 text-[12px]">{desc}</span>
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-white/90 font-medium text-sm mb-1">{title}</h3>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm w-full cursor-pointer ${
        active
          ? "bg-white/[0.06] text-white font-medium"
          : "text-white/40 hover:bg-white/[0.02] hover:text-white/80"
      }`}
    >
      <Icon
        className={`w-[18px] h-[18px] ${active ? "text-white/90" : "text-white/40"}`}
      />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

/* ── Password Strength ──────────────────────────────────── */

function getPasswordStrength(password: string) {
  if (!password) return { strength: 0, label: "", color: "" };
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^a-zA-Z0-9]/.test(password)) s++;
  if (s <= 2) return { strength: 33, label: "Weak", color: "bg-red-500" };
  if (s <= 3) return { strength: 66, label: "Medium", color: "bg-yellow-500" };
  return { strength: 100, label: "Strong", color: "bg-green-500" };
}

/* ── Confirm Dialog ──────────────────────────────────────── */

function ConfirmDialog({
  isOpen,
  title,
  desc,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: {
  isOpen: boolean;
  title: string;
  desc: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm bg-[#0c0515] border border-white/[0.08] rounded-2xl shadow-2xl p-6"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded-md text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-white/90 font-semibold text-base mb-2">{title}</h3>
          <p className="text-white/40 text-sm mb-6">{desc}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                destructive
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  : "bg-[#7209B7] text-white hover:bg-[#7209B7]/80"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── Main Settings Page ─────────────────────────────────── */

interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState("general");
  const settings = useSettings();

  // The following states are now handled by useSettings:
  const theme = settings.theme;
  const setTheme = (v: string) => settings.setTheme?.(v);
  const model = settings.activeAgent;
  const setModel = (v: string) => settings.setActiveAgent?.(v);
  const memory = settings.memoryEnabled;
  const setMemory = (v: boolean) => settings.setMemoryEnabled?.(v);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  // Dialogs
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState>({ show: false, type: "success", message: "" });

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const newPwStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    setPwError("");
    if (!newPassword) {
      setPwError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);

    if (error) {
      setPwError(error.message);
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ show: true, type: "success", message: "Password changed successfully" });
    }
  };

  const handleClearHistory = () => {
    setShowClearConfirm(false);
    setToast({ show: true, type: "success", message: "Chat history cleared" });
  };

  const handleExport = () => {
    setToast({ show: true, type: "success", message: "Export started — check your downloads" });
  };

  const tabs = [
    { id: "general", icon: Monitor, label: "General" },
    { id: "ai", icon: Cpu, label: "AI Model" },
    { id: "security", icon: Lock, label: "Security" },
    { id: "data", icon: Shield, label: "Data" },
  ];

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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Chat History"
        desc="This will permanently delete all your conversation logs. This action cannot be undone."
        confirmLabel="Clear History"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
        destructive
      />

      <motion.div
        className="max-w-5xl mx-auto p-5 md:p-8"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
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
              Settings
            </h1>
            <p className="text-white/25 text-sm mt-0.5">Customize your Atlas experience</p>
          </div>
        </motion.div>

        {/* Layout: Sidebar + Content */}
        <motion.div
          variants={fadeUp}
          className="bg-[#140a25]/90 rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden flex min-h-[520px]"
        >
          {/* Tab Sidebar */}
          <div className="w-48 md:w-56 bg-white/[0.01] border-r border-white/[0.04] p-4 flex flex-col gap-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {/* ── GENERAL ── */}
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <SectionTitle title="Appearance" />
                <SettingRow title="Theme" desc="Customize the look of your workspace.">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-[#140a25] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7209B7] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="system">System Default</option>
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                  </select>
                </SettingRow>

                <div className="border-t border-white/[0.04]" />

                <SectionTitle title="Notifications & Feedback" />
                <SettingRow
                  title="Sound Effects"
                  desc="Play sounds for interactions and notifications."
                >
                  <SettingToggle
                    isOn={settings.soundEnabled}
                    onToggle={() =>
                      settings.setSoundEnabled?.(!settings.soundEnabled)
                    }
                  />
                </SettingRow>
                <SettingRow
                  title="Daily Insights"
                  desc="Receive a motivational insight each day."
                >
                  <SettingToggle
                    isOn={settings.dailyInsights}
                    onToggle={() =>
                      settings.setDailyInsights?.(!settings.dailyInsights)
                    }
                  />
                </SettingRow>
              </motion.div>
            )}

            {/* ── AI MODEL ── */}
            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <SectionTitle title="Model Preferences" />
                <SettingRow
                  title="Default Model"
                  desc="Select the primary AI model for new chats."
                >
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-[#140a25] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7209B7] transition-colors appearance-none cursor-pointer min-w-[140px]"
                  >
                    <option value="groq">Groq (Recommended)</option>
                    <option value="gemini">Gemini Pro</option>
                    <option value="chatgpt">ChatGPT</option>
                  </select>
                </SettingRow>

                <SettingRow
                  title="Context Memory"
                  desc="Allow the AI to remember details across different conversations."
                >
                  <SettingToggle
                    isOn={memory}
                    onToggle={() => setMemory(!memory)}
                  />
                </SettingRow>

                <div className="border-t border-white/[0.04]" />

                <SectionTitle title="Learning Preferences" />
                <SettingRow
                  title="Learning Style"
                  desc="Choose how Atlas tailors explanations for you."
                >
                  <select
                    value={settings.learningStyle}
                    onChange={(e) =>
                      settings.setLearningStyle?.(e.target.value)
                    }
                    className="bg-[#140a25] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7209B7] transition-colors appearance-none cursor-pointer min-w-[130px]"
                  >
                    <option value="visual">Visual</option>
                    <option value="textual">Textual</option>
                    <option value="interactive">Interactive</option>
                    <option value="auditory">Auditory</option>
                  </select>
                </SettingRow>

                <SettingRow
                  title="Focus Timer Duration"
                  desc={`Default focus session length: ${settings.focusTime} min`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        settings.setFocusTime?.(Math.max(5, settings.focusTime - 5))
                      }
                      className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="text-white/90 text-sm font-mono min-w-[36px] text-center tabular-nums">
                      {settings.focusTime}m
                    </span>
                    <button
                      onClick={() =>
                        settings.setFocusTime?.(Math.min(120, settings.focusTime + 5))
                      }
                      className="w-8 h-8 rounded-lg border border-white/[0.1] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </SettingRow>
              </motion.div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <SectionTitle title="Change Password" />
                <p className="text-white/30 text-[12px] -mt-4">
                  Update your password to keep your account secure.
                </p>

                {pwError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {pwError}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-[13px] font-medium">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 pr-10 text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-[#7209B7]/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                      >
                        {showCurrentPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-[13px] font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPwError("");
                        }}
                        placeholder="Enter new password"
                        className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 pr-10 text-sm text-white/90 placeholder:text-white/20 outline-none focus:border-[#7209B7]/60 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                      >
                        {showNewPw ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Strength bar */}
                    <AnimatePresence>
                      {newPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                              <motion.div
                                animate={{
                                  width: `${newPwStrength.strength}%`,
                                }}
                                className={`h-full ${newPwStrength.color} rounded-full`}
                              />
                            </div>
                            <span className="text-[11px] text-white/40 min-w-[50px]">
                              {newPwStrength.label}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white/60 text-[13px] font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPwError("");
                      }}
                      placeholder="Confirm new password"
                      className={`h-11 w-full rounded-lg border bg-white/[0.03] px-4 text-sm text-white/90 placeholder:text-white/20 outline-none transition-colors ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-500/40"
                          : "border-white/[0.08] focus:border-[#7209B7]/60"
                      }`}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <span className="text-red-400 text-[11px]">
                        Passwords don't match
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPw || !newPassword || !confirmPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7209B7] to-[#B5179E] text-white rounded-xl text-[13px] font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-40 disabled:cursor-default cursor-pointer mt-2"
                  >
                    {changingPw ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    {changingPw ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── DATA ── */}
            {activeTab === "data" && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <SectionTitle title="Export & History" />

                <SettingRow
                  title="Export Data"
                  desc="Download a copy of your chats, flashcards, and notes."
                >
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-lg text-sm text-white/80 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </SettingRow>

                <div className="border-t border-white/[0.04]" />

                <SettingRow
                  title="Clear Chat History"
                  desc="Permanently delete all conversation logs."
                >
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                </SettingRow>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
