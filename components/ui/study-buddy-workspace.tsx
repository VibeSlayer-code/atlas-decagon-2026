"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Paperclip, Maximize, ZoomIn, ZoomOut, Target, Sparkles, ChevronRight, Info } from "lucide-react"
import { useSettings } from "@/lib/settings-context"
import { cn } from "@/lib/utils"
import { ShiningText } from "@/components/ui/shining-text"
import { MorphingCardStack } from "@/components/ui/morphing-card-stack"

type ToolKind = "notes" | "flashcards" | "quiz" | "summary" | "tasks" | "plan" | "mindmap"

export type StudyBuddyArtifact = {
  kind: ToolKind
  title: string
  content:
  | { markdown: string }
  | { cards: Array<{ front: string; back: string }> }
  | { questions: Array<{ q: string; options?: string[]; answer: string; explanation?: string }> }
}

type Role = "user" | "assistant"
export type StudyBuddyMessage = {
  id: string
  role: Role
  text: string
}

type Props = {
  modelLabel: string
  status: string
  messages: StudyBuddyMessage[]
  artifacts: StudyBuddyArtifact[]
  setArtifacts: (artifacts: StudyBuddyArtifact[]) => void
  composerValue: string
  setComposerValue: (v: string) => void
  onSend: () => void
  isBusy: boolean
  onBack: () => void
  attachments: File[]
  onAttachFiles: (files: FileList | null) => void
  onRemoveAttachment: (index: number) => void
  contextPreview: string
  onQuickPrompt: (prompt: string) => void
}

