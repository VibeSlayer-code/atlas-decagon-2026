"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import {
    Plus,
    Sparkles,
    ArrowLeft,
    Trash2,
    Layers,
    Save,
    Info
} from "lucide-react";

type Flashcard = {
    id: string;
    front: string;
    back: string;
};

type FlashcardDeck = {
    id: string;
    title: string;
    content: { cards: Flashcard[] };
    created_at: string;
};

type ViewState = "list" | "create" | "study";

interface FlashcardsPageProps {
    onNavigateToChat: () => void;
}

const LOCAL_STORAGE_KEY = "atlas_hackathon_flashcards";

// --- Pure Local Storage Helpers ---
const getLocalDecks = (): FlashcardDeck[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalDecks = (decks: FlashcardDeck[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks));
};

export function FlashcardsPage({ onNavigateToChat }: FlashcardsPageProps) {
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [view, setView] = useState<ViewState>("list");

    // Active states
    const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);

    // Editor states
    const [editTitle, setEditTitle] = useState("");
    const [editCards, setEditCards] = useState<Flashcard[]>([]);

    // Load data instantly on mount
    useEffect(() => {
        setDecks(getLocalDecks());
    }, []);

    const handleStartCreate = () => {
        setEditTitle("");
        setEditCards([{ id: crypto.randomUUID(), front: "", back: "" }]);
        setView("create");
    };

    const handleAddCardRow = () => {
        setEditCards((prev) => [...prev, { id: crypto.randomUUID(), front: "", back: "" }]);
    };

    const handleUpdateCard = (id: string, field: "front" | "back", value: string) => {
        setEditCards((prev) =>
            prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    const handleRemoveCardRow = (id: string) => {
        setEditCards((prev) => prev.filter((c) => c.id !== id));
    };

    const handleSaveDeck = () => {
        if (!editTitle.trim()) {
            alert("Please enter a deck title.");
            return;
        }
        const validCards = editCards.filter(c => c.front.trim() || c.back.trim());
        if (validCards.length === 0) {
            alert("Please add at least one card to the deck.");
            return;
        }

        const newDeck: FlashcardDeck = {
            id: crypto.randomUUID(),
            title: editTitle.trim(),
            content: { cards: validCards },
            created_at: new Date().toISOString(),
        };

        const newDecksList = [newDeck, ...decks];
        saveLocalDecks(newDecksList);
        setDecks(newDecksList);
        setView("list");
    };

    const handleDeleteDeck = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this deck?")) return;

        const newDecksList = decks.filter((d) => d.id !== id);
        saveLocalDecks(newDecksList);
        setDecks(newDecksList);
    };

    const openStudyView = (deck: FlashcardDeck) => {
        setActiveDeck(deck);
        setView("study");
    };

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10 text-white">
            {/* Background ambient glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* HEADER */}
            <div className="flex items-end justify-between mb-10 relative z-20">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95">
                        Flashcards
                    </h1>
                </div>

                {view === "list" && (
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
                            New Deck
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* ---- LIST VIEW ---- */}
                {view === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full flex-1"
                    >
                        {decks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="w-20 h-20 rounded-full bg-white/[0.05] flex items-center justify-center mb-6">
                                    <Layers className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white/90 mb-2">No flashcards yet</h3>
                                <p className="text-white/40 max-w-sm mb-8">
                                    Create your first deck manually or ask the AI Study Buddy to generate one.
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
                                {decks.map((deck, i) => (
                                    <motion.div
                                        key={deck.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => openStudyView(deck)}
                                        className="group relative flex flex-col p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-violet-500/10"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/0 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-white/70" />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteDeck(deck.id, e)}
                                                className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white/95 mb-2 line-clamp-2">
                                            {deck.title}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between text-sm">
                                            <span className="text-white/40">
                                                {deck.content.cards.length} {deck.content.cards.length === 1 ? 'card' : 'cards'}
                                            </span>
                                            <span className="text-xs font-medium text-white/30 bg-white/[0.05] px-2.5 py-1 rounded-md">
                                                {new Date(deck.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ---- CREATE VIEW ---- */}
                {view === "create" && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-4xl mx-auto w-full pb-20"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
                            </button>
                            <button
                                onClick={handleSaveDeck}
                                disabled={!editTitle.trim() || editCards.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Save Deck
                            </button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 mb-8 backdrop-blur-xl">
                            <label className="block text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
                                Deck Title
                            </label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="e.g. Advanced Calculus Definitions"
                                className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 px-0"
                            />
                        </div>

                        <div className="space-y-4 mb-8">
                            <AnimatePresence initial={false}>
                                {editCards.map((card, index) => (
                                    <motion.div
                                        key={card.id}
                                        initial={{ opacity: 0, height: 0, y: 10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="flex gap-4 items-start bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl relative group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 mt-1">
                                            <span className="text-xs font-bold text-white/60">{index + 1}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Front (Term)</label>
                                                <textarea
                                                    value={card.front}
                                                    onChange={(e) => handleUpdateCard(card.id, "front", e.target.value)}
                                                    placeholder="Term or Question..."
                                                    className="w-full h-24 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Back (Definition)</label>
                                                <textarea
                                                    value={card.back}
                                                    onChange={(e) => handleUpdateCard(card.id, "back", e.target.value)}
                                                    placeholder="Definition or Answer..."
                                                    className="w-full h-24 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveCardRow(card.id)}
                                            className="p-2.5 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                                            title="Remove Card"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleAddCardRow}
                            className="w-full py-4 border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-2xl text-white/40 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Card
                        </button>
                    </motion.div>
                )}

                {/* ---- STUDY VIEW ---- */}
                {view === "study" && activeDeck && (
                    <motion.div
                        key="study"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-full flex flex-col items-center max-w-5xl mx-auto pt-4"
                    >
                        <div className="w-full flex items-center justify-between mb-12">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
                            </button>
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">{activeDeck.title}</h2>
                                <p className="text-sm text-white/40">
                                    {activeDeck.content.cards.length} cards total
                                </p>
                            </div>
                            <div className="w-36" /> {/* Spacer for centering */}
                        </div>

                        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center items-center relative min-h-[500px]">
                            <MorphingCardStack
                                defaultLayout="stack"
                                className="w-full aspect-[4/3] max-w-[600px]"
                                cards={activeDeck.content.cards.map((c, idx) => ({
                                    id: c.id || idx.toString(),
                                    title: c.front,
                                    description: c.back,
                                }))}
                            />
                            <div className="mt-12 inline-flex items-center gap-2 text-white/40 text-sm bg-white/[0.03] px-4 py-2 rounded-full border border-white/[0.05]">
                                <Info className="w-4 h-4" />
                                Click card to flip • Drag sideways to skip
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
