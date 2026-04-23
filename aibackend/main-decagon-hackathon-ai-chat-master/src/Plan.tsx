"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDotDashed,
  Loader2,
  BrainCircuit,
  X,
  Compass,
  Paperclip,
  PlusIcon,
  ArrowUpIcon,
  ImageIcon,
  MonitorIcon,
  CircleUserRound,
  ExternalLink,
  Map,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// --- Utility function ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- NEW: Animated Logo Component (Ping-Pong Animation) ---
const AtlasAnimatedLogo = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1.1, opacity: 1 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 426 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="start" // Triggers the Vivus line-drawing animation
      >
        <path
          d="M234.581 142.378L238.296 167.848C238.525 169.415 240.397 170.108 241.591 169.066L255.588 156.846L287.298 129.149C288.912 127.739 287.479 125.121 285.421 125.723L235.999 140.169C235.042 140.449 234.438 141.391 234.581 142.378Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_0"
        ></path>
        <path
          d="M172.261 158.961L183.258 168.606C184.544 169.734 183.914 171.851 182.22 172.091L159.954 175.244C159.116 175.363 158.294 174.941 157.901 174.191L136.15 132.598C135.125 130.638 137.57 128.71 139.237 130.164L172.261 158.961Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_1"
        ></path>
        <path
          d="M190.778 249.595L187.064 224.125C186.835 222.558 184.962 221.866 183.769 222.907L169.772 235.127L138.062 262.824C136.447 264.234 137.881 266.852 139.938 266.25L189.36 251.804C190.317 251.524 190.922 250.582 190.778 249.595Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_2"
        ></path>
        <path
          d="M253.099 233.012L242.102 223.367C240.816 222.239 241.446 220.122 243.139 219.882L265.406 216.729C266.244 216.61 267.066 217.032 267.459 217.782L289.21 259.375C290.235 261.335 287.79 263.263 286.123 261.81L253.099 233.012Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_3"
        ></path>
        <path
          d="M212.839 220.206L212.824 351.863C212.824 355.571 218.224 355.987 218.782 352.32C227.415 295.584 237.029 232.222 238.623 221.718C238.771 220.739 238.419 219.802 237.695 219.127L217.886 200.647C215.968 198.858 212.839 200.218 212.839 202.84L212.839 220.206Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_4"
        ></path>
        <path
          d="M187.063 170.108L206.873 39.3733C207.429 35.7051 212.839 36.1075 212.839 39.8175V172.283V189.038C212.839 191.66 209.711 193.02 207.793 191.231L187.983 172.751C187.259 172.076 186.915 171.087 187.063 170.108Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_5"
        ></path>
        <path
          d="M187.902 219.352L207.305 201.173C209.29 199.314 207.974 195.984 205.254 195.984L180.354 195.984L0.0639648 196.17L185.466 220.138C186.355 220.253 187.248 219.964 187.902 219.352Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_6"
        ></path>
        <path
          d="M237.761 172.77L218.358 190.948C216.373 192.808 217.689 196.137 220.409 196.137L245.309 196.137L425.599 195.951L240.197 171.984C239.308 171.869 238.415 172.157 237.761 172.77Z"
          fill="white"
          stroke="white"
          className="lWKxneDk_7"
        ></path>
        <style>{`
          .lWKxneDk_0{stroke-dasharray:151 153;stroke-dashoffset:152;}
          .start .lWKxneDk_0{animation:lWKxneDk_draw 2000ms ease-in-out 0ms forwards;}
          .lWKxneDk_1{stroke-dasharray:141 143;stroke-dashoffset:142;}
          .start .lWKxneDk_1{animation:lWKxneDk_draw 2000ms ease-in-out 142ms forwards;}
          .lWKxneDk_2{stroke-dasharray:151 153;stroke-dashoffset:152;}
          .start .lWKxneDk_2{animation:lWKxneDk_draw 2000ms ease-in-out 285ms forwards;}
          .lWKxneDk_3{stroke-dasharray:141 143;stroke-dashoffset:142;}
          .start .lWKxneDk_3{animation:lWKxneDk_draw 2000ms ease-in-out 428ms forwards;}
          .lWKxneDk_4{stroke-dasharray:328 330;stroke-dashoffset:329;}
          .start .lWKxneDk_4{animation:lWKxneDk_draw 2000ms ease-in-out 571ms forwards;}
          .lWKxneDk_5{stroke-dasharray:328 330;stroke-dashoffset:329;}
          .start .lWKxneDk_5{animation:lWKxneDk_draw 2000ms ease-in-out 714ms forwards;}
          .lWKxneDk_6{stroke-dasharray:429 431;stroke-dashoffset:430;}
          .start .lWKxneDk_6{animation:lWKxneDk_draw 2000ms ease-in-out 857ms forwards;}
          .lWKxneDk_7{stroke-dasharray:429 431;stroke-dashoffset:430;}
          .start .lWKxneDk_7{animation:lWKxneDk_draw 2000ms ease-in-out 1000ms forwards;}
          @keyframes lWKxneDk_draw{100%{stroke-dashoffset:0;}}
        `}</style>
      </svg>
    </motion.div>
  );
};
// --- Helper: Format Markdown ---
function formatMarkdown(text: string) {
  if (!text) return null;
  let html = text
    .replace(
      /^([A-Za-z0-9 ]+)\r?\n={2,}/gm,
      '<h1 class="text-xl font-bold mt-7 mb-4 text-white border-b border-white/10 pb-2">$1</h1>',
    )
    .replace(
      /^([A-Za-z0-9 ]+)\r?\n-{2,}/gm,
      '<h2 class="text-lg font-bold mt-6 mb-3 text-white">$1</h2>',
    )
    .replace(
      /^#### (.*$)/gim,
      '<h4 class="text-sm font-bold mt-4 mb-2 text-white/80">$1</h4>',
    )
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-md font-bold mt-5 mb-2 text-[#F72585]">$1</h3>',
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-lg font-bold mt-6 mb-3 text-white">$1</h2>',
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-xl font-bold mt-7 mb-4 text-white border-b border-white/10 pb-2">$1</h1>',
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-white">$1</strong>',
    )
    .replace(
      /^\s*[\-\*]\s+(.*)$/gim,
      '<li class="ml-4 list-disc mb-1.5">$1</li>',
    )
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code class="bg-white/10 px-1 border border-white/10 rounded text-xs text-[#4CC9F0]">$1</code>',
    );

  html = html
    .replace(/\n/g, "<br/>")
    .replace(/(<br\/>)+<li/g, "<li")
    .replace(/<br\/>/g, '<div class="h-1.5"></div>');
  return (
    <div
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// --- Helper: Extract JSON array ---
function extractJsonArray(text: string): string | null {
  const startIdx = text.indexOf("[");
  if (startIdx === -1) return null;
  let bracketCount = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "[") bracketCount++;
    else if (char === "]") {
      bracketCount--;
      if (bracketCount === 0) return text.substring(startIdx, i + 1);
    }
  }
  return null;
}

