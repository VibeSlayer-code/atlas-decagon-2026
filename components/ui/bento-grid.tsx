"use client";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    TrendingUp,
    Video,
    Globe,
} from "lucide-react";
import React from "react";
export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}
interface BentoGridProps {
    items: BentoItem[];
}
export const itemsSample: BentoItem[] = [
    {
        title: "test test test",
        meta: "test test test",
        description: "test test test",
        icon: <TrendingUp className="w-4 h-4 text-[#F72585]" />,
        status: "test test test",
        tags: ["test", "test", "test"],
        colSpan: 2,
        hasPersistentHover: true,
    },
    {
        title: "test test test",
        meta: "test test test",
        description: "test test test",
        icon: <CheckCircle className="w-4 h-4 text-[#B5179E]" />,
        status: "test test test",
        tags: ["test", "test", "test"],
    },
    {
        title: "test test test",
        meta: "test test test",
        description: "test test test",
        icon: <Video className="w-4 h-4 text-[#7209B7]" />,
        tags: ["test", "test", "test"],
        colSpan: 2,
    },
    {
        title: "test test test",
        meta: "test test test",
        description: "test test test",
        icon: <Globe className="w-4 h-4 text-[#560BAD]" />,
        status: "test test test",
        tags: ["test", "test", "test"],
    },
];
export function BentoGrid({ items = itemsSample }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative p-5 rounded-lg overflow-hidden",
                        "border border-white/[0.12] bg-[#140a25]/95 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
                        "hover:border-white/[0.20]",
                        "transition-all duration-300",
                        item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
                        { "border-white/[0.15] bg-[#180c2e]/95": item.hasPersistentHover }
                    )}
                >
                    {}
                    <div
                        className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,9,183,0.10)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>
                    <div className="relative flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white/[0.05]">
                                {item.icon}
                            </div>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] text-white/35">
                                {item.status || "Active"}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-medium text-white/90 tracking-tight text-[15px]">
                                {item.title}
                                <span className="ml-2 text-xs text-white/20 font-normal">{item.meta}</span>
                            </h3>
                            <p className="text-[13px] text-white/30 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-1.5 text-[11px] text-white/25">
                                {item.tags?.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04]">#{tag}</span>
                                ))}
                            </div>
                            <span className="text-[11px] text-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {item.cta || "Explore →"}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
