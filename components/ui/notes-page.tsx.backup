"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Sparkles,
    ArrowLeft,
    Trash2,
    FileText,
    Save,
    Edit
} from "lucide-react";

// --- Type Definitions ---
type Note = {
    id: string;
    title: string;
    content: { markdown: string };
    created_at: string;
};

type ViewState = "list" | "editor" | "view";

interface NotesPageProps {
    onNavigateToChat: () => void;
}

const LOCAL_STORAGE_KEY = "atlas_hackathon_notes";

// --- Pure Local Storage Helpers ---
const getLocalNotes = (): Note[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalNotes = (notes: Note[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
};
// --------------------------------------------------------

// --- Markdown Formatter (with table support) ---
function formatPowerNotation(input: string) {
    if (!input) return input;
    return input.replace(/([A-Za-z0-9)\]])\^([0-9+\-]+)/g, (_m, base: string, exp: string) => {
        return `${base}${toSuperscript(exp)}`;
    });
}

function toSuperscript(exp: string) {
    const map: Record<string, string> = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
        "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "+": "⁺", "-": "⁻",
    };
    return exp.split("").map((ch) => map[ch] ?? ch).join("");
}

function formatMarkdown(text: string) {
    if (!text) return null;
    text = formatPowerNotation(text);

    let html = text;

    // Process tables
    html = html.replace(/(?:^|\r?\n)([ \t]*\|.*\|[ \t]*(?:\r?\n[ \t]*\|.*\|[ \t]*)+)/g, (match, tableBlock) => {
        const lines = tableBlock.trim().split(/\r?\n/);
        let htmlTable = '<div class="overflow-x-auto my-6 border border-white/10 rounded-xl bg-white/[0.01] shadow-sm"><table class="w-full text-left text-sm text-white/80 m-0"><thead class="bg-white/[0.04] text-white/90 border-b border-white/10">';
        let isHeader = true;
        let hasBody = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (isHeader && /^[\|\-\s\:]+$/.test(line) && line.includes('-')) {
                isHeader = false;
                hasBody = true;
                htmlTable += '</thead><tbody class="divide-y divide-white/5">';
                continue;
            }

            const cells = line.split('|').map(c => c.trim());
            if (cells[0] === '') cells.shift();
            if (cells[cells.length - 1] === '') cells.pop();

            if (cells.length === 0) continue;

            htmlTable += '<tr class="hover:bg-white/[0.02] transition-colors">';
            for (const cell of cells) {
                htmlTable += isHeader ? `<th class="px-4 py-3 font-medium text-white">${cell}</th>` : `<td class="px-4 py-3">${cell}</td>`;
            }
            htmlTable += '</tr>';
        }
        if (!hasBody) htmlTable += '</thead><tbody>';
        htmlTable += '</tbody></table></div>';
        return htmlTable;
    });

    html = html
        .replace(/^([A-Za-z0-9 ]+)\r?\n={2,}/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-white border-b border-white/10 pb-2">$1</h1>')
        .replace(/^([A-Za-z0-9 ]+)\r?\n-{2,}/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-white">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-white border-b border-white/10 pb-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-white">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-5 mb-2 text-[#F72585]">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        .replace(/^\s*[\-\*]\s+(.*)$/gim, '<li class="ml-6 list-disc mb-1.5 text-white/80">$1</li>')
        .replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-6 list-decimal mb-1.5 text-white/80">$1</li>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 border border-white/10 rounded text-xs text-[#4CC9F0]">$1</code>')
        .replace(/^> (.*)$/gim, '<blockquote class="border-l-4 border-[#7209B7] bg-[#7209B7]/10 pl-4 py-2 my-4 text-white/80 italic">$1</blockquote>');

    html = html
        .replace(/\n/g, "<br/>")
        .replace(/(<br\/>)+<li/g, "<ul class='my-2'><li")
        .replace(/<\/li>(<br\/>)+/g, "</li></ul>")
        .replace(/<br\/>/g, '<div class="h-1.5"></div>');

    return <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}
// ---------------------------------------------------------------


export function NotesPage({ onNavigateToChat }: NotesPageProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [view, setView] = useState<ViewState>("list");

    const [activeNote, setActiveNote] = useState<Note | null>(null);

    // Editor states
    const [editId, setEditId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    // Load data instantly on mount
    useEffect(() => {
        setNotes(getLocalNotes());
    }, []);

    const handleStartCreate = () => {
        setEditId(null);
        setEditTitle("");
        setEditContent("");
        setView("editor");
    };

    const handleStartEdit = (note: Note) => {
        setEditId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content.markdown);
        setActiveNote(note);
        setView("editor");
    }

    const handleSaveNote = () => {
        if (!editTitle.trim()) {
            alert("Please enter a note title.");
            return;
        }

        const isUpdating = !!editId;
        const noteData: Note = {
            id: isUpdating && editId ? editId : crypto.randomUUID(),
            title: editTitle.trim(),
            content: { markdown: editContent },
            created_at: isUpdating && activeNote ? activeNote.created_at : new Date().toISOString(),
        };

        let newNotesList = [...notes];
        if (isUpdating) {
            newNotesList = notes.map(n => n.id === noteData.id ? noteData : n);
        } else {
            newNotesList = [noteData, ...notes];
        }

        // Keep sorted by date
        newNotesList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        saveLocalNotes(newNotesList);
        setNotes(newNotesList);
        setActiveNote(noteData);
        setView(isUpdating ? "view" : "list");
    };

    const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this note?")) return;

        const newNotes = notes.filter((n) => n.id !== id);
        saveLocalNotes(newNotes);
        setNotes(newNotes);

        if (activeNote?.id === id) {
            setView("list");
        }
    };

    const handleViewNote = (note: Note) => {
        setActiveNote(note);
        setView("view");
    };

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto[&::-webkit-scrollbar]:hidden relative z-10 text-white">
            {/* Background ambient glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* HEADER for List View */}
            {view === "list" && (
                <div className="flex items-end justify-between mb-10 relative z-20">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95">Notes</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onNavigateToChat} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-medium transition-all">
                            <Sparkles className="w-4 h-4 text-fuchsia-400" />
                            Generate with AI
                        </button>
                        <button onClick={handleStartCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white text-sm font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] hover:shadow-[0_0_30px_rgba(247,37,133,0.5)] transition-all">
                            <Plus className="w-4 h-4" />
                            New Note
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {/* ---- LIST VIEW ---- */}
                {view === "list" && (
                    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full flex-1">
                        {notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="w-20 h-20 rounded-full bg-white/[0.05] flex items-center justify-center mb-6"><FileText className="w-10 h-10 text-white/20" /></div>
                                <h3 className="text-xl font-bold text-white/90 mb-2">No notes yet</h3>
                                <p className="text-white/40 max-w-sm mb-8">Create your first note manually or ask the AI Study Buddy to generate one.</p>
                                <div className="flex gap-4">
                                    <button onClick={handleStartCreate} className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all font-medium">Create Manually</button>
                                    <button onClick={onNavigateToChat} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)]">Generate with AI</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {notes.map((note, i) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleViewNote(note)}
                                        className="group relative flex flex-col p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-violet-500/10 h-64"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/0 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-white/70" />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteNote(note.id, e)}
                                                className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white/95 mb-2 line-clamp-2">{note.title}</h3>

                                        <div className="text-sm text-white/40 line-clamp-3 mb-4 flex-1">
                                            {note.content.markdown.replace(/[#*>_`~-]/g, '').trim()}
                                        </div>

                                        <div className="mt-auto flex items-center justify-between text-sm">
                                            <span className="text-xs font-medium text-white/30 bg-white/[0.05] px-2.5 py-1 rounded-md">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ---- EDITOR VIEW ---- */}
                {view === "editor" && (
                    <motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto w-full pb-20">
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => setView(editId ? "view" : "list")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                {editId ? "Cancel Edit" : "Back to Library"}
                            </button>
                            <button onClick={handleSaveNote} disabled={!editTitle.trim()} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save className="w-4 h-4" />
                                Save Note
                            </button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 mb-6 backdrop-blur-xl">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Note Title"
                                className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 px-0"
                            />
                        </div>

                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="# Start writing your note here...\n\nYou can use Markdown for **bold text**, lists, tables, etc."
                            className="w-full min-h-[500px] resize-y rounded-3xl bg-white/[0.02] border border-white/[0.06] p-8 text-[15px] leading-relaxed text-white/90 focus:border-violet-500/50 outline-none transition-colors font-mono shadow-inner"
                        />
                    </motion.div>
                )}

                {/* ---- NOTE VIEW ---- */}
                {view === "view" && activeNote && (
                    <motion.div key="view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto w-full pb-20">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0b0914]/80 backdrop-blur-xl py-4 z-50 border-b border-white/[0.05]">
                            <button onClick={() => setView("list")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
                            </button>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleDeleteNote(activeNote.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-sm font-medium">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                                <button onClick={() => handleStartEdit(activeNote)} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-medium text-sm transition-all">
                                    <Edit className="w-4 h-4" />
                                    Edit Note
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
                            <div className="relative z-10">
                                <div className="mb-8 border-b border-white/10 pb-6">
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{activeNote.title}</h1>
                                    <div className="flex items-center gap-3 text-sm text-white/40">
                                        <span>Created {new Date(activeNote.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="prose prose-invert max-w-none text-white/90">
                                    {formatMarkdown(activeNote.content.markdown)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