// --- Types ---
interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[];
}
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}
interface Flashcard {
  id: string;
  front: string;
  back: string;
}
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Hook: Auto-resize Textarea ---
function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = `${minHeight}px`;
      if (reset) return;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight),
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );
  return { textareaRef, adjustHeight };
}

export default function Plan() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [thinkPhase, setThinkPhase] = useState<number>(0);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileContexts, setFileContexts] = useState<
    { name: string; content: string }[]
  >([]);
  const [projectMode, setProjectMode] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<"deck" | "notes" | null>(
    null,
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardQueue, setCardQueue] = useState<Flashcard[]>([]);
  const [noteContent, setNoteContent] = useState<string>("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [activeTaskTitle, setActiveTaskTitle] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(60, 200);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatting]);

  const isThinking =
    isSyncing || isChatting || isGeneratingNotes || isGeneratingFlashcards;

  const handleAtlasSync = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isSyncing) return;
    setIsSyncing(true);
    setTasks([]);
    setActiveSidebar(null);
    setAgentError(null);
    setThinkPhase(1);
    await new Promise((r) => setTimeout(r, 1200));
    setThinkPhase(2);
    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing API Key in .env file.");
      const combinedFileContext = fileContexts
        .map((fc) => fc.content)
        .join("\n");
      const fullContextPrompt = combinedFileContext
        ? `${combinedFileContext}\n\n${finalPrompt}`
        : finalPrompt;
      const roadmapResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "Output ONLY a raw JSON array of 4 tasks. Structure:[{id, title, description, status:'pending', priority:'high', level:0, dependencies:[], subtasks:[{id, title, description, status:'pending', priority:'high', tools:[]}]}]",
              },
              {
                role: "user",
                content: `Create detailed study roadmap for: ${fullContextPrompt}${projectMode ? " Context: Ensure this applies strictly to a Project-based learning scenario where the goal is to build a real-world project." : ""}`,
              },
            ],
            temperature: 0.2,
          }),
        },
      );
      const roadmapData = await roadmapResponse.json();
      if (roadmapData.error) throw new Error(roadmapData.error.message);
      const content = roadmapData.choices[0].message.content;
      const rmMatch = extractJsonArray(content);
      if (!rmMatch)
        throw new Error("AI failed to generate a valid data structure.");
      let newPlan: Task[];
      try {
        newPlan = JSON.parse(rmMatch.trim());
        setTasks(newPlan);
        setExpandedTasks([newPlan[0].id]);
      } catch (parseError) {
        throw new Error(
          `Invalid roadmap JSON: ${(parseError as Error).message}`,
        );
      }
      setThinkPhase(3);
      setActiveTaskTitle(newPlan[0].title);
      setIsGeneratingFlashcards(true);
      const fcResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "Output ONLY a raw JSON array of 5 flashcards:[{id, front, back}]",
              },
              {
                role: "user",
                content: `Create flashcards for: ${newPlan[0].title}`,
              },
            ],
            temperature: 0.3,
          }),
        },
      );
      const fcData = await fcResponse.json();
      const fcMatch = extractJsonArray(fcData.choices[0].message.content);
      if (fcMatch) {
        try {
          setCardQueue(JSON.parse(fcMatch.trim()));
          setActiveSidebar("deck");
        } catch (parseError) {
          console.error("Failed to parse flashcard JSON:", fcMatch[0]);
        }
      }
    } catch (error: any) {
      setAgentError(error.message || "Neural link failed. Please try again.");
    } finally {
      setIsSyncing(false);
      setIsGeneratingFlashcards(false);
      setThinkPhase(0);
      setPrompt("");
      adjustHeight(true);
    }
  };

  const handleSendMessage = async () => {
    const finalPrompt = prompt.trim();
    if (!finalPrompt || isChatting || isSyncing) return;
    const newUserMsg: ChatMessage = { role: "user", content: finalPrompt };
    setChatMessages((prev) => [...prev, newUserMsg]);
    setPrompt("");
    setIsChatting(true);
    adjustHeight(true);
    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing API Key in .env file.");
      const combinedFileContext = fileContexts
        .map((fc) => fc.content)
        .join("\n");
      const fullContextPrompt = combinedFileContext
        ? `${combinedFileContext}\n\n${finalPrompt}`
        : finalPrompt;
      let contextStr = projectMode
        ? "[Context: Project-Based Mode active]\n"
        : "";
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are Atlas, a concise learning assistant. Answer queries using markdown.",
              },
              ...chatMessages,
              { role: "user", content: contextStr + fullContextPrompt },
            ],
            temperature: 0.5,
          }),
        },
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.choices[0].message.content },
      ]);
    } catch (err: any) {
      setAgentError(err.message || "Failed to send message.");
    } finally {
      setIsChatting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (tasks.length === 0 && chatMessages.length === 0) handleAtlasSync();
      else handleSendMessage();
    }
  };

  const generateFlashcardsForTask = async (
    sourceContent: string,
    isFromChat: boolean = false,
  ) => {
    const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
    if (!apiKey) return;
    try {
      setActiveTaskTitle(isFromChat ? "Chat Concept" : sourceContent);
      setActiveSidebar("deck");
      setIsGeneratingFlashcards(true);
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "Output ONLY raw JSON array of 5 flashcards:[{id, front, back}]",
              },
              {
                role: "user",
                content: `Create flashcards for: ${sourceContent}`,
              },
            ],
            temperature: 0.3,
          }),
        },
      );
      const data = await res.json();
      const match = extractJsonArray(data.choices[0].message.content);
      if (match) setCardQueue(JSON.parse(match.trim()));
    } catch (error: any) {
      setAgentError("Failed to generate flashcards.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const generateNotesForTask = async (sourceContent: string) => {
    const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
    if (!apiKey) return;
    try {
      setActiveTaskTitle(sourceContent);
      setActiveSidebar("notes");
      setIsGeneratingNotes(true);
      setNoteContent("");
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "Generate concise markdown notes using headings and bullets.",
              },
              { role: "user", content: `Create notes for: ${sourceContent}` },
            ],
            temperature: 0.4,
          }),
        },
      );
      const data = await res.json();
      setNoteContent(data.choices[0].message.content);
    } catch (error: any) {
      setNoteContent("Error generating notes.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleScoreCard = (action: string) => {
    setIsFlipped(false);
    setTimeout(() => {
      const newQueue = [...cardQueue.slice(1)];
      if (action === "again" || action === "hard") newQueue.push(cardQueue[0]);
      setCardQueue(newQueue);
      if (newQueue.length === 0) setActiveSidebar(null);
    }, 200);
  };

  const toggleTaskExpansion = (id: string) =>
    setExpandedTasks((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id],
    );
  const toggleSubtaskExpansion = (tid: string, sid: string) =>
    setExpandedSubtasks((p) => ({
      ...p,
      [`${tid}-${sid}`]: !p[`${tid}-${sid}`],
    }));
  const toggleTaskStatus = (id: string) =>
    setTasks((p) =>
      p.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "completed" ? "pending" : "completed",
              subtasks: t.subtasks.map((s) => ({
                ...s,
                status: t.status === "completed" ? "pending" : "completed",
              })),
            }
          : t,
      ),
    );
  const toggleSubtaskStatus = (tid: string, sid: string) =>
    setTasks((p) =>
      p.map((t) => {
        if (t.id === tid) {
          const u = t.subtasks.map((s) =>
            s.id === sid
              ? {
                  ...s,
                  status: s.status === "completed" ? "pending" : "completed",
                }
              : s,
          );
          return {
            ...t,
            subtasks: u,
            status: u.every((s) => s.status === "completed")
              ? "completed"
              : t.status,
          };
        }
        return t;
      }),
    );

  const taskVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 },
    },
  };
  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.25 } },
  };
  const hasStarted = tasks.length > 0 || chatMessages.length > 0 || isSyncing;

  return (
    <div className="flex flex-col h-screen bg-[#0c0515] text-white font-sans selection:bg-[#F72585]/30 overflow-hidden relative">
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .perspective-1000 { perspective: 1000px; } .preserve-3d { transform-style: preserve-3d; }`}</style>

      {/* FIXED BRIGHTER PULSE BACKGROUND */}
      <motion.div
        initial={{ opacity: 0.15 }}
        animate={{ opacity: isThinking ? [0.15, 0.9, 0.15] : 0.15 }}
        transition={{
          opacity: isThinking
            ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
            : { duration: 0.5 },
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,9,183,1)_1.5px,transparent_1.5px)] bg-[length:32px_32px] pointer-events-none z-0"
      />

      <header className="px-6 py-6 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-[#140a25] border border-white/[0.12] flex items-center justify-center shadow-lg">
            <Compass size={16} className="text-[#F72585]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Atlas <span className="text-white/40 font-normal">Plan</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <main
          className={cn(
            "relative flex-1 flex flex-col transition-all duration-500",
            activeSidebar ? "mr-[400px]" : "mr-0",
          )}
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar relative z-10 flex flex-col">
            <div className="w-full max-w-4xl mx-auto transition-all duration-500 relative z-20 flex-1 flex flex-col pb-[10vh]">
              {!hasStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center w-full mt-[10vh] mb-12 text-center"
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    What are we{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7209B7] to-[#F72585]">
                      learning
                    </span>{" "}
                    today?
                  </h1>
                  <p className="text-white/40 text-sm md:text-base max-w-lg">
                    Atlas will generate a complete roadmap, extract key
                    concepts, build a flashcard deck, and synthesize notes for
                    you.
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {isSyncing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 mb-8"
                  >
                    <div className="flex items-center gap-8 text-white/40 text-[10px] font-bold uppercase tracking-widest bg-[#140a25] px-6 py-4 rounded-2xl border border-white/[0.05] shadow-2xl">
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          thinkPhase >= 1 ? "text-[#4CC9F0]" : "",
                        )}
                      >
                        {thinkPhase === 1 ? (
                          <AtlasAnimatedLogo size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}{" "}
                        Searching Specs
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          thinkPhase >= 2 ? "text-[#7209B7]" : "opacity-30",
                        )}
                      >
                        {thinkPhase === 2 ? (
                          <AtlasAnimatedLogo size={14} />
                        ) : (
                          <Circle size={14} />
                        )}{" "}
                        Building Roadmap
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          thinkPhase >= 3 ? "text-[#F72585]" : "opacity-30",
                        )}
                      >
                        {thinkPhase === 3 ? (
                          <AtlasAnimatedLogo size={14} />
                        ) : (
                          <Circle size={14} />
                        )}{" "}
                        Generating Cards
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {agentError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl mb-8 text-sm text-center shadow-lg">
                  {agentError}
                </div>
              )}

              {tasks.length > 0 && !isSyncing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <LayoutGroup>
                    <div className="p-4 overflow-hidden">
                      <ul className="space-y-4 overflow-hidden">
                        {tasks.map((task, index) => {
                          const isExpanded = expandedTasks.includes(task.id);
                          const isCompleted = task.status === "completed";
                          return (
                            <motion.li
                              key={task.id}
                              className={cn(index !== 0 ? "mt-4" : "")}
                              initial="hidden"
                              animate="visible"
                              variants={taskVariants}
                            >
                              <motion.div className="group flex items-center px-5 py-4 rounded-xl bg-[#140a25] border border-white/[0.12] hover:border-white/[0.3] transition-all cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                                <motion.div
                                  className="mr-4 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskStatus(task.id);
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                  ) : task.status === "in-progress" ? (
                                    <CircleDotDashed className="h-6 w-6 text-[#F72585] animate-spin-slow" />
                                  ) : (
                                    <Circle className="text-white/20 h-6 w-6 hover:text-[#7209B7] transition-colors" />
                                  )}
                                </motion.div>
                                <motion.div
                                  className="flex min-w-0 flex-grow items-center justify-between"
                                  onClick={() => toggleTaskExpansion(task.id)}
                                >
                                  <div className="mr-2 flex-1 truncate">
                                    <span
                                      className={cn(
                                        "text-[15px] font-medium transition-colors",
                                        isCompleted
                                          ? "text-white/40 line-through"
                                          : "text-white/95",
                                      )}
                                    >
                                      {task.title}
                                    </span>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                                    {task.dependencies &&
                                      task.dependencies.length > 0 && (
                                        <div className="hidden sm:flex items-center gap-1 mr-2">
                                          {task.dependencies.map((dep, idx) => (
                                            <span
                                              key={idx}
                                              className="bg-white/[0.05] text-white/50 border border-white/[0.05] rounded px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-widest"
                                            >
                                              {dep}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateNotesForTask(task.title);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-[#4CC9F0]/20 text-[#4CC9F0] border border-white/[0.05] hover:border-[#4CC9F0]/50 rounded-lg transition-all"
                                    >
                                      <FileText size={14} />
                                      <span className="font-bold text-[9px] uppercase tracking-widest hidden sm:block">
                                        Notes
                                      </span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateFlashcardsForTask(task.title);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-[#F72585]/20 text-[#F72585] border border-white/[0.05] hover:border-[#F72585]/50 rounded-lg transition-all"
                                    >
                                      <BrainCircuit size={14} />
                                      <span className="font-bold text-[9px] uppercase tracking-widest hidden sm:block">
                                        Deck
                                      </span>
                                    </button>
                                    <span
                                      className={cn(
                                        "rounded px-2 py-1 font-bold text-[9px] uppercase tracking-widest border ml-2",
                                        isCompleted
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                          : task.status === "in-progress"
                                            ? "bg-[#F72585]/10 text-[#F72585] border-[#F72585]/20"
                                            : "bg-white/[0.02] text-white/40 border-white/[0.05]",
                                      )}
                                    >
                                      {task.status}
                                    </span>
                                  </div>
                                </motion.div>
                              </motion.div>
                              <AnimatePresence mode="wait">
                                {isExpanded && task.subtasks.length > 0 && (
                                  <motion.div
                                    className="relative overflow-hidden pl-2"
                                    variants={subtaskListVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    layout
                                  >
                                    <div className="absolute top-0 bottom-0 left-[26px] border-l border-white/[0.08]" />
                                    <ul className="mt-3 mr-2 mb-3 ml-6 space-y-2">
                                      {task.subtasks.map((subtask) => {
                                        const subtaskKey = `${task.id}-${subtask.id}`;
                                        const isSubtaskExpanded =
                                          expandedSubtasks[subtaskKey];
                                        return (
                                          <motion.li
                                            key={subtask.id}
                                            className="group flex flex-col py-2 pl-6"
                                            layout
                                          >
                                            <div
                                              className="flex flex-1 items-center rounded-lg p-2 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                              onClick={() =>
                                                toggleSubtaskExpansion(
                                                  task.id,
                                                  subtask.id,
                                                )
                                              }
                                            >
                                              <div
                                                className="mr-3 flex-shrink-0"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleSubtaskStatus(
                                                    task.id,
                                                    subtask.id,
                                                  );
                                                }}
                                              >
                                                {subtask.status ===
                                                "completed" ? (
                                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                  <Circle className="text-white/20 h-4 w-4 group-hover:text-white/40" />
                                                )}
                                              </div>
                                              <span
                                                className={cn(
                                                  "text-[13px] font-medium flex-1 transition-colors",
                                                  subtask.status === "completed"
                                                    ? "text-white/30 line-through"
                                                    : "text-white/80",
                                                )}
                                              >
                                                {subtask.title}
                                              </span>
                                            </div>
                                            <AnimatePresence mode="wait">
                                              {isSubtaskExpanded && (
                                                <motion.div
                                                  className="border-l border-white/[0.08] mt-2 ml-2 pl-5 text-[13px] overflow-hidden"
                                                  initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                  }}
                                                  animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                  }}
                                                  exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                  }}
                                                  layout
                                                >
                                                  <p className="py-2 text-white/50 leading-relaxed italic border-b border-white/[0.04] mb-3">
                                                    "{subtask.description}"
                                                  </p>
                                                  {subtask.tools &&
                                                    subtask.tools.length >
                                                      0 && (
                                                      <div className="mt-2 mb-3 flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                                                          Resources:
                                                        </span>
                                                        {subtask.tools.map(
                                                          (tool, idx) => (
                                                            <a
                                                              key={idx}
                                                              href={`https://duckduckgo.com/?q=${encodeURIComponent(tool)}`}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-[#7209B7]/20 border border-white/[0.05] hover:border-[#7209B7]/50 text-white/70 hover:text-[#4CC9F0] rounded px-2.5 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer"
                                                            >
                                                              <span>
                                                                {tool}
                                                              </span>
                                                              <ExternalLink
                                                                size={10}
                                                                className="opacity-50"
                                                              />
                                                            </a>
                                                          ),
                                                        )}
                                                      </div>
                                                    )}
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </motion.li>
                                        );
                                      })}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </div>
                  </LayoutGroup>
                </motion.div>
              )}
            </div>
          </div>

          <motion.div
            layout
            className={cn(
              "w-full transition-all duration-700 z-50 px-4 pb-6",
              hasStarted
                ? "max-w-3xl mx-auto pt-2 relative"
                : "absolute top-[40vh] left-1/2 -translate-x-1/2 max-w-3xl",
            )}
          >
            <AnimatePresence>
              {hasStarted && chatMessages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[calc(100%+16px)] left-4 right-4 max-h-[40vh] bg-[#140a25]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                >
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                      <BrainCircuit size={14} className="text-[#F72585]" />{" "}
                      Atlas Chat
                    </span>
                    <button
                      onClick={() => setChatMessages([])}
                      className="text-white/40 hover:text-white transition-colors p-1 bg-white/[0.05] hover:bg-white/10 rounded-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 hide-scrollbar"
                  >
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex flex-col max-w-[85%]",
                          msg.role === "user"
                            ? "self-end items-end"
                            : "self-start items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl text-[13px] leading-relaxed shadow-md",
                            msg.role === "user"
                              ? "bg-white/[0.1] border border-white/[0.05] text-white rounded-br-sm"
                              : "bg-[#0c0515] border border-white/[0.05] text-white/90 rounded-bl-sm",
                          )}
                        >
                          {formatMarkdown(msg.content)}
                        </div>
                        {msg.role === "assistant" && (
                          <div className="flex gap-4 mt-2">
                            <button
                              onClick={() => generateNotesForTask(msg.content)}
                              className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-[#4CC9F0] hover:text-white transition-colors"
                            >
                              <FileText size={12} /> Generate Notes
                            </button>
                            <button
                              onClick={() =>
                                generateFlashcardsForTask(msg.content, true)
                              }
                              className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 text-[#F72585] hover:text-[#B5179E] transition-colors"
                            >
                              <BrainCircuit size={12} /> Generate Flashcards
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatting && (
                      <div className="self-start px-4 py-3 rounded-2xl bg-[#0c0515] text-white/50 text-sm flex items-center gap-3 border border-white/[0.05] shadow-md rounded-bl-sm">
                        <AtlasAnimatedLogo size={14} /> Thinking...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#140a25]/95 backdrop-blur-xl rounded-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-5 pt-3 pb-1">
                  {attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.05] text-[10px] font-medium rounded-md px-2 py-1 text-white/70 shadow-sm"
                    >
                      <FileText size={12} className="text-[#F72585]" />
                      <span className="max-w-[120px] truncate">
                        {file.name}
                      </span>
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-400 ml-1 transition-colors"
                        onClick={() => {
                          setAttachments((p) =>
                            p.filter((_, idx) => idx !== i),
                          );
                          setFileContexts((p) =>
                            p.filter((_, idx) => idx !== i),
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="overflow-y-auto hide-scrollbar">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    projectMode
                      ? "Project Context Active: Describe your goal..."
                      : "Ask Atlas a question, or command it to Map a new roadmap..."
                  }
                  disabled={isSyncing || isChatting}
                  className="w-full px-5 py-4 resize-none bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-white/30 min-h-[60px]"
                />
              </div>
              <div className="flex items-center justify-between p-3 border-t border-white/[0.04] bg-[#0c0515]/50">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setAttachments((prev) => [...prev, ...newFiles]);
                        const newContexts = [];
                        for (const file of newFiles) {
                          try {
                            const content = await file.text();
                            newContexts.push({
                              name: file.name,
                              content: `[File: ${file.name}]\n${content}\n`,
                            });
                          } catch {
                            newContexts.push({
                              name: file.name,
                              content: `[File Name: ${file.name}]\n`,
                            });
                          }
                        }
                        setFileContexts((prev) => [...prev, ...newContexts]);
                      }
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-white/40 hover:text-white flex items-center gap-1"
                  >
                    <Paperclip size={16} />
                    <span className="text-xs hidden sm:block">Attach</span>
                  </button>
                  <button
                    onClick={() => setProjectMode(!projectMode)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 shadow-sm",
                      projectMode
                        ? "bg-[#F72585]/20 border-[#F72585]/60 text-[#F72585] shadow-[0_0_10px_rgba(247,37,133,0.3)]"
                        : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.05] text-white/40",
                    )}
                  >
                    <PlusIcon size={14} />
                    <span className="hidden sm:block">
                      {projectMode ? "Project Active" : "Project Context"}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!prompt.trim() || isSyncing || isChatting}
                    className={cn(
                      "p-2 rounded-lg transition-all flex items-center justify-center",
                      prompt.trim()
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        : "bg-white/[0.02] text-white/20 border border-white/[0.02]",
                    )}
                  >
                    <ArrowUpIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleAtlasSync()}
                    disabled={!prompt.trim() || isSyncing || isChatting}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold shadow-lg",
                      prompt.trim()
                        ? "bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white hover:opacity-90"
                        : "bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/[0.05]",
                    )}
                  >
                    {isSyncing ? (
                      <AtlasAnimatedLogo size={14} />
                    ) : (
                      <Map size={14} />
                    )}
                    <span className="hidden sm:block">Map Plan</span>
                  </button>
                </div>
              </div>
            </div>
            {!hasStarted && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <ActionButton
                  icon={<ImageIcon size={14} className="text-[#4CC9F0]" />}
                  label="Analyze Syllabus"
                  onClick={() => setPrompt("Analyze Syllabus")}
                />
                <ActionButton
                  icon={<MonitorIcon size={14} className="text-[#F72585]" />}
                  label="Learn React Basics"
                  onClick={() => setPrompt("Learn React Basics")}
                />
                <ActionButton
                  icon={
                    <CircleUserRound size={14} className="text-[#4361EE]" />
                  }
                  label="Prepare for Interview"
                  onClick={() => setPrompt("Prepare for Interview")}
                />
              </div>
            )}
          </motion.div>
        </main>

        <AnimatePresence>
          {activeSidebar && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[400px] h-full bg-[#140a25]/95 backdrop-blur-3xl border-l border-white/[0.12] z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-[#0c0515]/50">
                <div
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2",
                    activeSidebar === "deck"
                      ? "text-[#F72585]"
                      : "text-[#4CC9F0]",
                  )}
                >
                  {activeSidebar === "deck" ? (
                    <>
                      <BrainCircuit size={14} /> Flashcards
                    </>
                  ) : (
                    <>
                      <FileText size={14} /> Knowledge Notes
                    </>
                  )}
                </div>
                <button
                  onClick={() => setActiveSidebar(null)}
                  className="p-2 bg-white/[0.03] hover:bg-white/[0.1] rounded-lg text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-8 flex flex-col overflow-y-auto hide-scrollbar">
                {activeSidebar === "deck" ? (
                  isGeneratingFlashcards ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/40">
                      <AtlasAnimatedLogo size={32} className="mb-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">
                        Drafting Deck...
                      </span>
                    </div>
                  ) : cardQueue.length > 0 ? (
                    <div className="flex flex-col justify-center h-full">
                      <div className="text-center text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 bg-white/[0.03] border border-white/[0.05] rounded-full py-1.5 px-4 self-center">
                        {cardQueue.length} Cards Remaining
                      </div>
                      <div
                        className="w-full h-[480px] relative cursor-pointer mb-8 group perspective-1000"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <motion.div
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                          className="w-full h-full relative preserve-3d"
                        >
                          <div
                            className="absolute inset-0 bg-[#0c0515] border border-white/[0.12] group-hover:border-[#7209B7]/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-colors"
                            style={{ backfaceVisibility: "hidden" }}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 absolute top-6">
                              Question
                            </div>
                            <div className="text-xl font-medium text-white/95 leading-relaxed">
                              {cardQueue[0].front}
                            </div>
                            <div className="absolute bottom-6 text-[10px] text-[#F72585] uppercase tracking-widest font-bold animate-pulse">
                              Click to reveal
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-[#140a25] to-[#0c0515] border border-[#F72585]/40 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.6)]"
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F72585]/60 absolute top-6">
                              Answer
                            </div>
                            <div className="text-lg text-white/90 font-medium leading-relaxed">
                              {cardQueue[0].back}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      <div className="mt-8 grid grid-cols-4 gap-3">
                        {["again", "hard", "good", "easy"].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleScoreCard(type)}
                            className="py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.15] text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.08] transition-all shadow-sm"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-10 bg-[#0c0515] border border-[#F72585]/30 rounded-3xl shadow-2xl h-full flex flex-col justify-center">
                      <CheckCircle2
                        size={56}
                        className="mx-auto text-[#F72585] mb-5 drop-shadow-[0_0_15px_rgba(247,37,133,0.5)]"
                      />
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                        Deck Mastered
                      </h3>
                      <button
                        onClick={() => setActiveSidebar(null)}
                        className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white font-bold tracking-wider uppercase text-[11px] rounded-xl w-full"
                      >
                        Close Deck
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full text-white/90">
                    {isGeneratingNotes ? (
                      <div className="flex flex-col items-center justify-center h-full text-white/40">
                        <AtlasAnimatedLogo size={32} className="mb-4" />
                        <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse">
                          Drafting Notes...
                        </span>
                      </div>
                    ) : (
                      <div className="bg-[#0c0515] p-6 rounded-3xl border border-white/[0.12] shadow-xl h-max">
                        {formatMarkdown(noteContent)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#140a25] hover:bg-white/[0.05] rounded-xl border border-white/[0.12] text-white/60 hover:text-white transition-colors shadow-lg"
    >
      {icon} <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}