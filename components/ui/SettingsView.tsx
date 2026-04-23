"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, Cpu, Shield, Download, Trash2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");

  // Mock states for the settings toggles
  const [theme, setTheme] = useState("system");
  const [model, setModel] = useState("atlas-pro");
  const [memory, setMemory] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl h-[600px] max-h-[85vh] bg-[#0c0515] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
            <h2 className="text-lg font-semibold text-white/90 tracking-wide">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-white/40 hover:text-white/90 hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-48 md:w-64 bg-white/[0.01] border-r border-white/[0.04] p-4 flex flex-col gap-1">
              <TabButton
                active={activeTab === "general"}
                onClick={() => setActiveTab("general")}
                icon={Monitor}
                label="General"
              />
              <TabButton
                active={activeTab === "ai"}
                onClick={() => setActiveTab("ai")}
                icon={Cpu}
                label="AI Model"
              />
              <TabButton
                active={activeTab === "data"}
                onClick={() => setActiveTab("data")}
                icon={Shield}
                label="Data Controls"
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              {activeTab === "general" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SettingSection title="Appearance">
                    <div className="flex items-center justify-between">
                      <SettingDescription
                        title="Theme"
                        desc="Customize the look of your workspace."
                      />
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="bg-[#140a25] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7209B7] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="system">System Default</option>
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                      </select>
                    </div>
                  </SettingSection>

                  <SettingSection title="Chat Behavior">
                    <div className="flex items-center justify-between">
                      <SettingDescription
                        title="Send Message"
                        desc="Use Enter to send, Shift+Enter for new line."
                      />
                      <Toggle isOn={true} onToggle={() => {}} />
                    </div>
                  </SettingSection>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SettingSection title="Model Preferences">
                    <div className="flex items-center justify-between">
                      <SettingDescription
                        title="Default Model"
                        desc="Select the primary AI model for new chats."
                      />
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-[#140a25] border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#7209B7] transition-colors appearance-none cursor-pointer min-w-[140px]"
                      >
                        <option value="atlas-pro">
                          Atlas Pro (Recommended)
                        </option>
                        <option value="atlas-fast">Atlas Flash (Fast)</option>
                        <option value="gpt-4">GPT-4 Turbo</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                      <SettingDescription
                        title="Context Memory"
                        desc="Allow the AI to remember details across different conversations."
                      />
                      <Toggle
                        isOn={memory}
                        onToggle={() => setMemory(!memory)}
                      />
                    </div>
                  </SettingSection>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <SettingSection title="Export & History">
                    <div className="flex items-center justify-between">
                      <SettingDescription
                        title="Export Data"
                        desc="Download a copy of your chats, flashcards, and notes."
                      />
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-lg text-sm text-white/80 transition-colors">
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                      <SettingDescription
                        title="Clear Chat History"
                        desc="Permanently delete all conversation logs."
                      />
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors">
                        <Trash2 className="w-4 h-4" /> Clear History
                      </button>
                    </div>
                  </SettingSection>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// --- Helper Components for clean UI ---

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
        active
          ? "bg-white/[0.06] text-white font-medium"
          : "text-white/40 hover:bg-white/[0.02] hover:text-white/80"
      }`}
    >
      <Icon
        className={`w-[18px] h-[18px] ${active ? "text-white/90" : "text-white/40"}`}
      />
      {label}
    </button>
  );
}

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-white/90 font-medium text-sm">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function SettingDescription({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1 pr-4">
      <span className="text-white/80 text-[13px] font-medium">{title}</span>
      <span className="text-white/40 text-[12px]">{desc}</span>
    </div>
  );
}

function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isOn ? "bg-[#7209B7]" : "bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isOn ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
