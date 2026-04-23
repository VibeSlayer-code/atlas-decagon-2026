"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Sparkles,
    ArrowLeft,
    Trash2,
    Network,
    Save,
    ZoomIn,
    ZoomOut,
    Target,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

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
};

type EdgeData = {
    id: string;
    sourceId: string;
    targetId: string;
};

type Mindmap = {
    id: string;
    title: string;
    content: { markdown: string };
    created_at: string;
};

type ViewState = "list" | "create" | "view";

type CanvasNode = {
    id: string;
    title: string;
    description: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

type CanvasConnection = {
    id: string;
    fromId: string;
    toId: string;
};

interface MindmapPageProps {
    onNavigateToChat: () => void;
}

const LOCAL_STORAGE_KEY = "atlas_hackathon_mindmaps";

const getLocalMindmaps = (): Mindmap[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalMindmaps = (mindmaps: Mindmap[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mindmaps));
};

const CATEGORIES = [
    { keywords: ["mechanism", "process", "how", "step"], tag: "METHODOLOGY", color: "#4CC9F0" },
    { keywords: ["type", "class", "category", "form"], tag: "CLASSIFICATION", color: "#B5179E" },
    { keywords: ["example", "instance", "case"], tag: "EXAMPLE", color: "#F72585" },
    { keywords: ["property", "feature", "characteristic"], tag: "PROPERTY", color: "#7209B7" },
    { keywords: ["reaction", "interact", "effect"], tag: "REACTIVITY", color: "#4361EE" },
    { keywords: ["definition", "meaning", "what"], tag: "CONCEPT", color: "#4895EF" },
];

const NODE_WIDTH = 280;

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

function formatPowerNotation(input: string) {
    if (!input) return input;
    return input.replace(/([A-Za-z0-9)\]])\^([0-9+\-]+)/g, (_m, base: string, exp: string) => {
        const map: Record<string, string> = {
            "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
            "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
            "+": "⁺", "-": "⁻",
        };
        return base + exp.split("").map((ch) => map[ch] ?? ch).join("");
    });
}

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

    const ITERATIONS = 120;
    const REPULSION = 1000000;
    const SPRING_K = 0.03;
    const SPRING_LEN = 350;

    for (let i = 0; i < ITERATIONS; i++) {
        for (let j = 0; j < nodes.length; j++) {
            for (let k = j + 1; k < nodes.length; k++) {
                const dx = nodes[j].x - nodes[k].x;
                const dy = nodes[j].y - nodes[k].y;
                const distSq = dx * dx + dy * dy || 1;
                const force = REPULSION / Math.max(distSq, 500);
                const dist = Math.sqrt(distSq);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                nodes[j].vx += fx; nodes[j].vy += fy;
                nodes[k].vx -= fx; nodes[k].vy -= fy;
            }
        }
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

        nodes.forEach(n => {
            n.vx -= n.x * 0.005;
            n.vy -= n.y * 0.005;
            n.vx *= 0.85;
            n.vy *= 0.85;
            n.x += n.vx;
            n.y += n.vy;
        });
    }

    const finalRoot = nodes.find(n => n.id === 'root');
    if (finalRoot) {
        finalRoot.x = 0; finalRoot.y = 0;
    }

    return { nodes, edges };
}


