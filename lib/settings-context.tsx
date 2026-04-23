"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface SettingsState {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  dailyInsights: boolean;
  setDailyInsights: (v: boolean) => void;
  focusTime: number;
  setFocusTime: (v: number) => void;
  learningStyle: string;
  setLearningStyle: (v: string) => void;
  activeAgent: string;
  setActiveAgent: (v: string) => void;
  memoryEnabled: boolean;
  setMemoryEnabled: (v: boolean) => void;
  theme: string;
  setTheme: (v: string) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyInsights, setDailyInsights] = useState(true);
  const [focusTime, setFocusTime] = useState(25);
  const [learningStyle, setLearningStyle] = useState("visual");
  const [activeAgent, setActiveAgent] = useState("groq");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const stored = localStorage.getItem("atlas_pref");
    if (stored) {
      const p = JSON.parse(stored);
      setSoundEnabled(p.soundEnabled ?? true);
      setDailyInsights(p.dailyInsights ?? true);
      setFocusTime(p.focusTime ?? 25);
      setLearningStyle(p.learningStyle ?? "visual");
      setActiveAgent(p.activeAgent ?? "groq");
      setMemoryEnabled(p.memoryEnabled ?? true);
      setTheme(p.theme ?? "system");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "atlas_pref",
      JSON.stringify({
        soundEnabled,
        dailyInsights,
        focusTime,
        learningStyle,
        activeAgent,
        memoryEnabled,
        theme,
      }),
    );
  }, [soundEnabled, dailyInsights, focusTime, learningStyle, activeAgent, memoryEnabled, theme]);

  return (
    <SettingsContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        dailyInsights,
        setDailyInsights,
        focusTime,
        setFocusTime,
        learningStyle,
        setLearningStyle,
        activeAgent,
        setActiveAgent,
        memoryEnabled,
        setMemoryEnabled,
        theme,
        setTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    return {
      soundEnabled: true,
      dailyInsights: true,
      focusTime: 25,
      learningStyle: "visual",
      activeAgent: "atlas",
    } as SettingsState;
  return context;
};
