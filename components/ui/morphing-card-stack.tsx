"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, LayoutList } from "lucide-react"

export type LayoutMode = "stack" | "grid" | "list"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  onCardClick?: (card: CardData) => void
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
}

const SWIPE_THRESHOLD = 80
const SWIPE_VELOCITY = 500

export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  if (!cards || cards.length === 0) return null

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipe = offset.x * velocity.x

    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(swipe) > SWIPE_VELOCITY) {
      if (offset.x > 0) {
        // Swiped right - go to previous
        setDirection(-1)
        setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
      } else {
        // Swiped left - go to next
        setDirection(1)
        setActiveIndex((prev) => (prev + 1) % cards.length)
      }
    }
  }

  const handleCardClick = (card: CardData, isTopCard: boolean) => {
    if (layout !== "stack") {
      setExpandedCard(expandedCard === card.id ? null : card.id)
    }
    onCardClick?.(card)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered
  }

  const containerStyles = {
    stack: "relative w-full h-[420px] flex items-center justify-center",
    grid: "grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[1080px] mx-auto",
    list: "flex flex-col gap-3.5 w-full max-w-[1080px] mx-auto",
  }

  const displayCards = layout === "stack" ? getStackOrder() : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.05] p-1 w-fit mx-auto border border-white/10">
        {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
          const Icon = layoutIcons[mode]
          return (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "rounded-md p-2 transition-all",
                layout === mode ? "bg-white text-[#0A0A0B]" : "text-white/60 hover:text-white hover:bg-white/[0.08]"
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      <div className={cn(containerStyles[layout])}>
        {layout === "stack" ? (
          <AnimatePresence initial={false} custom={direction}>
            {displayCards.map((card) => {
              const isTopCard = card.stackPosition === 0
              const stackOffset = card.stackPosition * 12
              const scaleOffset = card.stackPosition * 0.05
              const rotateOffset = card.stackPosition * 1.5

              return (
                <motion.div
                  key={`${card.id}-${activeIndex}`}
                  custom={direction}
                  initial={{
                    x: direction > 0 ? 300 : -300,
                    opacity: 0,
                    scale: 0.8,
                    rotateZ: direction > 0 ? 10 : -10,
                  }}
                  animate={{
                    x: 0,
                    y: -stackOffset,
                    opacity: 1,
                    scale: 1 - scaleOffset,
                    rotateZ: rotateOffset,
                    zIndex: 100 - card.stackPosition,
                  }}
                  exit={{
                    x: direction > 0 ? -300 : 300,
                    opacity: 0,
                    scale: 0.8,
                    rotateZ: direction > 0 ? -10 : 10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    opacity: { duration: 0.2 },
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ 
                    scale: 1.05, 
                    cursor: "grabbing",
                    rotateZ: 0,
                  }}
                  onClick={() => handleCardClick(card, isTopCard)}
                  className={cn(
                    "absolute rounded-2xl border border-white/[0.08] bg-[#0c0515]/95 backdrop-blur-xl",
                    "shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden",
                    "w-[min(90vw,500px)] h-[340px]",
                    isTopCard && "cursor-grab active:cursor-grabbing hover:border-[#7209B7]/40",
                    !isTopCard && "pointer-events-none"
                  )}
                  style={{
                    backgroundColor: card.color || undefined,
                  }}
                >
                  <div className="w-full h-full p-6 flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      {card.icon && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/90">
                          {card.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-white/95 mb-2">{card.title}</h3>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {isTopCard && (
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                      <span className="text-xs text-white/40 font-medium">Swipe to navigate</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className={cn(layout === "grid" ? "contents" : "")}>
            {displayCards.map((card) => {
              const isExpanded = expandedCard === card.id
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: isExpanded ? 1.02 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => handleCardClick(card, false)}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0c0515]/90 p-6 backdrop-blur-xl",
                    "hover:border-[#7209B7]/40 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                    layout === "grid" && "w-full min-h-[260px]",
                    layout === "list" && "w-full",
                    isExpanded && "ring-1 ring-[#F72585]/30 border-[#7209B7]/50"
                  )}
                  style={{ backgroundColor: card.color || undefined }}
                >
                  <div className="flex items-start gap-3">
                    {card.icon && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/90">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white/95 mb-1">{card.title}</h3>
                      <p
                        className={cn(
                          "text-sm text-white/60 mt-1",
                          layout === "grid" && "line-clamp-6",
                          layout === "list" && "line-clamp-3"
                        )}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setActiveIndex(index)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
