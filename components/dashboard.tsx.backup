"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  RotateCcw,
  Settings, MessageCircle, BookOpen, Zap, FileText,
  User, Bot, Home, GraduationCap, ChevronDown, Minus, Plus, ChevronLeft
} from "lucide-react"
import { BentoGrid, type BentoItem } from "./ui/bento-grid"
import { BeamsBackground } from "./ui/beams-background"
import { AgentChat } from "./ui/agent-chat"
import ProfilePage from "./ui/profile-page"
import SettingsPage from "./ui/settings-page"
import { SettingsProvider, useSettings } from "../lib/settings-context"
import { FlashcardsPage } from "./ui/flashcards-page"
import { useUser } from "../lib/user-context"
import AtlasLogo from "../assets/Atlas Minimal Logo.svg"
import { NotesPage } from "./ui/notes-page"
import { QuizPage } from "./ui/quiz-page"
import { MindmapPage } from "./ui/mindmap-page"

function DashboardInner() {
  const { user } = useUser()
  const settings = useSettings()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [studyExpanded, setStudyExpanded] = useState(true)
  const focusDuration = settings.focusTime
  const setFocusDuration = (v: number) => settings.setFocusTime?.(v)
  const [timerView, setTimerView] = useState("main")
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (settings.soundEnabled) {
        // Play a soft notification sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => { });
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(focusDuration * 60)
    }
  }, [focusDuration])
  const progressPercent = ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "ai", icon: Bot, label: "AI" },
    { id: "study", icon: GraduationCap, label: "Study" },
  ]
  const studySubItems = [
    { id: "flashcards", label: "Flashcards" },
    { id: "notes", label: "Notes" },
    { id: "mindmaps", label: "Mindmaps" },
    { id: "quizzes", label: "Quizzes" },
  ]
  
  // Load statistics from localStorage
  const [stats, setStats] = useState({
    flashcards: 0,
    notes: 0,
    quizzes: 0,
    mindmaps: 0,
    totalCards: 0,
  })

  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => {
    const loadStats = () => {
      try {
        const flashcards = JSON.parse(localStorage.getItem("atlas_hackathon_flashcards") || "[]")
        const notes = JSON.parse(localStorage.getItem("atlas_hackathon_notes") || "[]")
        const quizzes = JSON.parse(localStorage.getItem("atlas_hackathon_quizzes") || "[]")
        const mindmaps = JSON.parse(localStorage.getItem("atlas_hackathon_mindmaps") || "[]")
        
        const totalCards = flashcards.reduce((sum: number, deck: any) => 
          sum + (deck.content?.cards?.length || 0), 0)

        setStats({
          flashcards: flashcards.length,
          notes: notes.length,
          quizzes: quizzes.length,
          mindmaps: mindmaps.length,
          totalCards,
        })

        // Get recent notes (last 3)
        const sortedNotes = [...notes].sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setRecentNotes(sortedNotes.slice(0, 3))

        // Calculate weekly activity
        const allItems = [...flashcards, ...notes, ...quizzes, ...mindmaps]
        const now = new Date()
        const activity = [0, 0, 0, 0, 0, 0, 0]
        
        allItems.forEach((item: any) => {
          if (item.created_at) {
            const itemDate = new Date(item.created_at)
            const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysDiff >= 0 && daysDiff < 7) {
              activity[6 - daysDiff]++
            }
          }
        })
        setWeeklyActivity(activity)
      } catch (e) {
        console.error("Failed to load stats:", e)
      }
    }

    loadStats()
    // Reload stats when returning to dashboard
    const interval = setInterval(loadStats, 2000)
    return () => clearInterval(interval)
  }, [activeTab])

  const bentoItems: BentoItem[] = [
    {
      title: "Flashcards",
      meta: "Study Smart",
      description: "Create and review flashcards with spaced repetition",
      icon: <Zap className="w-4 h-4 text-[#F72585]" />,
      onClick: () => setActiveTab("flashcards"),
      dotColor: "#F72585",
    },
    {
      title: "Notes",
      meta: "Organize",
      description: "Take detailed notes and organize your study materials",
      icon: <FileText className="w-4 h-4 text-[#B5179E]" />,
      onClick: () => setActiveTab("notes"),
      dotColor: "#B5179E",
    },
    {
      title: "Mindmaps",
      meta: "Visualize",
      description: "Create visual mindmaps to connect concepts",
      icon: <GraduationCap className="w-4 h-4 text-[#7209B7]" />,
      onClick: () => setActiveTab("mindmaps"),
      dotColor: "#7209B7",
    },
    {
      title: "Quizzes",
      meta: "Test Yourself",
      description: "Practice with interactive quizzes and track progress",
      icon: <BookOpen className="w-4 h-4 text-[#560BAD]" />,
      onClick: () => setActiveTab("quizzes"),
      dotColor: "#560BAD",
    },
  ]

  const SIDEBAR_W = 64
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.12 } }
  } as any
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
  } as any

  return (
    <BeamsBackground className="min-h-screen bg-[#0c0515]" intensity="subtle">
      <div className="min-h-screen flex">
        { }
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          style={{
            width: sidebarHovered ? 196 : SIDEBAR_W,
            transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)"
          }}
          className="fixed left-0 top-0 h-full bg-[#0a0412]/95 backdrop-blur-xl border-r border-white/[0.04] flex flex-col py-5 z-40 overflow-hidden"
        >
          { }
          <div className="flex items-center gap-2.5 px-3.5 mb-8 h-9">
            <img src={AtlasLogo} alt="Atlas" className="w-7 h-7 flex-shrink-0" />
            <span
              className="text-white/85 font-semibold text-sm tracking-tight whitespace-nowrap"
              style={{ opacity: sidebarHovered ? 1 : 0, transition: "opacity 0.2s ease" }}
            >
              Atlas
            </span>
          </div>
          { }
          <motion.nav variants={stagger} initial="hidden" animate="show" className="flex-1 flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isStudy = item.id === "study"
              const isItemActive = activeTab === item.id || (isStudy && studySubItems.some(sub => activeTab === sub.id))
              return (
                <div key={item.id} className="flex flex-col">
                  <motion.button
                    variants={fadeUp}
                    onClick={() => {
                      if (isStudy) {
                        setStudyExpanded(!studyExpanded)
                      } else {
                        setActiveTab(item.id)
                      }
                    }}
                    className={`w-full h-10 rounded-lg flex items-center justify-between px-3 overflow-hidden cursor-pointer ${isItemActive
                      ? "bg-white/[0.07] text-white/90"
                      : "text-white/25 hover:bg-white/[0.03] hover:text-white/50"
                      }`}
                    style={{ transition: "background 0.15s, color 0.15s" }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
                      <span
                        className="text-[13px] font-medium whitespace-nowrap"
                        style={{ opacity: sidebarHovered ? 1 : 0, transition: "opacity 0.2s ease" }}
                      >
                        {item.label}
                      </span>
                    </div>
                    {isStudy && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 flex-shrink-0 text-white/30 transition-transform duration-200 ${studyExpanded ? "rotate-180" : ""}`}
                        style={{ opacity: sidebarHovered ? 1 : 0 }}
                      />
                    )}
                  </motion.button>
                  {isStudy && studyExpanded && sidebarHovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-0.5 pl-10 pr-2 mt-1"
                    >
                      {studySubItems.map(subItem => (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveTab(subItem.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-md text-[12px] transition-colors cursor-pointer ${activeTab === subItem.id
                            ? "text-white/80 bg-white/[0.05]"
                            : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
                            }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </motion.nav>
          { }
          <div className="flex flex-col gap-1 px-2">
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full h-10 rounded-lg flex items-center gap-3 px-3 overflow-hidden cursor-pointer ${activeTab === "settings"
                ? "bg-white/[0.07] text-white/90"
                : "text-white/20 hover:bg-white/[0.03] hover:text-white/35"
                }`}
              style={{ transition: "background 0.15s, color 0.15s" }}
            >
              <Settings className="w-[17px] h-[17px] flex-shrink-0" />
              <span
                className="text-[13px] font-medium whitespace-nowrap"
                style={{ opacity: sidebarHovered ? 1 : 0, transition: "opacity 0.2s ease" }}
              >Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full h-12 rounded-xl flex items-center px-3 overflow-hidden cursor-pointer transition-all duration-200 ${activeTab === "profile"
                ? "bg-white/[0.08] text-white"
                : "text-white/30 hover:bg-white/[0.04] hover:text-white/60"
                }`}
            >
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center relative">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <User className="w-[18px] h-[18px]" />
                )}
                {user?.avatarUrl && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0a0412]" />
                )}
              </div>
              <span
                className="ml-3 text-[13px] font-medium whitespace-nowrap"
                style={{
                  opacity: sidebarHovered ? 1 : 0,
                  visibility: sidebarHovered ? "visible" : "hidden",
                  transition: "opacity 0.2s, visibility 0.2s"
                }}
              >
                Profile
              </span>
            </button>
          </div>
        </motion.aside>
        { }
        <main className="flex-1 min-h-screen" style={{ paddingLeft: SIDEBAR_W }}>
          {activeTab === 'profile' ? (
            <ProfilePage onBack={() => setActiveTab("home")} />
          ) : activeTab === 'settings' ? (
            <SettingsPage onBack={() => setActiveTab("home")} />
          ) : activeTab === 'ai' ? (
            <AgentChat userName={user?.fullName || "User"} />
          ) : activeTab === 'flashcards' ? (
            <FlashcardsPage onNavigateToChat={() => setActiveTab("ai")} />
          ) : activeTab === 'notes' ? (
            <NotesPage onNavigateToChat={() => setActiveTab("ai")} />
          ) : activeTab === 'quizzes' ? (
            <QuizPage onNavigateToChat={() => setActiveTab("ai")} />
          ) : activeTab === 'mindmaps' ? (
            <MindmapPage onNavigateToChat={() => setActiveTab("ai")} />
          ) : (
            <motion.div
              className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-5"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              { }
              <div className="flex flex-col gap-4">
                { }
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 p-7 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,9,183,0.15)_1px,transparent_1px)] bg-[length:4px_4px]" />
                  <div className="relative">
                    <h1 className="text-3xl lg:text-4xl text-white/95 font-semibold tracking-tight mb-1">
                      Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7209B7] to-[#F72585]">{user?.fullName || "User"}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                      <p className="text-white/25 text-sm">Let's accomplish your goals today</p>
                    </div>
                  </div>
                </motion.div>
                {/* Bento Grid */}
                <motion.div variants={fadeUp}>
                  <BentoGrid items={bentoItems} />
                </motion.div>
                { }
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden"
                >
                  <div className="relative p-6">
                    <h2 className="text-lg font-semibold text-white/90 mb-6">Your Progress</h2>
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-[#7209B7]/10 to-transparent rounded-xl p-4 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#7209B7]/20 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#7209B7]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white/95 mb-1">{stats.flashcards}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Flashcard Decks</div>
                        <div className="text-xs text-white/30 mt-1">{stats.totalCards} total cards</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#B5179E]/10 to-transparent rounded-xl p-4 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#B5179E]/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#B5179E]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white/95 mb-1">{stats.notes}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Notes</div>
                        <div className="text-xs text-white/30 mt-1">Study materials</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#F72585]/10 to-transparent rounded-xl p-4 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F72585]/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-[#F72585]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white/95 mb-1">{stats.quizzes}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Quizzes</div>
                        <div className="text-xs text-white/30 mt-1">Practice tests</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#560BAD]/10 to-transparent rounded-xl p-4 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#560BAD]/20 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-[#560BAD]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white/95 mb-1">{stats.mindmaps}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Mindmaps</div>
                        <div className="text-xs text-white/30 mt-1">Visual learning</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Weekly Activity Graph */}
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden"
                >
                  <div className="relative p-6">
                    <h2 className="text-lg font-semibold text-white/90 mb-6">Weekly Activity</h2>
                    <div className="flex items-end justify-between gap-3 h-32">
                      {weeklyActivity.map((count, idx) => {
                        const maxCount = Math.max(...weeklyActivity, 1)
                        const height = (count / maxCount) * 100
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        const today = new Date().getDay()
                        const dayIndex = (today - 6 + idx + 7) % 7
                        
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-white/[0.03] rounded-lg overflow-hidden relative" style={{ height: '100px' }}>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="absolute bottom-0 w-full bg-gradient-to-t from-[#7209B7] via-[#B5179E] to-[#F72585] rounded-t-lg"
                              />
                            </div>
                            <div className="text-[10px] text-white/40 font-medium">{days[dayIndex]}</div>
                            <div className="text-xs text-white/60 font-semibold">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Recent Notes */}
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden"
                >
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white/90">Recent Notes</h2>
                      <button
                        onClick={() => setActiveTab("notes")}
                        className="text-xs text-[#F72585] hover:text-[#F72585]/80 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    
                    {recentNotes.length > 0 ? (
                      <div className="space-y-3">
                        {recentNotes.map((note, idx) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveTab("notes")}
                            className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-lg p-4 cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                                  {note.title}
                                </h3>
                                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                                  {note.content?.markdown?.substring(0, 100) || "No content"}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-[#F72585]/10 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-[#F72585]" />
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] text-white/30 mt-3">
                              {new Date(note.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-sm text-white/30">No notes yet</p>
                        <button
                          onClick={() => setActiveTab("ai")}
                          className="mt-3 text-xs text-[#F72585] hover:text-[#F72585]/80 font-medium transition-colors"
                        >
                          Create your first note with AI →
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
              { }
              <div className="flex flex-col gap-4">
                {/* Quick Actions */}
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-5 relative overflow-hidden"
                >
                  <div className="relative">
                    <h3 className="text-sm font-semibold text-white/90 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("ai")}
                        className="w-full bg-gradient-to-r from-[#7209B7] to-[#B5179E] hover:from-[#7209B7]/90 hover:to-[#B5179E]/90 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Bot className="w-4 h-4" />
                        Chat with AI
                      </button>
                      <button
                        onClick={() => setActiveTab("flashcards")}
                        className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-sm font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/[0.06]"
                      >
                        <Zap className="w-4 h-4" />
                        New Flashcards
                      </button>
                      <button
                        onClick={() => setActiveTab("notes")}
                        className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-sm font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/[0.06]"
                      >
                        <FileText className="w-4 h-4" />
                        New Note
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Study Streak */}
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F72585]/20 to-transparent rounded-full blur-2xl" />
                  <div className="relative">
                    <h3 className="text-sm font-semibold text-white/90 mb-4">Study Streak</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F72585] to-[#7209B7]">
                          {weeklyActivity.filter(d => d > 0).length}
                        </div>
                        <div className="text-xs text-white/40 mt-1">days this week</div>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7209B7]/20 to-[#F72585]/20 flex items-center justify-center border border-white/[0.08]">
                        <span className="text-2xl">🔥</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                { }
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-lg border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-5 relative overflow-hidden"
                >
                  <div className="relative">
                    <p className="text-white/18 text-[11px] uppercase tracking-[0.15em] mb-2">Daily Insight</p>
                    {settings.dailyInsights ? (
                      <p className="text-white/40 text-[13px] leading-relaxed italic">
                        "Knowledge is the only treasure that grows when shared."
                      </p>
                    ) : (
                      <p className="text-white/10 text-[13px] leading-relaxed italic">
                        Insights are currently disabled in settings.
                      </p>
                    )}
                  </div>
                </motion.div>
                {/* Focus Timer */}
                <motion.div
                  variants={fadeUp}
                  className="bg-[#140a25]/90 rounded-xl border border-white/[0.12] shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-6 relative overflow-hidden"
                >
                  {timerView === "main" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full flex flex-col"
                    >
                      { }
                      <div className="text-center mb-2">
                        <h3 className="text-white/60 text-[11px] uppercase tracking-[0.2em] font-semibold">Focus Timer</h3>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                        <div className="relative w-[220px] h-[220px]">
                          <svg
                            className="w-full h-full pointer-events-none"
                            viewBox="0 0 340 340"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            <defs>
                              <linearGradient id="timerThemeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7209B7" />
                                <stop offset="50%" stopColor="#B5179E" />
                                <stop offset="100%" stopColor="#F72585" />
                              </linearGradient>
                            </defs>
                            <circle
                              cx="170" cy="170" r="155"
                              stroke="white" strokeWidth="2" fill="none" opacity="0.05"
                            />
                            <circle
                              cx="170" cy="170" r="155"
                              stroke="url(#timerThemeGradient)" strokeWidth="6" fill="none"
                              strokeDasharray={`${2 * Math.PI * 155}`}
                              strokeDashoffset={`${2 * Math.PI * 155 * (progressPercent / 100)}`}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-linear"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 space-y-1">
                            <span className="font-numeric tabular-nums text-white font-medium text-[52px] leading-none tracking-tight">
                              {String(minutes).padStart(2, '0')}
                              <span className="text-white mx-0.5">:</span>
                              {String(seconds).padStart(2, '0')}
                            </span>
                            <div className="flex gap-1.5 mt-3 mb-1">
                              <div className="w-1 h-[14px] rounded-[2px] bg-gradient-to-t from-[#7209B7] to-[#F72585]" />
                              <div className="w-1 h-[14px] rounded-[2px] bg-gradient-to-t from-[#7209B7] to-[#F72585]" />
                              <div className="w-1 h-[14px] rounded-[2px] bg-gradient-to-t from-[#7209B7] to-[#F72585]" />
                              <div className="w-1 h-[14px] rounded-[2px] bg-white/10" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mt-1.5">Focus</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6 w-full px-1 relative z-10">
                        <motion.button
                          whileHover={{ rotate: -180, scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          onClick={() => { setIsActive(false); setTimeLeft(focusDuration * 60); }}
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-[18px] h-[18px]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsActive(!isActive)}
                          className="bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-white/90 px-8 py-3.5 rounded-[1.25rem] text-[13px] font-bold tracking-[0.15em] transition-colors border border-white/[0.06] cursor-pointer shadow-lg"
                        >
                          {isActive ? "PAUSE" : "START"}
                        </motion.button>
                        <motion.button
                          whileHover={{ rotate: 90, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setTimerView("settings")}
                          className="w-11 h-11 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer"
                        >
                          <Settings className="w-[18px] h-[18px]" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="flex-1 flex flex-col items-center w-full h-full relative"
                    >
                      <div className="flex items-center w-full relative mb-10 pt-2">
                        <button onClick={() => setTimerView("main")} className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors absolute left-0 z-10 cursor-pointer">
                          <ChevronLeft className="w-5 h-5 pr-0.5" />
                        </button>
                        <h3 className="text-white/90 text-[14px] font-semibold flex-1 text-center tracking-wide">Settings</h3>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center w-full -mt-4">
                        <span className="text-white/40 text-[11px] font-medium uppercase tracking-[0.2em] mb-6">Focus Session</span>
                        <div className="flex items-center justify-center gap-6 w-full">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFocusDuration(Math.max(1, focusDuration - 1))}
                            className="w-12 h-12 rounded-full border border-white/[0.12] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shadow-lg"
                          >
                            <Minus className="w-5 h-5" />
                          </motion.button>
                          <div className="flex flex-col items-center min-w-[100px]">
                            <span className="font-numeric tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 text-[76px] leading-[1] font-semibold tracking-tight">
                              {focusDuration}
                            </span>
                            <span className="text-[#F72585] text-[12px] font-bold uppercase tracking-[0.2em] mt-1 -translate-y-2">min</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setFocusDuration(Math.min(120, focusDuration + 1))}
                            className="w-12 h-12 rounded-full border border-white/[0.12] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shadow-lg"
                          >
                            <Plus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </BeamsBackground>
  )
}

export default function Dashboard() {
  return (
    <SettingsProvider>
      <DashboardInner />
    </SettingsProvider>
  )
}
