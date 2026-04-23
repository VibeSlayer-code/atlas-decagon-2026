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
    X,
    Link2
} from "lucide-react";
import { cn } from "@/lib/utils";


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

type Mindmap = {
    id: string;
    title: string;
    content: {
        markdown?: string;
        nodes?: CanvasNode[];
        connections?: CanvasConnection[];
    };
    created_at: string;
};

type ViewState = "list" | "editor";

interface MindmapPageProps {
    onNavigateToChat: () => void;
}

const LOCAL_STORAGE_KEY = "atlas_hackathon_mindmaps";

const parseMarkdownToNodes = (markdown: string): { nodes: CanvasNode[], connections: CanvasConnection[] } => {
    const nodes: CanvasNode[] = [];
    const connections: CanvasConnection[] = [];
    const lines = markdown.split('\n');
    
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const rootTitle = titleMatch ? titleMatch[1].trim() : 'Central Topic';
    
    const rootNode: CanvasNode = {
        id: 'root',
        title: rootTitle,
        description: '',
        x: 400,
        y: 300,
        width: NODE_WIDTH,
        height: 100
    };
    nodes.push(rootNode);
    
    const stack: { node: CanvasNode; indent: number }[] = [{ node: rootNode, indent: -1 }];
    let nodeCounter = 0;
    
    lines.forEach(line => {
        if (line.trim() === '' || line.startsWith('#')) return;
        
        const match = line.match(/^(\s*)[-*]\s+(.+)$/);
        if (match) {
            const indent = match[1].length;
            let rawText = match[2].trim();
            
            let title = rawText.replace(/\*\*/g, '').trim();
            let description = "";
            
            const splitMatch = rawText.match(/^(.*?)(?:[:\-]|\s-\s)(.*)$/);
            if (splitMatch && splitMatch[1].length < 60) {
                title = splitMatch[1].replace(/\*\*/g, '').trim();
                description = splitMatch[2].replace(/\*\*/g, '').trim();
            }
            
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            
            const parent = stack[stack.length - 1].node;
            const childrenCount = connections.filter(c => c.fromId === parent.id).length;
            
            const ySpacing = 140;
            const xSpacing = 340;
            let multiplier = 0;
            if (childrenCount > 0) {
                multiplier = Math.ceil(childrenCount / 2) * (childrenCount % 2 === 0 ? 1 : -1);
            }
            
            const newNode: CanvasNode = {
                id: `node-${nodeCounter++}`,
                title: title,
                description: description,
                x: parent.x + xSpacing,
                y: parent.y + (multiplier * ySpacing),
                width: NODE_WIDTH,
                height: 100
            };
            
            nodes.push(newNode);
            connections.push({
                id: `conn-${parent.id}-${newNode.id}`,
                fromId: parent.id,
                toId: newNode.id
            });
            
            stack.push({ node: newNode, indent });
        }
    });
    
    return { nodes, connections };
};

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


const NODE_WIDTH = 280;