export function StudyBuddyWorkspace(props: Props) {
  const settings = useSettings();
  const {
    status,
    messages,
    artifacts,
    setArtifacts,
    composerValue,
    setComposerValue,
    onSend,
    isBusy,
    onBack,
    attachments,
    onAttachFiles,
    onRemoveAttachment,
    onQuickPrompt,
  } = props

  const listRef = useRef<HTMLDivElement>(null)
  const [activeArtifactIndex, setActiveArtifactIndex] = useState(0)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  useEffect(() => {
    if (artifacts.length > 0) {
      setActiveArtifactIndex(artifacts.length - 1)
    }
  }, [artifacts.length])

  const activeArtifact = useMemo(() => artifacts[activeArtifactIndex], [artifacts, activeArtifactIndex])
  const lastAssistantMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "assistant") return messages[i].id
    }
    return null
  }, [messages])

  return (
    <motion.div
      className="w-full h-full overflow-hidden bg-transparent flex flex-col"
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="h-14 flex-shrink-0 px-5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            ← Back
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <ModelLogo activeAgent={settings.activeAgent || "groq"} />
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="h-8 w-8 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/80 transition-colors flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[400px_1fr] min-h-0">
        <div className="flex flex-col border-r border-white/[0.06] min-w-0 min-h-0 bg-white/[0.01] relative z-10 h-full">
          <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'][scrollbar-width:'none'] min-h-0">
            {messages.map((m) => {
              if (m.role === "assistant" && !m.text) return null;
              return (
                <div key={m.id} className="w-full">
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-4 text-[14px] leading-relaxed shadow-lg",
                      m.role === "user"
                        ? "ml-auto bg-gradient-to-r from-[#7209B7] to-[#B5179E] text-white rounded-br-sm"
                        : "mr-auto bg-white/[0.04] text-white/90 border border-white/[0.08] rounded-bl-sm backdrop-blur-md"
                    )}
                  >
                    {m.role === "user" ? (
                      <div className="font-medium text-white">{formatPowerNotation(m.text)}</div>
                    ) : (
                      formatMarkdown(formatPowerNotation(m.text))
                    )}
                  </div>
                </div>
              )
            })}

            {isBusy && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex"
              >
                <div className="mr-auto bg-white/[0.04] text-white/90 border border-white/[0.08] rounded-2xl rounded-bl-sm px-5 py-3.5 text-[14px] leading-relaxed backdrop-blur-md shadow-lg flex items-center gap-3">
                  <AtlasThinkingLogo />
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="font-medium tracking-wide">{status}</span>
                    <TypingDots />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="p-4 bg-white/[0.01] border-t border-white/[0.06] space-y-3">
            <input
              id="workspace-attach-file"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => onAttachFiles(e.target.files)}
            />
            {attachments.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-2 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/30 border border-white/10 text-[11px] text-white/75">
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(idx)}
                      className="text-white/50 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="workspace-attach-file"
                className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/55 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" /> Attach
              </label>
              {messages.length > 1 && [
                "Explain more",
                "Give examples",
                "Simplify this",
              ].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => onQuickPrompt(quick)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
                >
                  {quick}
                </button>
              ))}
              {messages.length <= 1 && [
                "Make detailed notes",
                "Generate flashcards",
                "Create a quiz",
                "Build a mindmap",
              ].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => onQuickPrompt(quick)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.1] transition-all"
                >
                  {quick}
                </button>
              ))}
            </div>
            <div className="relative rounded-[28px] bg-white/[0.03] border border-white/[0.08] p-2 focus-within:border-[#7209B7]/40 transition-colors backdrop-blur-sm">
              <textarea
                value={composerValue}
                onChange={(e) => setComposerValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSend()
                  }
                }}
                placeholder="Message Study Buddy..."
                className="w-full min-h-[60px] max-h-[180px] resize-none bg-transparent px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none [&::-webkit-scrollbar]:hidden[-ms-overflow-style:'none'][scrollbar-width:'none']"
              />
              <div className="flex items-center justify-between px-2 pb-2 mt-1">
                <span className="text-[10px] text-white/30 font-medium">Enter to send • Shift+Enter new line</span>
                <button
                  type="button"
                  onClick={onSend}
                  disabled={isBusy || composerValue.trim().length === 0}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[36px]",
                    composerValue.trim().length
                      ? "bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white shadow-[0_4px_14px_rgba(247,37,133,0.4)] hover:shadow-[0_6px_20px_rgba(247,37,133,0.6)]"
                      : "bg-white/[0.04] text-white/30 cursor-not-allowed"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 min-h-0 overflow-hidden relative flex flex-col h-full bg-transparent">
          {activeArtifact && activeArtifact.kind !== "mindmap" && (
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F72585]/5 rounded-full blur-[120px] mix-blend-screen opacity-50" />
            </div>
          )}

          {activeArtifact ? (
            <div className="flex flex-col h-full relative z-10">
              <div className={cn(
                "flex-shrink-0 px-8 pt-6 pb-4 z-20 flex justify-between items-end",
                activeArtifact.kind === "mindmap"
                  ? "bg-gradient-to-b from-[#0b0914] via-[#0b0914]/90 to-transparent absolute top-0 left-0 w-full pointer-events-none"
                  : "bg-gradient-to-b from-[#0b0713] via-[#0b0713]/96 to-transparent backdrop-blur-[2px]"
              )}>
                <div className="pointer-events-auto">
                  <div className="inline-flex items-center justify-center px-2.5 py-1 mb-2 rounded-full bg-white/[0.05] border border-white/[0.05] text-[10px] uppercase font-bold tracking-widest text-white/60">
                    {activeArtifact.kind}
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-white/95">{activeArtifact.title}</div>
                </div>

                {artifacts.length > 1 && (
                  <div className="pointer-events-auto flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] max-w-[50%]">
                    {artifacts.map((artifact, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-sm backdrop-blur-md",
                          activeArtifactIndex === idx
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]"
                        )}
                      >
                        <button
                          onClick={() => setActiveArtifactIndex(idx)}
                          className="flex-1 text-left"
                        >
                          {artifact.kind.charAt(0).toUpperCase() + artifact.kind.slice(1)}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newArtifacts = artifacts.filter((_, i) => i !== idx);
                            setArtifacts(newArtifacts);
                            if (newArtifacts.length === 0) {
                              onBack();
                            } else {
                              setActiveArtifactIndex(Math.min(idx, newArtifacts.length - 1));
                            }
                          }}
                          className="p-1 hover:bg-white/20 rounded transition-colors flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={cn(
                "flex-1 relative",
                activeArtifact.kind === "mindmap"
                  ? "overflow-hidden w-full h-full"
                  : "overflow-auto px-8 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'][scrollbar-width:'none']"
              )}>
                <CanvasArtifact artifact={activeArtifact} onQuickPrompt={onQuickPrompt} />
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sm text-white/40 space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7209B7]/10 to-[#F72585]/10 border border-white/[0.05] flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p>Your generated materials will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CanvasArtifact({ artifact, onQuickPrompt }: { artifact: StudyBuddyArtifact, onQuickPrompt: (p: string) => void }) {
  const isMindmap = artifact.kind === "mindmap";

  if (isMindmap && "markdown" in artifact.content) {
    return <AtlasMindmap content={artifact.content.markdown} onQuickPrompt={onQuickPrompt} />;
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto mt-2 w-full">
      {"markdown" in artifact.content ? (
        <div className="p-2">
          <MarkdownBody content={artifact.content.markdown} />
        </div>
      ) : "cards" in artifact.content ? (
        <div className="pt-10 flex flex-col justify-center items-center w-full min-h-[400px]">
          <MorphingCardStack
            defaultLayout="stack"
            className="w-full max-w-[600px] aspect-[4/3]"
            cards={artifact.content.cards.map((c, idx) => ({
              id: `${idx + 1}`,
              title: formatPowerNotation(c.front),
              description: formatPowerNotation(c.back),
            }))}
          />
          <div className="mt-8 text-white/40 text-sm">Click cards to flip • Drag to navigate</div>
        </div>
      ) : (
        <InteractiveQuiz questions={artifact.content.questions} />
      )}
    </div>
  )
}