function MindmapViewer({ content }: { content: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [edges, setEdges] = useState<EdgeData[]>([]);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.75 });
    const [isCanvasDragging, setIsCanvasDragging] = useState(false);
    const canvasDragStart = useRef({ x: 0, y: 0 });
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const nodeDragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
    const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        const { nodes: parsedNodes, edges: parsedEdges } = parseToGraph(content);
        setNodes(parsedNodes);
        setEdges(parsedEdges);

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTransform({ x: rect.width / 2, y: rect.height / 2, scale: 0.75 });
        }
    }, [content]);

    const onCanvasPointerDown = useCallback((e: React.PointerEvent) => {
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

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0b0914] select-none rounded-2xl border border-white/[0.05]">
            <div
                className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-75"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
                    backgroundPosition: `${transform.x}px ${transform.y}px`
                }}
            />

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
                    <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                        {edges.map(edge => {
                            const source = nodes.find(n => n.id === edge.sourceId);
                            const target = nodes.find(n => n.id === edge.targetId);
                            if (!source || !target) return null;

                            const isHovered = inspectedNodeId === source.id || inspectedNodeId === target.id;
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
                            );
                        })}
                    </svg>

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
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: node.color, color: node.color }} />
                                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8E82A8] truncate">
                                        {node.tag}
                                    </span>
                                </div>
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

            <AnimatePresence>
                {inspectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mindmap-inspector absolute top-6 right-6 w-80 max-h-[80%] overflow-y-auto bg-[#110D1F]/95 backdrop-blur-xl border border-[#3A2D5C] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] z-50 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


export function MindmapPage({ onNavigateToChat }: MindmapPageProps) {
    const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
    const [view, setView] = useState<ViewState>("list");
    const [activeMindmap, setActiveMindmap] = useState<Mindmap | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
    const [connections, setConnections] = useState<CanvasConnection[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        setMindmaps(getLocalMindmaps());
    }, []);

    const handleStartCreate = () => {
        setEditTitle("");
        setCanvasNodes([
            { id: "root", title: "Central Topic", description: "", x: 400, y: 300, width: 200, height: 100 }
        ]);
        setConnections([]);
        setSelectedNodeId(null);
        setViewportOffset({ x: 0, y: 0 });
        setView("create");
    };

    const handleAddNode = () => {
        const newNode: CanvasNode = {
            id: crypto.randomUUID(),
            title: "New Node",
            description: "",
            x: 400 - viewportOffset.x,
            y: 200 - viewportOffset.y,
            width: 200,
            height: 100
        };
        setCanvasNodes([...canvasNodes, newNode]);
        setSelectedNodeId(newNode.id);
    };

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        if (connectingFrom) return;
        e.stopPropagation();
        e.preventDefault();
        
        const node = canvasNodes.find(n => n.id === nodeId)!;
        setDraggedNodeId(nodeId);
        setSelectedNodeId(nodeId);
        isDraggingRef.current = true;
        
        setDragOffset({
            x: e.clientX - node.x - viewportOffset.x,
            y: e.clientY - node.y - viewportOffset.y
        });
    };

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        
        if (draggedNodeId && isDraggingRef.current) {
            e.preventDefault();
            const newX = e.clientX - dragOffset.x - viewportOffset.x;
            const newY = e.clientY - dragOffset.y - viewportOffset.y;
            
            setCanvasNodes(prev => prev.map(n =>
                n.id === draggedNodeId
                    ? { ...n, x: newX, y: newY }
                    : n
            ));
        } else if (isPanning) {
            e.preventDefault();
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            
            setViewportOffset(prev => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    }, [draggedNodeId, dragOffset, viewportOffset, isPanning, panStart]);

    const handleCanvasMouseUp = useCallback(() => {
        setDraggedNodeId(null);
        setIsPanning(false);
        isDraggingRef.current = false;
    }, []);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setSelectedNodeId(null);
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleUpdateNode = (nodeId: string, field: "title" | "description", value: string) => {
        setCanvasNodes(canvasNodes.map(node =>
            node.id === nodeId ? { ...node, [field]: value } : node
        ));
    };

    const handleDeleteNode = (nodeId: string) => {
        setCanvasNodes(canvasNodes.filter(n => n.id !== nodeId));
        setConnections(connections.filter(c => c.fromId !== nodeId && c.toId !== nodeId));
        setSelectedNodeId(null);
    };

    const handleStartConnection = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (connectingFrom === nodeId) {
            setConnectingFrom(null);
        } else {
            setConnectingFrom(nodeId);
        }
    };

    const handleCompleteConnection = (e: React.MouseEvent, toNodeId: string) => {
        e.stopPropagation();
        if (connectingFrom && connectingFrom !== toNodeId) {
            const existingConnection = connections.find(
                c => (c.fromId === connectingFrom && c.toId === toNodeId) ||
                     (c.fromId === toNodeId && c.toId === connectingFrom)
            );
            
            if (!existingConnection) {
                const newConnection: CanvasConnection = {
                    id: crypto.randomUUID(),
                    fromId: connectingFrom,
                    toId: toNodeId
                };
                setConnections([...connections, newConnection]);
            }
        }
        setConnectingFrom(null);
    };

    const convertCanvasToMarkdown = (): string => {
        if (canvasNodes.length === 0) return "";
        
        const root = canvasNodes[0];
        let markdown = `# ${root.title}\n\n`;

        const buildTree = (nodeId: string, visited: Set<string> = new Set(), indent: number = 0): string => {
            if (visited.has(nodeId)) return "";
            visited.add(nodeId);

            const childConnections = connections.filter(c => c.fromId === nodeId);
            let result = "";

            childConnections.forEach(conn => {
                const childNode = canvasNodes.find(n => n.id === conn.toId);
                if (childNode) {
                    const indentStr = "  ".repeat(indent);
                    const desc = childNode.description ? ` - ${childNode.description}` : "";
                    result += `${indentStr}- ${childNode.title}${desc}\n`;
                    result += buildTree(childNode.id, visited, indent + 1);
                }
            });

            return result;
        };

        markdown += buildTree(root.id);
        return markdown;
    };

    const handleSaveMindmap = () => {
        if (!editTitle.trim()) {
            alert("Please enter a mindmap title.");
            return;
        }

        const markdown = convertCanvasToMarkdown();
        const newMindmap: Mindmap = {
            id: crypto.randomUUID(),
            title: editTitle.trim(),
            content: { markdown },
            created_at: new Date().toISOString(),
        };

        const newMindmapsList = [newMindmap, ...mindmaps];
        saveLocalMindmaps(newMindmapsList);
        setMindmaps(newMindmapsList);
        setView("list");
    };

    const handleDeleteMindmap = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this mindmap?")) return;

        const newMindmapsList = mindmaps.filter((m) => m.id !== id);
        saveLocalMindmaps(newMindmapsList);
        setMindmaps(newMindmapsList);
    };

    const openViewMindmap = (mindmap: Mindmap) => {
        setActiveMindmap(mindmap);
        setView("view");
    };

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10 text-white">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {view === "list" && (
                <div className="flex items-end justify-between mb-10 relative z-20">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95">
                            Mindmaps
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onNavigateToChat}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium transition-all"
                        >
                            <Sparkles className="w-4 h-4 text-fuchsia-400" />
                            Generate with AI
                        </button>
                        <button
                            onClick={handleStartCreate}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white text-sm font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] hover:shadow-[0_0_30px_rgba(247,37,133,0.5)] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Mindmap
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {view === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full flex-1"
                    >
                        {mindmaps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="w-20 h-20 rounded-full bg-white/[0.05] flex items-center justify-center mb-6">
                                    <Network className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white/90 mb-2">No mindmaps yet</h3>
                                <p className="text-white/40 max-w-sm mb-8">
                                    Create your first mindmap manually or ask the AI Study Buddy to generate one.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleStartCreate}
                                        className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all font-medium"
                                    >
                                        Create Manually
                                    </button>
                                    <button
                                        onClick={onNavigateToChat}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)]"
                                    >
                                        Generate with AI
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {mindmaps.map((mindmap, i) => (
                                    <motion.div
                                        key={mindmap.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => openViewMindmap(mindmap)}
                                        className="group relative flex flex-col p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-violet-500/10"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/0 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                <Network className="w-5 h-5 text-white/70" />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteMindmap(mindmap.id, e)}
                                                className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white/95 mb-2 line-clamp-2">
                                            {mindmap.title}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between text-sm">
                                            <span className="text-white/40">Interactive map</span>
                                            <span className="text-xs font-medium text-white/30 bg-white/[0.05] px-2.5 py-1 rounded-md">
                                                {new Date(mindmap.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {view === "create" && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-white/[0.06]">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>

                            <div className="flex-1 max-w-md mx-8">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Mindmap Title..."
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-lg font-bold text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleAddNode}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-white transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Node
                                </button>
                                <button
                                    onClick={handleSaveMindmap}
                                    disabled={!editTitle.trim()}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex min-h-0">
                            <div
                                ref={canvasRef}
                                className={cn(
                                    "flex-1 relative bg-[#0a0a0f] overflow-hidden select-none",
                                    isPanning ? "cursor-grabbing" : "cursor-grab"
                                )}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
                                    backgroundSize: '30px 30px',
                                    backgroundPosition: `${viewportOffset.x}px ${viewportOffset.y}px`
                                }}
                            >
                                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                                    {connections.map(conn => {
                                        const fromNode = canvasNodes.find(n => n.id === conn.fromId);
                                        const toNode = canvasNodes.find(n => n.id === conn.toId);
                                        if (!fromNode || !toNode) return null;

                                        const x1 = fromNode.x + fromNode.width / 2 + viewportOffset.x;
                                        const y1 = fromNode.y + fromNode.height / 2 + viewportOffset.y;
                                        const x2 = toNode.x + toNode.width / 2 + viewportOffset.x;
                                        const y2 = toNode.y + toNode.height / 2 + viewportOffset.y;

                                        const isSelected = selectedNodeId === conn.fromId || selectedNodeId === conn.toId;

                                        return (
                                            <g key={conn.id}>
                                                <line
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke={isSelected ? "#B5179E" : "#7209B7"}
                                                    strokeWidth={isSelected ? "3" : "2"}
                                                    strokeLinecap="round"
                                                    opacity={isSelected ? "0.8" : "0.5"}
                                                />
                                                <circle
                                                    cx={x1}
                                                    cy={y1}
                                                    r="4"
                                                    fill="#7209B7"
                                                    opacity="0.8"
                                                />
                                                <circle
                                                    cx={x2}
                                                    cy={y2}
                                                    r="4"
                                                    fill="#7209B7"
                                                    opacity="0.8"
                                                />
                                            </g>
                                        );
                                    })}
                                    
                                    {connectingFrom && (() => {
                                        const fromNode = canvasNodes.find(n => n.id === connectingFrom);
                                        if (!fromNode) return null;
                                        
                                        const x1 = fromNode.x + fromNode.width / 2 + viewportOffset.x;
                                        const y1 = fromNode.y + fromNode.height / 2 + viewportOffset.y;
                                        
                                        return (
                                            <g>
                                                <line
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={mousePos.x}
                                                    y2={mousePos.y}
                                                    stroke="#F72585"
                                                    strokeWidth="2"
                                                    strokeDasharray="8,4"
                                                    strokeLinecap="round"
                                                    opacity="0.8"
                                                />
                                                <circle
                                                    cx={x1}
                                                    cy={y1}
                                                    r="6"
                                                    fill="#F72585"
                                                    opacity="0.8"
                                                />
                                                <circle
                                                    cx={mousePos.x}
                                                    cy={mousePos.y}
                                                    r="4"
                                                    fill="#F72585"
                                                    opacity="0.6"
                                                />
                                            </g>
                                        );
                                    })()}
                                </svg>

                                {canvasNodes.map(node => {
                                    const isConnecting = connectingFrom === node.id;
                                    const canConnect = connectingFrom && connectingFrom !== node.id;
                                    
                                    return (
                                    <div
                                        key={node.id}
                                        className={cn(
                                            "absolute rounded-2xl border-2 bg-[#110D1F] backdrop-blur-xl cursor-move select-none",
                                            selectedNodeId === node.id
                                                ? "border-[#7209B7] shadow-[0_0_30px_rgba(114,9,183,0.4)] z-20"
                                                : "border-white/[0.1] hover:border-white/[0.2] z-10",
                                            draggedNodeId === node.id ? "cursor-grabbing shadow-2xl scale-105" : "transition-transform duration-75",
                                            isConnecting && "border-[#F72585] shadow-[0_0_30px_rgba(247,37,133,0.6)] ring-2 ring-[#F72585]/30",
                                            canConnect && "border-emerald-500/50 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        )}
                                        style={{
                                            left: node.x + viewportOffset.x,
                                            top: node.y + viewportOffset.y,
                                            width: node.width,
                                            minHeight: node.height,
                                            willChange: draggedNodeId === node.id ? 'transform' : 'auto'
                                        }}
                                        onMouseDown={(e) => {
                                            if (canConnect) {
                                                handleCompleteConnection(e, node.id);
                                            } else {
                                                handleNodeMouseDown(e, node.id);
                                            }
                                        }}
                                    >
                                        <div className="p-4 flex flex-col h-full pointer-events-auto">
                                            <input
                                                type="text"
                                                value={node.title}
                                                onChange={(e) => handleUpdateNode(node.id, "title", e.target.value)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full bg-transparent border-none text-white font-bold text-sm focus:outline-none mb-2 cursor-text"
                                                placeholder="Node title..."
                                            />
                                            <textarea
                                                value={node.description}
                                                onChange={(e) => handleUpdateNode(node.id, "description", e.target.value)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full flex-1 bg-transparent border-none text-white/60 text-xs resize-none focus:outline-none cursor-text"
                                                placeholder="Description..."
                                            />
                                        </div>

                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                            <button
                                                onClick={(e) => handleStartConnection(e, node.id)}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className={cn(
                                                    "p-2 rounded-full text-xs font-bold transition-all shadow-lg",
                                                    isConnecting
                                                        ? "bg-rose-500 text-white hover:bg-rose-600 scale-110"
                                                        : "bg-[#7209B7] text-white hover:bg-[#B5179E] hover:scale-110"
                                                )}
                                                title={isConnecting ? "Cancel connection" : "Connect to another node"}
                                            >
                                                {isConnecting ? (
                                                    <X className="w-3 h-3" />
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )})}

                                {connectingFrom && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3 rounded-xl text-sm font-medium shadow-2xl z-50 flex items-center gap-3"
                                    >
                                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span>Click another node to connect</span>
                                        <button
                                            onClick={() => setConnectingFrom(null)}
                                            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            {selectedNodeId && (
                                <div className="w-80 border-l border-white/[0.06] bg-[#0d0d12]/95 backdrop-blur-xl p-6 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Node Properties</h3>
                                        <button
                                            onClick={() => handleDeleteNode(selectedNodeId)}
                                            className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={canvasNodes.find(n => n.id === selectedNodeId)?.title || ""}
                                                onChange={(e) => handleUpdateNode(selectedNodeId, "title", e.target.value)}
                                                className="w-full rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={canvasNodes.find(n => n.id === selectedNodeId)?.description || ""}
                                                onChange={(e) => handleUpdateNode(selectedNodeId, "description", e.target.value)}
                                                className="w-full h-32 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-white/[0.06]">
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
                                                Quick Actions
                                            </div>
                                            <button
                                                onClick={(e) => handleStartConnection(e, selectedNodeId)}
                                                className={cn(
                                                    "w-full py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                    connectingFrom === selectedNodeId
                                                        ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                                                        : "bg-[#7209B7]/20 hover:bg-[#7209B7]/30 border-[#7209B7]/50 text-white"
                                                )}
                                            >
                                                {connectingFrom === selectedNodeId ? (
                                                    <>
                                                        <X className="w-4 h-4" />
                                                        Cancel Connection
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                        Connect to Node
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="pt-4 border-t border-white/[0.06]">
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                                Connections
                                            </div>
                                            <div className="space-y-1 text-xs text-white/60">
                                                {connections.filter(c => c.fromId === selectedNodeId || c.toId === selectedNodeId).length === 0 ? (
                                                    <div className="text-white/30 italic">No connections</div>
                                                ) : (
                                                    connections
                                                        .filter(c => c.fromId === selectedNodeId || c.toId === selectedNodeId)
                                                        .map(conn => {
                                                            const otherNodeId = conn.fromId === selectedNodeId ? conn.toId : conn.fromId;
                                                            const otherNode = canvasNodes.find(n => n.id === otherNodeId);
                                                            return (
                                                                <div key={conn.id} className="flex items-center justify-between p-2 rounded bg-white/[0.03]">
                                                                    <span>{otherNode?.title || "Unknown"}</span>
                                                                    <button
                                                                        onClick={() => setConnections(connections.filter(c => c.id !== conn.id))}
                                                                        className="text-rose-400 hover:text-rose-300"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {view === "view" && activeMindmap && (
                    <motion.div
                        key="view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
                            </button>
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-white">{activeMindmap.title}</h2>
                            </div>
                            <div className="w-36" />
                        </div>

                        <div className="flex-1 min-h-0">
                            <MindmapViewer content={activeMindmap.content.markdown} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
