"use client"

import { motion } from "motion/react"

export function ShiningText({ text }: { text: string }) {
  return (
    <motion.h1
      className="bg-[linear-gradient(110deg,#5b4f75,35%,#ffffff,50%,#5b4f75,75%,#5b4f75)] bg-[length:200%_100%] bg-clip-text text-sm font-medium text-transparent"
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    >
      {text}
    </motion.h1>
  )
}