// ---- ATLAS STYLE MIND MAP IMPLEMENTATION ----

type NodeData = {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;
  level: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

type EdgeData = {
  id: string;
  sourceId: string;
  targetId: string;
}

const CATEGORIES = [
  { keywords: ["mechanism", "process", "how", "step"], tag: "METHODOLOGY", color: "#4CC9F0" },
  { keywords: ["type", "class", "category", "form"], tag: "CLASSIFICATION", color: "#B5179E" },
  { keywords: ["example", "instance", "case"], tag: "EXAMPLE", color: "#F72585" },
  { keywords: ["property", "feature", "characteristic"], tag: "PROPERTY", color: "#7209B7" },
  { keywords: ["reaction", "interact", "effect"], tag: "REACTIVITY", color: "#4361EE" },
  { keywords: ["definition", "meaning", "what"], tag: "CONCEPT", color: "#4895EF" },
];

function inferCategory(text: string, isRoot: boolean) {
  if (isRoot) return { tag: "ROOT", color: "#FFFFFF" };
  const lower = text.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) {
      return { tag: cat.tag, color: cat.color };
    }
  }
  return { tag: "CONCEPT", color: "#8E82A8" };
}

const NODE_WIDTH = 280;
// We use dynamic height and transform: translate(-50%, -50%) for centering