export function MindmapPage({ onNavigateToChat }: MindmapPageProps) {
    const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
    const [view, setView] = useState<ViewState>("list");

    
    const [activeMindmapId, setActiveMindmapId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
    const [connections, setConnections] = useState<CanvasConnection[]>([]);

    
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

    
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false); 

    
    const isPanningRef = useRef(false);
    const isDraggingRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMindmaps(getLocalMindmaps());
    }, []);

    
    const handleCanvasMouseUp = useCallback(() => {
        setDraggedNodeId(null);
        setIsPanning(false);
        isPanningRef.current = false;
        setConnectingFrom(null);
        isDraggingRef.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener("mouseup", handleCanvasMouseUp);
        return () => window.removeEventListener("mouseup", handleCanvasMouseUp);
    }, [handleCanvasMouseUp]);

    const handleStartCreate = () => {
        setActiveMindmapId(null);
        setEditTitle("");
        setCanvasNodes([
            { id: "root", title: "Central Topic", description: "", x: 400, y: 300, width: NODE_WIDTH, height: 100 }
        ]);
        setConnections([]);
        setSelectedNodeId(null);
        setTransform({ x: 0, y: 0, scale: 1 });
        setView("editor");
    };

    const openEditor = (mindmap: Mindmap) => {
        setActiveMindmapId(mindmap.id);
        setEditTitle(mindmap.title);
        
        if (mindmap.content.markdown) {
            const parsedNodes = parseMarkdownToNodes(mindmap.content.markdown);
            setCanvasNodes(parsedNodes.nodes);
            setConnections(parsedNodes.connections);
        } else {
            setCanvasNodes(mindmap.content.nodes || []);
            setConnections(mindmap.content.connections || []);
        }
        
        setSelectedNodeId(null);
        setTransform({ x: 0, y: 0, scale: 1 });
        setView("editor");
    };

    const handleAddNode = () => {
        const newNode: CanvasNode = {
            id: crypto.randomUUID(),
            title: "New Node",
            description: "",
            x: (window.innerWidth / 2 - transform.x) / transform.scale - (NODE_WIDTH / 2),
            y: (window.innerHeight / 3 - transform.y) / transform.scale,
            width: NODE_WIDTH,
            height: 100
        };
        setCanvasNodes([...canvasNodes, newNode]);
        setSelectedNodeId(newNode.id);
    };

    const handleQuickAddChild = (e: React.MouseEvent, parentId: string) => {
        e.stopPropagation();
        e.preventDefault();

        const parent = canvasNodes.find(n => n.id === parentId);
        if (!parent) return;

        const childrenCount = connections.filter(c => c.fromId === parentId).length;
        const ySpacing = 140;
        const xSpacing = 340;

        let multiplier = 0;
        if (childrenCount > 0) {
            multiplier = Math.ceil(childrenCount / 2) * (childrenCount % 2 === 0 ? 1 : -1);
        }

        const newNode: CanvasNode = {
            id: crypto.randomUUID(),
            title: "New Node",
            description: "",
            x: parent.x + xSpacing,
            y: parent.y + (multiplier * ySpacing),
            width: NODE_WIDTH,
            height: 100
        };

        const newConnection: CanvasConnection = {
            id: crypto.randomUUID(),
            fromId: parentId,
            toId: newNode.id
        };

        setCanvasNodes([...canvasNodes, newNode]);
        setConnections([...connections, newConnection]);
        setSelectedNodeId(newNode.id);
    };

    const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
        if (connectingFrom) return;
        e.stopPropagation();

        const node = canvasNodes.find(n => n.id === nodeId)!;
        setDraggedNodeId(nodeId);
        setSelectedNodeId(nodeId);
        isDraggingRef.current = true;

        dragOffsetRef.current = {
            x: e.clientX - node.x * transform.scale - transform.x,
            y: e.clientY - node.y * transform.scale - transform.y
        };
    };

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }

        if (draggedNodeId && isDraggingRef.current) {
            const newX = (e.clientX - dragOffsetRef.current.x - transform.x) / transform.scale;
            const newY = (e.clientY - dragOffsetRef.current.y - transform.y) / transform.scale;

            setCanvasNodes(prev => prev.map(n =>
                n.id === draggedNodeId ? { ...n, x: newX, y: newY } : n
            ));
        } else if (isPanningRef.current) {
            setTransform(prev => ({
                ...prev,
                x: prev.x + (e.clientX - panStartRef.current.x),
                y: prev.y + (e.clientY - panStartRef.current.y)
            }));
            panStartRef.current = { x: e.clientX, y: e.clientY };
        }
    }, [draggedNodeId, transform.x, transform.y, transform.scale]);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        
        
        if (e.button === 1) e.preventDefault();
        if (e.button !== 0 && e.button !== 1) return; 

        setSelectedNodeId(null);
        setIsPanning(true);
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
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

    const handleLinkDragStart = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setConnectingFrom(nodeId);
    };

    const handleNodeMouseUp = (e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (connectingFrom && connectingFrom !== nodeId) {
            const exists = connections.find(c =>
                (c.fromId === connectingFrom && c.toId === nodeId) ||
                (c.fromId === nodeId && c.toId === connectingFrom)
            );

            if (!exists) {
                setConnections([...connections, {
                    id: crypto.randomUUID(),
                    fromId: connectingFrom,
                    toId: nodeId
                }]);
            }
        }
        setConnectingFrom(null);
        setDraggedNodeId(null);
        isDraggingRef.current = false;
    };

    const handleSaveMindmap = () => {
        if (!editTitle.trim()) {
            alert("Please enter a mindmap title.");
            return;
        }

        const newMindmap: Mindmap = {
            id: activeMindmapId || crypto.randomUUID(),
            title: editTitle.trim(),
            content: { nodes: canvasNodes, connections },
            created_at: new Date().toISOString(),
        };

        let newMindmapsList = [...mindmaps];
        if (activeMindmapId) {
            newMindmapsList = newMindmapsList.map(m => m.id === activeMindmapId ? newMindmap : m);
        } else {
            newMindmapsList = [newMindmap, ...newMindmapsList];
        }

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

    const handleWheel = (e: React.WheelEvent) => {
        if (!canvasRef.current) return;
        e.preventDefault();

        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = -e.deltaY * 0.001;
        const newScale = Math.min(Math.max(0.2, transform.scale + zoomFactor), 2);

        const worldX = (mouseX - transform.x) / transform.scale;
        const worldY = (mouseY - transform.y) / transform.scale;

        const newX = mouseX - worldX * newScale;
        const newY = mouseY - worldY * newScale;

        setTransform({ x: newX, y: newY, scale: newScale });
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
                                    Create your first mindmap manually or ask the AI to generate one.
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
                                        onClick={() => openEditor(mindmap)}
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
                                            <span className="text-white/40">
                                                {mindmap.content.nodes?.length || (mindmap.content.markdown ? 'AI Generated' : 0)} 
                                                {mindmap.content.nodes ? ' Nodes' : ''}
                                            </span>
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

                {view === "editor" && (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="w-full h-full flex flex-col -m-8"
                    >
                        <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0b0914]/80 backdrop-blur-md z-50">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
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
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium text-white transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Node
                                </button>
                                <button
                                    onClick={handleSaveMindmap}
                                    disabled={!editTitle.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex min-h-0 relative">
                            <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2 bg-[#161224]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
                                <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.2, t.scale - 0.1) }))} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"><ZoomOut className="w-4 h-4" /></button>
                                <div className="text-[10px] font-medium text-white/40 w-8 text-center">{Math.round(transform.scale * 100)}%</div>
                                <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(2, t.scale + 0.1) }))} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"><ZoomIn className="w-4 h-4" /></button>
                                <div className="w-px h-4 bg-white/10 mx-1" />
                                <button
                                    onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                >
                                    <Target className="w-4 h-4" />
                                </button>
                            </div>

                            <div
                                ref={canvasRef}
                                className={cn(
                                    "flex-1 relative bg-[#0a0a0f] overflow-hidden select-none touch-none",
                                    isPanning ? "cursor-grabbing" : "cursor-grab"
                                )}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onWheel={handleWheel}
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
                                    backgroundSize: `${30 * transform.scale}px ${30 * transform.scale}px`,
                                    backgroundPosition: `${transform.x}px ${transform.y}px`
                                }}
                            >
                                <div
                                    style={{
                                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                                        transformOrigin: '0 0',
                                    }}
                                >
                                    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        {connections.map(conn => {
                                            const fromNode = canvasNodes.find(n => n.id === conn.fromId);
                                            const toNode = canvasNodes.find(n => n.id === conn.toId);
                                            if (!fromNode || !toNode) return null;

                                            const x1 = fromNode.x + fromNode.width / 2;
                                            const y1 = fromNode.y + fromNode.height / 2;
                                            const x2 = toNode.x + toNode.width / 2;
                                            const y2 = toNode.y + toNode.height / 2;

                                            return (
                                                <line key={conn.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7209B7" strokeWidth="2" opacity="0.5" />
                                            );
                                        })}

                                        {connectingFrom && (() => {
                                            const fromNode = canvasNodes.find(n => n.id === connectingFrom);
                                            if (!fromNode) return null;

                                            const x1 = fromNode.x + fromNode.width / 2;
                                            const y1 = fromNode.y + fromNode.height / 2;
                                            const targetNode = canvasNodes.find(n => n.id === hoveredNodeId);
                                            const endX = targetNode ? targetNode.x + targetNode.width / 2 : (mousePos.x - transform.x) / transform.scale;
                                            const endY = targetNode ? targetNode.y + targetNode.height / 2 : (mousePos.y - transform.y) / transform.scale;

                                            return <line x1={x1} y1={y1} x2={endX} y2={endY} stroke="#F72585" strokeWidth="3" strokeDasharray="8,4" strokeLinecap="round" />;
                                        })()}
                                    </svg>

                                    {canvasNodes.map(node => (
                                        <div
                                            key={node.id}
                                            className={cn(
                                                "group absolute rounded-2xl border-2 bg-[#110D1F]/90 backdrop-blur-xl select-none",
                                                selectedNodeId === node.id ? "border-[#7209B7] shadow-[0_0_30px_rgba(114,9,183,0.4)] z-20" : "border-white/[0.1] z-10",
                                                draggedNodeId === node.id ? "cursor-grabbing shadow-2xl scale-105" : "cursor-grab transition-transform duration-75",
                                                connectingFrom && connectingFrom !== node.id && hoveredNodeId === node.id && "border-fuchsia-500 scale-[1.03]"
                                            )}
                                            style={{ left: node.x, top: node.y, width: node.width, minHeight: node.height }}
                                            onMouseEnter={() => setHoveredNodeId(node.id)}
                                            onMouseLeave={() => setHoveredNodeId(null)}
                                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                            onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
                                        >
                                            <div className="p-4 flex flex-col h-full pointer-events-auto">
                                                <input value={node.title} onChange={(e) => handleUpdateNode(node.id, "title", e.target.value)} onMouseDown={(e) => e.stopPropagation()} className="w-full bg-transparent border-none text-white font-bold text-sm focus:outline-none mb-2 cursor-text" placeholder="Node title..." />
                                                <textarea value={node.description} onChange={(e) => handleUpdateNode(node.id, "description", e.target.value)} onMouseDown={(e) => e.stopPropagation()} className="w-full flex-1 bg-transparent border-none text-white/60 text-xs resize-none focus:outline-none cursor-text" placeholder="Description..." />
                                            </div>

                                            <div className={cn("absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50 transition-all duration-200 pointer-events-auto", "opacity-0 group-hover:opacity-100 focus-within:opacity-100", selectedNodeId === node.id && "opacity-100")}>
                                                <button onMouseDown={(e) => handleLinkDragStart(e, node.id)} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-[#7209B7] hover:text-white hover:scale-110 transition-all shadow-lg" title="Drag to connect">
                                                    <Link2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={(e) => handleQuickAddChild(e, node.id)} onMouseDown={(e) => e.stopPropagation()} className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-[#7209B7] hover:text-white hover:scale-110 transition-all shadow-lg" title="Quick add child node">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedNodeId && (
                                <div className="w-80 border-l border-white/[0.06] bg-[#0d0d12]/95 backdrop-blur-xl p-6 overflow-y-auto relative z-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest">Node Properties</h3>
                                        <button onClick={() => handleDeleteNode(selectedNodeId)} className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Title</label>
                                            <input type="text" value={canvasNodes.find(n => n.id === selectedNodeId)?.title || ""} onChange={(e) => handleUpdateNode(selectedNodeId, "title", e.target.value)} className="w-full rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Description</label>
                                            <textarea value={canvasNodes.find(n => n.id === selectedNodeId)?.description || ""} onChange={(e) => handleUpdateNode(selectedNodeId, "description", e.target.value)} className="w-full h-32 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors" />
                                        </div>
                                        <div className="pt-4 border-t border-white/[0.06]">
                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Connections</div>
                                            <div className="space-y-1 text-xs text-white/60">
                                                {connections.filter(c => c.fromId === selectedNodeId || c.toId === selectedNodeId).length === 0 ? (
                                                    <div className="text-white/30 italic">No connections</div>
                                                ) : (
                                                    connections.filter(c => c.fromId === selectedNodeId || c.toId === selectedNodeId).map(conn => {
                                                        const otherNodeId = conn.fromId === selectedNodeId ? conn.toId : conn.fromId;
                                                        const otherNode = canvasNodes.find(n => n.id === otherNodeId);
                                                        return (
                                                            <div key={conn.id} className="flex items-center justify-between p-2 rounded bg-white/[0.03]">
                                                                <span className="truncate pr-2">{otherNode?.title || "Unknown"}</span>
                                                                <button onClick={() => setConnections(connections.filter(c => c.id !== conn.id))} className="text-rose-400 hover:text-rose-300 shrink-0"><X className="w-3 h-3" /></button>
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
            </AnimatePresence>
        </div>
    );
}