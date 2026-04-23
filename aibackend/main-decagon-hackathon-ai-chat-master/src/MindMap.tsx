"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Loader2,
  Plus,
  Target,
  BrainCircuit,
  Search,
  Trash2,
  ArrowUp,
  Network,
  X,
  ExternalLink,
  Globe,
} from "lucide-react";

// --- Types ---
interface MapNode {
  id: string;
  label: string;
  category: string;
  description: string;
  x: number;
  y: number;
  color: string;
  parentId?: string;
  isLoading?: boolean;
  isEditing?: boolean;
}

// Dashboard-matched palette
const COLORS = ["#7209B7", "#F72585", "#4CC9F0", "#4361EE", "#B5179E"];
const REPULSION_RADIUS = 280;

// Helper for drawing curved Bezier paths between nodes
const getCurvedPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
};

export default function MindMap() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [prompt, setPrompt] = useState("");
  const [viewState, setViewState] = useState({ x: 0, y: 0, zoom: 1 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const rootNode = nodes.find((n) => !n.parentId);
  const rootLabel = rootNode ? rootNode.label : "";

  // --- API LOGIC: Context-Aware Expansion ---
  const handleGenerate = async () => {
    if (isGenerating || !prompt.trim()) return;
    setIsGenerating(true);

    const isContinuation = !!selectedNode;
    const targetParentId = selectedNode?.id;
    const targetPos = selectedNode
      ? { x: selectedNode.x, y: selectedNode.y }
      : undefined;

    if (!isContinuation) {
      setNodes([]);
      setSelectedNodeId(null);
    } else {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === targetParentId ? { ...n, isLoading: true } : n,
        ),
      );
    }

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;

      const systemMessage = isContinuation
        ? `You are expanding a specific node in a mind map. The user is asking: "${prompt}". The current node context is "${selectedNode.label}". Output ONLY a JSON array of 3 to 4 connected sub-topics answering or expanding on the query. Format:[{"label": "Concept", "category": "CORE/TOOL/METHOD/PROPERTY", "description": "Short 1-line detail"}]`
        : `You are generating a root mind map. Output ONLY a JSON array of 4 to 5 foundational sub-topics for the query: "${prompt}". Format:[{"label": "Concept", "category": "CORE/TOOL/METHOD/PROPERTY", "description": "Short 1-line detail"}]`;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "system", content: systemMessage }],
          }),
        },
      );

      const data = await response.json();
      const content = data.choices[0].message.content;
      const subTopics: any[] = JSON.parse(
        content.match(/\[[\s\S]*\]/)?.[0] || "[]",
      );

      spawnNodes(
        subTopics,
        isContinuation ? selectedNode.label : prompt,
        targetParentId,
        targetPos,
      );
      setPrompt("");
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setIsGenerating(false);
      if (targetParentId) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === targetParentId ? { ...n, isLoading: false } : n,
          ),
        );
      }
    }
  };

  // --- API LOGIC: Bulk Deep Dive ---
  const bulkExpand = async () => {
    if (nodes.length === 0 || isGenerating) return;

    const leafNodes = nodes.filter(
      (n) => !nodes.some((child) => child.parentId === n.id),
    );
    if (leafNodes.length === 0) return;

    setIsGenerating(true);
    setNodes((prev) =>
      prev.map((n) => (leafNodes.includes(n) ? { ...n, isLoading: true } : n)),
    );

    try {
      const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
      const topics = leafNodes.map((n) => n.label).join(", ");

      const response = await fetch(
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
                  'Return ONLY a JSON object mapping exact provided topics to an array of 2 sub-topics. Format: {"Topic Name":[{"label": "...", "category": "...", "description": "..."}]}',
              },
              { role: "user", content: `Expand these topics: ${topics}` },
            ],
          }),
        },
      );

      const data = await response.json();
      const resultMap = JSON.parse(
        data.choices[0].message.content.match(/\{[\s\S]*\}/)?.[0] || "{}",
      );

      leafNodes.forEach((leaf) => {
        if (resultMap[leaf.label]) {
          spawnNodes(resultMap[leaf.label], leaf.label, leaf.id, {
            x: leaf.x,
            y: leaf.y,
          });
        }
      });
    } catch (e) {
      console.error("Bulk generation failed:", e);
    } finally {
      setIsGenerating(false);
      setNodes((prev) => prev.map((n) => ({ ...n, isLoading: false })));
    }
  };

  // --- LAYOUT ENGINE: Organic Radial Outward Growth ---
  const spawnNodes = (
    newTopics: any[],
    rootLabel: string,
    parentId?: string,
    parentPos?: { x: number; y: number },
  ) => {
    setNodes((currentNodes) => {
      const pX = parentPos?.x ?? window.innerWidth / 2;
      const pY = parentPos?.y ?? window.innerHeight / 2;

      let baseAngle = 0;
      let arcSpread = Math.PI * 2;

      if (parentId) {
        const parentNode = currentNodes.find((n) => n.id === parentId);
        if (parentNode && parentNode.parentId) {
          const grandParent = currentNodes.find(
            (n) => n.id === parentNode.parentId,
          );
          if (grandParent) {
            baseAngle = Math.atan2(pY - grandParent.y, pX - grandParent.x);
            arcSpread = Math.PI * 1.2; // 216-degree fan outward
          }
        } else {
          baseAngle = Math.random() * Math.PI * 2;
          arcSpread = Math.PI * 1.5;
        }
      }

      let updatedNodes = [...currentNodes];
      let rId = parentId;

      if (!parentId) {
        rId = crypto.randomUUID();
        updatedNodes.push({
          id: rId,
          label: rootLabel.toUpperCase(),
          category: "ROOT",
          description: "Origin Query",
          x: pX,
          y: pY,
          color: "#FFFFFF",
        });
      }

      const angleStep = arcSpread / newTopics.length;
      const startAngle = baseAngle - arcSpread / 2 + angleStep / 2;

      newTopics.forEach((t, i) => {
        const angleJitter = (Math.random() - 0.5) * 0.3;
        const angle = startAngle + i * angleStep + angleJitter;
        const radius = 240 + Math.random() * 80;

        let tX = pX + Math.cos(angle) * radius;
        let tY = pY + Math.sin(angle) * radius;

        let attempts = 0;
        while (
          updatedNodes.some((n) => Math.hypot(n.x - tX, n.y - tY) < 180) &&
          attempts < 10
        ) {
          tX += Math.cos(angle) * 40;
          tY += Math.sin(angle) * 40;
          attempts++;
        }

        updatedNodes.push({
          id: crypto.randomUUID(),
          label: t.label,
          category: t.category,
          description: t.description,
          parentId: rId,
          x: tX,
          y: tY,
          color: COLORS[i % COLORS.length],
        });
      });

      return updatedNodes;
    });
  };

  // Node editing & updating logic
  const updateNodePos = (id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
    );
  };

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, label: newLabel || "Untitled", isEditing: false }
          : n,
      ),
    );
  };

  const enableNodeEdit = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isEditing: true } : n)),
    );
  };

  const addCustomNode = (parentId: string, pX: number, pY: number) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200;
    const newNode: MapNode = {
      id: crypto.randomUUID(),
      label: "",
      category: "CUSTOM",
      description: "User added node",
      parentId: parentId,
      x: pX + Math.cos(angle) * dist,
      y: pY + Math.sin(angle) * dist,
      color: "#FFFFFF",
      isEditing: true, // Instantly editable
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  return (
    <div
      className="h-screen w-full bg-[#0c0515] text-white overflow-hidden relative font-sans"
      onClick={() => setSelectedNodeId(null)}
    >
      {/* Background: Static normally, Pulses only when generating */}
      <motion.div
        animate={
          isGenerating ? { opacity: [0.1, 0.8, 0.1] } : { opacity: 0.15 }
        }
        transition={
          isGenerating
            ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
            : {}
        }
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,9,183,1)_1px,transparent_1px)] bg-[length:24px_24px]"
      />

      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-40 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-[#140a25] border border-white/[0.12] flex items-center justify-center shadow-lg">
            <Compass size={16} className="text-[#F72585]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Atlas <span className="text-white/40 font-normal">Mapping</span>
          </span>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={bulkExpand}
            disabled={isGenerating || nodes.length === 0}
            className="px-4 py-2 bg-[#140a25]/90 hover:bg-white/[0.05] rounded-lg border border-white/[0.12] text-white/80 hover:text-white transition-all shadow-lg flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold disabled:opacity-40"
          >
            <Network size={14} className="text-[#F72585]" /> Deep Dive
          </button>
          <button
            onClick={() => setViewState({ x: 0, y: 0, zoom: 1 })}
            className="p-2 bg-[#140a25]/90 hover:bg-white/[0.05] rounded-lg border border-white/[0.12] text-white/60 hover:text-white transition-all shadow-lg"
          >
            <Target size={16} />
          </button>
          <button
            onClick={() => {
              setNodes([]);
              setSelectedNodeId(null);
            }}
            className="p-2 bg-[#140a25]/90 hover:bg-red-500/10 rounded-lg border border-white/[0.12] text-white/60 hover:text-red-400 transition-all shadow-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* CANVAS DRAGGING */}
      <motion.div
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
        onPan={(e, info) =>
          setViewState((p) => ({
            ...p,
            x: p.x + info.delta.x,
            y: p.y + info.delta.y,
          }))
        }
        onWheel={(e) =>
          setViewState((p) => ({
            ...p,
            zoom: Math.min(Math.max(p.zoom - e.deltaY * 0.001, 0.2), 2),
          }))
        }
      >
        <motion.div
          className="w-full h-full origin-top-left"
          style={{ x: viewState.x, y: viewState.y, scale: viewState.zoom }}
        >
          {/* Curved, Glowing Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {nodes.map((node) => {
              if (!node.parentId) return null;
              const parent = nodes.find((n) => n.id === node.parentId);
              if (!parent) return null;

              // If a node is selected, glow its connected pathways
              const isGlowing =
                selectedNodeId === node.id || selectedNodeId === parent.id;

              return (
                <motion.path
                  key={`line-${node.id}`}
                  d={getCurvedPath(parent.x, parent.y, node.x, node.y)}
                  fill="none"
                  stroke={isGlowing ? node.color : node.color}
                  strokeWidth={isGlowing ? 3 : 1.5}
                  strokeOpacity={isGlowing ? 0.8 : 0.2}
                  style={{
                    filter: isGlowing
                      ? `drop-shadow(0 0 8px ${node.color})`
                      : "none",
                  }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isFaded =
              selectedNodeId &&
              selectedNodeId !== node.id &&
              selectedNodeId !== node.parentId &&
              !nodes.find((n) => n.id === selectedNodeId)?.parentId === node.id;

            return (
              <NodeElement
                key={node.id}
                node={node}
                zoom={viewState.zoom}
                isSelected={selectedNodeId === node.id}
                isFaded={isFaded}
                isGenerating={isGenerating}
                onUpdatePos={updateNodePos}
                onUpdateLabel={updateNodeLabel}
                onDoubleClick={() => enableNodeEdit(node.id)}
                onSelect={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                onExpand={() => {
                  setSelectedNodeId(node.id);
                  setPrompt(`Expand on ${node.label}`);
                  handleGenerate();
                }}
                onAddChild={() => addCustomNode(node.id, node.x, node.y)}
              />
            );
          })}
        </motion.div>
      </motion.div>

      {/* Side Panel (Context-Aware DDGS & Wiki) */}
      <AnimatePresence>
        {selectedNode && !selectedNode.isEditing && (
          <SidePanel
            node={selectedNode}
            rootLabel={rootLabel}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </AnimatePresence>

      {/* Smart Command Bar */}
      <footer
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#140a25]/95 backdrop-blur-xl rounded-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-1.5 flex items-center gap-2 transition-all">
          <Search className="text-white/40 ml-4" size={18} />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder={
              selectedNode
                ? `Ask about "${selectedNode.label}"...`
                : "Enter a core topic to generate a map..."
            }
            className="flex-1 bg-transparent py-2.5 px-2 outline-none text-sm placeholder:text-white/30 text-white"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-white/10 border border-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// --- NODE COMPONENT (Edit on Double-Click, Floating Buttons Underneath) ---
function NodeElement({
  node,
  zoom,
  isSelected,
  isFaded,
  isGenerating,
  onUpdatePos,
  onUpdateLabel,
  onDoubleClick,
  onExpand,
  onAddChild,
  onSelect,
}: any) {
  const [editValue, setEditValue] = useState(node.label);

  // Sync state if it becomes a new editable node
  useEffect(() => {
    setEditValue(node.label);
  }, [node.label]);

  return (
    <motion.div
      onPointerDownCapture={(e) => e.stopPropagation()}
      onDoubleClick={onDoubleClick}
      onPan={(e, info) => {
        if (!node.isEditing)
          onUpdatePos(node.id, info.delta.x / zoom, info.delta.y / zoom);
      }}
      className={`absolute z-20 group origin-center ${node.isEditing ? "" : "cursor-grab active:cursor-grabbing"} pb-12`}
      style={{ left: node.x, top: node.y, x: "-50%", y: "-50%" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: isSelected ? 1.05 : 1, opacity: isFaded ? 0.3 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        <div
          onClick={onSelect}
          className={`bg-[#140a25] rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-200 w-[180px] border ${isSelected ? `border-[${node.color}] shadow-[0_0_20px_${node.color}40]` : "border-white/[0.12] hover:border-white/[0.3]"}`}
          style={{ borderColor: isSelected ? node.color : undefined }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: node.color,
                boxShadow: `0 0 8px ${node.color}`,
              }}
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
              {node.isLoading ? "THINKING" : node.category}
            </span>
          </div>

          {node.isEditing ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => onUpdateLabel(node.id, editValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onUpdateLabel(node.id, editValue);
                e.stopPropagation();
              }}
              className="w-full bg-transparent border-b border-white/20 text-[13px] font-semibold text-white outline-none focus:border-[#F72585] p-0 m-0"
              placeholder="Enter node name..."
            />
          ) : (
            <div className="text-[13px] font-semibold text-white/95 leading-snug">
              {node.label}
            </div>
          )}

          {/* Truncated description */}
          {node.description && !node.isEditing && (
            <p className="text-[10px] text-white/40 mt-2 line-clamp-1 border-t border-white/[0.04] pt-2">
              {node.description}
            </p>
          )}
        </div>

        {/* Floating Action Buttons UNDER the card */}
        <div className="absolute top-[100%] left-1/2 -translate-x-1/2 pt-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            disabled={isGenerating || node.isEditing}
            className="flex items-center justify-center p-2 bg-[#140a25] border border-white/[0.12] rounded-lg hover:bg-white/[0.1] text-white/70 hover:text-white transition-all shadow-lg"
          >
            {node.isLoading ? (
              <Loader2 size={14} className="animate-spin text-[#F72585]" />
            ) : (
              <BrainCircuit size={14} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild();
            }}
            disabled={isGenerating || node.isEditing}
            className="flex items-center justify-center p-2 bg-[#140a25] border border-white/[0.12] rounded-lg hover:bg-white/[0.1] text-white/70 hover:text-white transition-all shadow-lg"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- SIDE PANEL COMPONENT ---
function SidePanel({
  node,
  rootLabel,
  onClose,
}: {
  node: MapNode;
  rootLabel: string;
  onClose: () => void;
}) {
  const [wikiResults, setWikiResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery =
    rootLabel && rootLabel.toLowerCase() !== node.label.toLowerCase()
      ? `${rootLabel} ${node.label}`
      : node.label;

  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&utf8=&format=json&origin=*`,
        );
        const data = await res.json();
        setWikiResults(data.query.search.slice(0, 3));
      } catch (err) {
        console.error("Wikipedia fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (searchQuery) fetchRealData();
  }, [searchQuery]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute top-4 right-4 bottom-4 w-[360px] bg-[#140a25]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-6 z-50 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      onClick={(e) => e.stopPropagation()} // Prevent closing when interacting with panel
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-3 mt-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: node.color }}
          />
          {node.category}
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-white/95 mb-4 leading-tight">
        {node.label}
      </h2>

      <div className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-5 mb-6">
        <p className="text-[13px] text-white/70 leading-relaxed">
          {node.description || "No specific definition available."}
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-4 flex items-center gap-2 border-b border-white/[0.04] pb-3">
          <Globe size={14} /> Web Context:{" "}
          <span className="text-white/70 truncate ml-1">"{searchQuery}"</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/40">
            <Loader2 className="animate-spin text-[#7209B7]" size={24} />
            <span className="text-[11px] uppercase tracking-widest">
              Searching Knowledge Bases...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {wikiResults.length > 0 ? (
              wikiResults.map((res, i) => (
                <ResourceLink
                  key={i}
                  title={res.title}
                  subtitle="Wikipedia Encyclopedia"
                  url={`https://en.wikipedia.org/?curid=${res.pageid}`}
                  snippet={res.snippet}
                />
              ))
            ) : (
              <div className="text-sm text-white/30 p-4 text-center">
                No specific Wikipedia articles found.
              </div>
            )}

            <ResourceLink
              title={`Web Search: ${node.label}`}
              subtitle="DuckDuckGo General Search"
              url={`https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ResourceLink({
  title,
  subtitle,
  url,
  snippet,
}: {
  title: string;
  subtitle: string;
  url: string;
  snippet?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl border border-white/[0.04] hover:border-white/[0.12] transition-all cursor-pointer"
    >
      <div className="text-[14px] text-white/90 group-hover:text-[#F72585] font-medium leading-tight flex justify-between items-start transition-all mb-1.5">
        {title}
        <ExternalLink
          size={14}
          className="text-white/30 group-hover:text-[#F72585] transition-colors flex-shrink-0 ml-2"
        />
      </div>
      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">
        {subtitle}
      </div>
      {snippet && (
        <p
          className="text-[12px] text-white/50 leading-relaxed line-clamp-3"
          dangerouslySetInnerHTML={{ __html: snippet }}
        />
      )}
    </a>
  );
}