function parseToGraph(markdown: string) {
  const root: NodeData = { id: 'root', title: 'Central Concept', description: '', tag: 'ROOT', color: '#fff', level: 0, x: 0, y: 0, vx: 0, vy: 0 };
  const lines = markdown.split('\n');
  const stack: { node: NodeData; indent: number }[] = [];

  const nodes: NodeData[] = [root];
  const edges: EdgeData[] = [];

  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    root.title = titleMatch[1].trim();
  }

  stack.push({ node: root, indent: -1 });

  lines.forEach((line, i) => {
    if (line.trim() === '' || line.startsWith('#')) return;

    const match = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (match) {
      const indent = match[1].length;
      const rawText = match[2].trim();

      let title = rawText.replace(/\*\*/g, '').trim();
      let description = "";

      const splitMatch = rawText.match(/^(.*?)(?:[:\-]|\s-\s)(.*)$/);
      if (splitMatch && splitMatch[1].length < 60) {
        title = splitMatch[1].replace(/\*\*/g, '').trim();
        description = splitMatch[2].replace(/\*\*/g, '').trim();
      }

      const { tag, color } = inferCategory(title, false);

      const node: NodeData = {
        id: `node-${i}`,
        title: formatPowerNotation(title),
        description: formatPowerNotation(description),
        tag,
        color,
        level: 0,
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        vx: 0, vy: 0
      };

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      node.level = parent.level + 1;

      nodes.push(node);
      edges.push({ id: `e-${parent.id}-${node.id}`, sourceId: parent.id, targetId: node.id });

      stack.push({ node, indent });
    }
  });

  // Apply a quick force-directed layout iteratively to arrange nodes
  const ITERATIONS = 120;
  const REPULSION = 1000000;
  const SPRING_K = 0.03;
  const SPRING_LEN = 350;

  for (let i = 0; i < ITERATIONS; i++) {
    // Repulsion
    for (let j = 0; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const dx = nodes[j].x - nodes[k].x;
        const dy = nodes[j].y - nodes[k].y;
        const distSq = dx * dx + dy * dy || 1;
        // Cap repulsion distance so they don't fly to infinity
        const force = REPULSION / Math.max(distSq, 500);
        const dist = Math.sqrt(distSq);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[j].vx += fx; nodes[j].vy += fy;
        nodes[k].vx -= fx; nodes[k].vy -= fy;
      }
    }
    // Attraction
    edges.forEach(e => {
      const source = nodes.find(n => n.id === e.sourceId);
      const target = nodes.find(n => n.id === e.targetId);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy || 1);
      const force = (dist - SPRING_LEN) * SPRING_K;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      source.vx += fx; source.vy += fy;
      target.vx -= fx; target.vy -= fy;
    });

    // Gravity to center to keep it unified
    nodes.forEach(n => {
      n.vx -= n.x * 0.005;
      n.vy -= n.y * 0.005;

      n.vx *= 0.85; // Damping
      n.vy *= 0.85;
      n.x += n.vx;
      n.y += n.vy;
    });
  }

  // Pin root exactly to center
  const finalRoot = nodes.find(n => n.id === 'root');
  if (finalRoot) {
    finalRoot.x = 0; finalRoot.y = 0;
  }

  return { nodes, edges };
}

