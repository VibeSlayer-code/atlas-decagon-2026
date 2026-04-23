"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Sparkles,
    ArrowLeft,
    Trash2,
    ClipboardList,
    Save,
    Edit,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuizQuestion = {
    id: string;
    q: string;
    options: string[];
    answer: string;
    explanation?: string;
};

type Quiz = {
    id: string;
    title: string;
    content: { questions: QuizQuestion[] };
    created_at: string;
};

type ViewState = "list" | "create" | "take" | "view";

interface QuizPageProps {
    onNavigateToChat: () => void;
}

const LOCAL_STORAGE_KEY = "atlas_hackathon_quizzes";

const getLocalQuizzes = (): Quiz[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLocalQuizzes = (quizzes: Quiz[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quizzes));
};

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

function normalize(v?: string) {
    return (v ?? "").trim().toLowerCase();
}

export function QuizPage({ onNavigateToChat }: QuizPageProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [view, setView] = useState<ViewState>("list");
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

    const [editTitle, setEditTitle] = useState("");
    const [editQuestions, setEditQuestions] = useState<QuizQuestion[]>([]);

    const [selected, setSelected] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setQuizzes(getLocalQuizzes());
    }, []);

    const handleStartCreate = () => {
        setEditTitle("");
        setEditQuestions([{
            id: crypto.randomUUID(),
            q: "",
            options: ["", "", "", ""],
            answer: "",
            explanation: ""
        }]);
        setView("create");
    };

    const handleAddQuestion = () => {
        setEditQuestions((prev) => [...prev, {
            id: crypto.randomUUID(),
            q: "",
            options: ["", "", "", ""],
            answer: "",
            explanation: ""
        }]);
    };

    const handleUpdateQuestion = (id: string, field: keyof QuizQuestion, value: string | string[]) => {
        setEditQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
        setEditQuestions((prev) =>
            prev.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options];
                    newOptions[optionIndex] = value;
                    return { ...q, options: newOptions };
                }
                return q;
            })
        );
    };

    const handleRemoveQuestion = (id: string) => {
        setEditQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const handleSaveQuiz = () => {
        if (!editTitle.trim()) {
            alert("Please enter a quiz title.");
            return;
        }
        const validQuestions = editQuestions.filter(q =>
            q.q.trim() && q.options.some(o => o.trim()) && q.answer.trim()
        );
        if (validQuestions.length === 0) {
            alert("Please add at least one valid question.");
            return;
        }

        const newQuiz: Quiz = {
            id: crypto.randomUUID(),
            title: editTitle.trim(),
            content: { questions: validQuestions },
            created_at: new Date().toISOString(),
        };

        const newQuizzesList = [newQuiz, ...quizzes];
        saveLocalQuizzes(newQuizzesList);
        setQuizzes(newQuizzesList);
        setView("list");
    };

    const handleDeleteQuiz = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        const newQuizzesList = quizzes.filter((q) => q.id !== id);
        saveLocalQuizzes(newQuizzesList);
        setQuizzes(newQuizzesList);
    };

    const openTakeView = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setSelected({});
        setSubmitted(false);
        setView("take");
    };

    const validQuestions = activeQuiz?.content.questions.filter((q) =>
        Array.isArray(q.options) && q.options.length > 0
    ) || [];
    const total = validQuestions.length;
    const answered = validQuestions.filter((q, idx) => typeof selected[idx] === "string").length;
    const correct = validQuestions.filter((q, idx) =>
        normalize(selected[idx]) === normalize(q.answer)
    ).length;

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10 text-white">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

            {view === "list" && (
                <div className="flex items-end justify-between mb-10 relative z-20">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/95">
                            Quizzes
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
                            New Quiz
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
                        {quizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="w-20 h-20 rounded-full bg-white/[0.05] flex items-center justify-center mb-6">
                                    <ClipboardList className="w-10 h-10 text-white/20" />
                                </div>
                                <h3 className="text-xl font-bold text-white/90 mb-2">No quizzes yet</h3>
                                <p className="text-white/40 max-w-sm mb-8">
                                    Create your first quiz manually or ask the AI Study Buddy to generate one.
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
                                {quizzes.map((quiz, i) => (
                                    <motion.div
                                        key={quiz.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => openTakeView(quiz)}
                                        className="group relative flex flex-col p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-violet-500/10"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/0 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex justify-between items-start mb-12">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                <ClipboardList className="w-5 h-5 text-white/70" />
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                                                className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white/95 mb-2 line-clamp-2">
                                            {quiz.title}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between text-sm">
                                            <span className="text-white/40">
                                                {quiz.content.questions.length} {quiz.content.questions.length === 1 ? 'question' : 'questions'}
                                            </span>
                                            <span className="text-xs font-medium text-white/30 bg-white/[0.05] px-2.5 py-1 rounded-md">
                                                {new Date(quiz.created_at).toLocaleDateString()}
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
                                onClick={handleSaveQuiz}
                                disabled={!editTitle.trim() || editQuestions.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#F72585] text-white font-medium shadow-[0_0_20px_rgba(247,37,133,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Save Quiz
                            </button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 mb-8 backdrop-blur-xl">
                            <label className="block text-sm font-semibold text-white/60 uppercase tracking-widest mb-3">
                                Quiz Title
                            </label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="e.g. Chemistry Final Review"
                                className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 px-0"
                            />
                        </div>

                        <div className="space-y-6 mb-8">
                            <AnimatePresence initial={false}>
                                {editQuestions.map((question, index) => (
                                    <motion.div
                                        key={question.id}
                                        initial={{ opacity: 0, height: 0, y: 10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl relative group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-white/60">{index + 1}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveQuestion(question.id)}
                                                className="p-2.5 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Question</label>
                                                <textarea
                                                    value={question.q}
                                                    onChange={(e) => handleUpdateQuestion(question.id, "q", e.target.value)}
                                                    placeholder="Enter your question..."
                                                    className="w-full h-20 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Options</label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {question.options.map((opt, optIdx) => (
                                                        <input
                                                            key={optIdx}
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => handleUpdateOption(question.id, optIdx, e.target.value)}
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            className="w-full rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Correct Answer</label>
                                                <input
                                                    type="text"
                                                    value={question.answer}
                                                    onChange={(e) => handleUpdateQuestion(question.id, "answer", e.target.value)}
                                                    placeholder="Enter the correct answer..."
                                                    className="w-full rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">Explanation (Optional)</label>
                                                <textarea
                                                    value={question.explanation || ""}
                                                    onChange={(e) => handleUpdateQuestion(question.id, "explanation", e.target.value)}
                                                    placeholder="Explain why this is the correct answer..."
                                                    className="w-full h-16 resize-none rounded-xl bg-black/40 border border-white/[0.05] p-3 text-sm text-white/90 focus:border-violet-500/50 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleAddQuestion}
                            className="w-full py-4 border-2 border-dashed border-white/10 hover:border-violet-500/50 rounded-2xl text-white/40 hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Question
                        </button>
                    </motion.div>
                )}

                {view === "take" && activeQuiz && (
                    <motion.div
                        key="take"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl mx-auto pb-20"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Library
                            </button>
                            <div className="text-center flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">{activeQuiz.title}</h2>
                            </div>
                            <div className="w-36" />
                        </div>

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

                            <div className="space-y-4">
                                {validQuestions.map((q, idx) => {
                                    const picked = selected[idx];
                                    const isCorrect = normalize(picked) === normalize(q.answer);
                                    return (
                                        <div key={idx} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:p-8 shadow-xl transition-all duration-300">
                                            <div className="inline-flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] font-bold text-white/60">
                                                    {idx + 1}
                                                </div>
                                                <div className="text-[12px] text-white/40 uppercase tracking-widest font-semibold">Question</div>
                                            </div>
                                            <div className="text-base md:text-lg font-medium text-white/95 whitespace-pre-wrap leading-relaxed mb-6">
                                                {formatPowerNotation(q.q)}
                                            </div>

                                            <div className="grid gap-3">
                                                {q.options.map((opt, i) => {
                                                    const active = picked === opt;
                                                    const revealGood = submitted && normalize(opt) === normalize(q.answer);
                                                    const revealBad = submitted && active && !revealGood;
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
                                                    );
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
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