function AtlasMindmap({ content, onQuickPrompt }: { content: string, onQuickPrompt: (p: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);

  // Viewport transform
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.75 });
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const canvasDragStart = useRef({ x: 0, y: 0 });

  // Node interaction state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const nodeDragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  // Selection
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const { nodes: parsedNodes, edges: parsedEdges } = parseToGraph(content);
    setNodes(parsedNodes);
    setEdges(parsedEdges);

    // Center viewport on root initially
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTransform({ x: rect.width / 2, y: rect.height / 2, scale: 0.75 });
    }
  }, [content]);

  const onCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore if clicking on a node or the inspector panel
    if ((e.target as HTMLElement).closest('.mindmap-node') || (e.target as HTMLElement).closest('.mindmap-inspector')) return;
    setIsCanvasDragging(true);
    setInspectedNodeId(null);
    canvasDragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [transform]);

  const onCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isCanvasDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - canvasDragStart.current.x,
      y: e.clientY - canvasDragStart.current.y
    }));
  }, [isCanvasDragging]);

  const onCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    setIsCanvasDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    setTransform(prev => {
      const newScale = Math.min(Math.max(0.2, prev.scale + zoomFactor), 2);
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleNodePointerDown = (e: React.PointerEvent, node: NodeData) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggedNodeId(node.id);
    setInspectedNodeId(node.id);
    nodeDragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };
  };

  const handleNodePointerMove = (e: React.PointerEvent, id: string) => {
    if (draggedNodeId !== id) return;
    e.stopPropagation();
    const dx = (e.clientX - nodeDragStart.current.x) / transform.scale;
    const dy = (e.clientY - nodeDragStart.current.y) / transform.scale;
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x: nodeDragStart.current.nodeX + dx, y: nodeDragStart.current.nodeY + dy } : n));
  };

  const handleNodePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggedNodeId(null);
  };

  const inspectedNode = nodes.find(n => n.id === inspectedNodeId);
  const rootNode = nodes.find(n => n.id === 'root');

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0b0914] select-none rounded-2xl border border-white/[0.05]">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-75"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`
        }}
      />

      {/* Canvas Controls */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 bg-[#161224]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
        <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.2, p.scale - 0.2) }))} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
        <div className="text-[10px] font-medium text-white/40 w-8 text-center">{Math.round(transform.scale * 100)}%</div>
        <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(2, p.scale + 0.2) }))} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              setTransform({ x: rect.width / 2, y: rect.height / 2, scale: 0.75 });
            }
          }}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Recenter"
        >
          <Target className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        className={cn("w-full h-full touch-none", isCanvasDragging ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerLeave={onCanvasPointerUp}
        onWheel={onWheel}
      >
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: 0, height: 0,
            position: 'absolute', top: 0, left: 0
          }}
          className="transition-transform duration-75 ease-out"
        >
          {/* SVG Edges */}
          <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.sourceId);
              const target = nodes.find(n => n.id === edge.targetId);
              if (!source || !target) return null;

              const isHovered = inspectedNodeId === source.id || inspectedNodeId === target.id;

              // Centers of nodes
              const x1 = source.x;
              const y1 = source.y;
              const x2 = target.x;
              const y2 = target.y;

              return (
                <g key={edge.id}>
                  {isHovered && (
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={target.color}
                      strokeWidth="6"
                      className="opacity-20 blur-sm transition-opacity duration-300"
                    />
                  )}
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isHovered ? target.color : "#2A2040"}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="transition-all duration-300"
                  />
                </g>
              )
            })}
          </svg>

          {/* DOM Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="mindmap-node absolute"
              style={{
                left: node.x,
                top: node.y,
                width: NODE_WIDTH,
                transform: 'translate(-50%, -50%)'
              }}
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onPointerMove={(e) => handleNodePointerMove(e, node.id)}
              onPointerUp={handleNodePointerUp}
            >
              <div className={cn(
                "w-full rounded-2xl p-5 flex flex-col transition-all duration-200 cursor-pointer",
                "bg-[#110D1F] border shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                draggedNodeId === node.id ? "border-white/40 scale-[1.05] z-50 shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                  : inspectedNodeId === node.id ? "border-[#4A3B73] bg-[#161224] scale-[1.02] z-40 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                    : "border-[#221A36] hover:border-[#3A2D5C] hover:bg-[#141022] z-10"
              )}>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: node.color, color: node.color }} />
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8E82A8] truncate">
                    {node.tag}
                  </span>
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className={cn(
                    "font-bold text-white/95 leading-tight",
                    node.level === 0 ? "text-lg" : "text-[15px]"
                  )}>
                    {node.title}
                  </h3>
                  {node.description && (
                    <p className="text-[12px] text-[#7B738F] mt-2 leading-snug line-clamp-2 overflow-hidden pointer-events-none">
                      {node.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspector Panel */}
      <AnimatePresence>
        {inspectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mindmap-inspector absolute top-6 right-6 w-80 max-h-[80%] overflow-y-auto bg-[#110D1F]/95 backdrop-blur-xl border border-[#3A2D5C] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] z-50 flex flex-col [&::-webkit-scrollbar]:hidden[-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            <div className="p-6 border-b border-white/[0.05] relative">
              <button onClick={() => setInspectedNodeId(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: inspectedNode.color, color: inspectedNode.color }} />
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8E82A8]">
                  {inspectedNode.tag}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 leading-snug">{inspectedNode.title}</h2>
            </div>

            {inspectedNode.description && (
              <div className="p-6 flex-1 text-sm text-[#A59CB8] leading-relaxed whitespace-pre-wrap">
                {inspectedNode.description}
              </div>
            )}

            <div className="p-4 bg-white/[0.02] border-t border-white/[0.05]">
              <button
                onClick={() => {
                  const prompt = `Explain more about "${inspectedNode.title}"${rootNode ? ` in the context of ${rootNode.title}` : ''}.`;
                  onQuickPrompt(prompt);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#7209B7] to-[#F72585] hover:opacity-90 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(247,37,133,0.3)] hover:shadow-[0_0_25px_rgba(247,37,133,0.5)]"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI to Expand Info
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- UTILITIES ----

function formatPowerNotation(input: string) {
  if (!input) return input
  return input.replace(/([A-Za-z0-9)\]])\^([0-9+\-]+)/g, (_m, base: string, exp: string) => {
    return `${base}${toSuperscript(exp)}`
  })
}

function toSuperscript(exp: string) {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
    "+": "⁺", "-": "⁻",
  }
  return exp.split("").map((ch) => map[ch] ?? ch).join("")
}

function formatMarkdown(text: string) {
  if (!text) return null;
  text = formatPowerNotation(text);

  let html = text;

  // Process tables first before newline formatting scrambles them
  html = html.replace(/(?:^|\r?\n)([ \t]*\|.*\|[ \t]*(?:\r?\n[ \t]*\|.*\|[ \t]*)+)/g, (match, tableBlock) => {
    const lines = tableBlock.trim().split(/\r?\n/);
    let htmlTable = '<div class="overflow-x-auto my-6 border border-white/10 rounded-xl bg-white/[0.01] shadow-sm"><table class="w-full text-left text-sm text-white/80 m-0"><thead class="bg-white/[0.04] text-white/90 border-b border-white/10">';
    let isHeader = true;
    let hasBody = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check for markdown separator line e.g., |---|---|
      if (isHeader && /^[\|\-\s\:]+$/.test(line) && line.includes('-')) {
        isHeader = false;
        hasBody = true;
        htmlTable += '</thead><tbody class="divide-y divide-white/5">';
        continue;
      }

      const cells = line.split('|').map(c => c.trim());
      // Strip starting and trailing empty elements derived from outer pipe splits
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();

      if (cells.length === 0) continue;

      htmlTable += '<tr class="hover:bg-white/[0.02] transition-colors">';
      for (const cell of cells) {
        if (isHeader) {
          htmlTable += `<th class="px-4 py-3 font-medium text-white">${cell}</th>`;
        } else {
          htmlTable += `<td class="px-4 py-3">${cell}</td>`;
        }
      }
      htmlTable += '</tr>';

      // Fallback: If no separator was found on the next line, consider it a headerless layout
      if (i === 0 && lines.length > 1) {
        const nextLine = lines[1].trim();
        if (!(/^[\|\-\s\:]+$/.test(nextLine) && nextLine.includes('-'))) {
          isHeader = false;
          hasBody = true;
          htmlTable += '</thead><tbody class="divide-y divide-white/5">';
        }
      }
    }
    if (!hasBody) htmlTable += '</thead><tbody class="divide-y divide-white/5">';
    htmlTable += '</tbody></table></div>';
    return htmlTable;
  });

  html = html
    .replace(/^([A-Za-z0-9 ]+)\r?\n={2,}/gm, '<h1 class="text-xl font-bold mt-7 mb-4 text-white border-b border-white/10 pb-2">$1</h1>')
    .replace(/^([A-Za-z0-9 ]+)\r?\n-{2,}/gm, '<h2 class="text-lg font-bold mt-6 mb-3 text-white">$1</h2>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold mt-4 mb-2 text-white/80">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold mt-5 mb-2 text-[#F72585]">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-6 mb-3 text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-7 mb-4 text-white border-b border-white/10 pb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/^\s*[\-\*]\s+(.*)$/gim, '<li class="ml-4 list-disc mb-1.5 text-white/80">$1</li>')
    .replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4 list-decimal mb-1.5 text-white/80">$1</li>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 border border-white/10 rounded text-xs text-[#4CC9F0]">$1</code>')
    .replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-[#F72585] bg-[#F72585]/10 pl-4 py-2 my-3 text-white/80 italic">$1</blockquote>');

  html = html
    .replace(/\n/g, "<br/>")
    .replace(/(<br\/>)+<li/g, "<ul class='my-2'><li")
    .replace(/<\/li>(<br\/>)+/g, "</li></ul>")
    .replace(/<br\/>/g, '<div class="h-1.5"></div>');

  return <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MarkdownBody({ content }: { content: string }) {
  return formatMarkdown(content);
}

type QuizQuestion = { q: string; options?: string[]; answer: string; explanation?: string }

function InteractiveQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validQuestions = questions.filter((q) => Array.isArray(q.options) && q.options.length > 0)
  const total = validQuestions.length
  const answered = validQuestions.filter((q, idx) => typeof selected[idx] === "string").length
  const correct = validQuestions.filter((q, idx) => normalize(selected[idx]) === normalize(q.answer)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 shadow-lg">
        <div className="flex flex-col">
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Progress</span>
          <span className="text-lg font-medium text-white/90">
            {submitted ? `Score: ${correct}/${total}` : `${answered} of ${total} Answered`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={submitted || answered !== total || total === 0}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
            !submitted && answered === total && total > 0
              ? "bg-[#B5179E] text-white hover:bg-[#C01AA6]"
              : "bg-white/[0.03] text-white/30 cursor-not-allowed"
          )}
        >
          {submitted ? "Completed" : "Grade Quiz"}
        </button>
      </div>

      {total === 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-200/80 text-center">
          Quiz data is missing options. Ask the AI to regenerate this quiz.
        </div>
      )}

      <div className="space-y-4">
        {validQuestions.map((q, idx) => {
          const picked = selected[idx]
          const isCorrect = normalize(picked) === normalize(q.answer)
          return (
            <div key={idx} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:p-8 shadow-xl transition-all duration-300">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-white/60">
                  {idx + 1}
                </div>
                <div className="text-[12px] text-white/40 uppercase tracking-widest font-semibold">Question</div>
              </div>
              <div className="text-base md:text-lg font-medium text-white/95 whitespace-pre-wrap leading-relaxed mb-6">{formatPowerNotation(q.q)}</div>

              <div className="grid gap-3">
                {q.options!.map((opt, i) => {
                  const active = picked === opt
                  const revealGood = submitted && normalize(opt) === normalize(q.answer)
                  const revealBad = submitted && active && !revealGood
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelected((prev) => ({ ...prev, [idx]: opt }))}
                      className={cn(
                        "text-left text-[14px] rounded-xl border px-5 py-3.5 transition-all outline-none",
                        active && !submitted ? "border-[#B5179E]/80 bg-[#B5179E]/15 text-white shadow-[0_0_15px_rgba(181,23,158,0.15)]" : "border-white/10 bg-black/20 text-white/80 hover:border-white/20 hover:bg-white/[0.04]",
                        revealGood && "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
                        revealBad && "border-rose-500/50 bg-rose-500/10 text-rose-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          active && !submitted ? "border-[#B5179E] bg-[#B5179E] text-white" : "border-white/20 bg-transparent text-transparent",
                          revealGood && "border-emerald-500 bg-emerald-500 text-white border-transparent",
                          revealBad && "border-rose-500 bg-rose-500 text-white border-transparent"
                        )}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        <span>{formatPowerNotation(opt)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  className="mt-6 pt-6 border-t border-white/[0.05] space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("px-2 py-1 rounded md text-[11px] font-bold uppercase tracking-wider", isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                      {isCorrect ? "Correct" : "Incorrect"}
                    </div>
                    {!isCorrect && (
                      <div className="text-sm font-medium text-white/80">
                        Answer: <span className="text-white">{formatPowerNotation(q.answer)}</span>
                      </div>
                    )}
                  </div>
                  {q.explanation && (
                    <div className="text-[14px] leading-relaxed text-white/60 whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/[0.02]">
                      <div className="text-[11px] uppercase tracking-widest font-bold text-white/30 mb-2">Explanation</div>
                      {formatPowerNotation(q.explanation)}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function normalize(v?: string) {
  return (v ?? "").trim().toLowerCase()
}

function ModelLogo({ activeAgent }: { activeAgent: string }) {
  const agent = activeAgent.toLowerCase();
  
  if (agent === "chatgpt" || agent === "openai") {
    return (
      <svg className="w-4 h-4 text-white/70" viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'>
        <path fill="currentColor" d='m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z'/>
      </svg>
    );
  }
  
  if (agent === "gemini" || agent === "google") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#3186FF"></path>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-0)"></path>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-1)"></path>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-2)"></path>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="gemini-0" x1="7" x2="11" y1="15.5" y2="12">
            <stop stopColor="#08B962"></stop>
            <stop offset="1" stopColor="#08B962" stopOpacity="0"></stop>
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="gemini-1" x1="8" x2="11.5" y1="5.5" y2="11">
            <stop stopColor="#F94543"></stop>
            <stop offset="1" stopColor="#F94543" stopOpacity="0"></stop>
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="gemini-2" x1="3.5" x2="17.5" y1="13.5" y2="12">
            <stop stopColor="#FABC12"></stop>
            <stop offset=".46" stopColor="#FABC12" stopOpacity="0"></stop>
          </linearGradient>
        </defs>
      </svg>
    );
  }
  
  if (agent === "groq") {
    return (
      <svg className="w-4 h-4 text-white/70" fill="currentColor" fillRule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z"></path>
      </svg>
    );
  }
  
  return (
    <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
      {activeAgent}
    </span>
  );
}

function AtlasThinkingLogo() {
  return (
    <div className="w-6 h-6 flex-shrink-0 relative">
      <svg 
        width="26" 
        height="24" 
        viewBox="0 0 426 392" 
        fill="none" 
        className="absolute inset-0"
      >
        <motion.path
          d="M234.582 142.378L238.297 167.848C238.525 169.416 240.398 170.108 241.591 169.066L255.588 156.847L287.299 129.149C288.913 127.739 287.479 125.122 285.422 125.723L236 140.17C235.043 140.45 234.438 141.391 234.582 142.378Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M172.261 158.961L183.258 168.607C184.544 169.734 183.914 171.851 182.22 172.091L159.954 175.245C159.116 175.364 158.294 174.942 157.901 174.191L136.15 132.598C135.125 130.638 137.57 128.71 139.237 130.164L172.261 158.961Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M190.778 249.596L187.064 224.125C186.835 222.558 184.962 221.866 183.769 222.907L169.772 235.127L138.062 262.825C136.447 264.234 137.881 266.852 139.938 266.25L189.36 251.804C190.317 251.524 190.922 250.582 190.778 249.596Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M253.1 233.012L242.102 223.367C240.817 222.239 241.447 220.122 243.14 219.883L265.406 216.729C266.245 216.61 267.067 217.032 267.459 217.782L289.21 259.375C290.235 261.335 287.791 263.263 286.124 261.81L253.1 233.012Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.45,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M212.839 220.206L212.824 351.863C212.824 355.571 218.224 355.987 218.782 352.32C227.415 295.584 237.029 232.222 238.623 221.718C238.771 220.739 238.419 219.802 237.695 219.127L217.886 200.647C215.968 198.858 212.839 200.218 212.839 202.84L212.839 220.206Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M187.063 170.108L206.873 39.3733C207.429 35.7051 212.839 36.1075 212.839 39.8175V172.283V189.038C212.839 191.66 209.711 193.02 207.793 191.231L187.983 172.751C187.259 172.076 186.915 171.087 187.063 170.108Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.75,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M187.902 219.352L207.305 201.173C209.291 199.313 207.974 195.984 205.254 195.984L180.354 195.984L0.0644531 196.17L185.467 220.138C186.355 220.252 187.248 219.964 187.902 219.352Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.9,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M237.762 172.769L218.359 190.948C216.374 192.808 217.69 196.137 220.41 196.137L245.31 196.137L425.6 195.951L240.197 171.983C239.309 171.869 238.416 172.157 237.762 172.769Z"
          fill="white"
          fillOpacity="0"
          stroke="white"
          strokeWidth="1"
          initial={{ fillOpacity: 0 }}
          animate={{ 
            fillOpacity: [0, 0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.05,
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
      </svg>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center ml-0.5">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1 h-1 bg-white/80 rounded-full mx-[1.5px]"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
