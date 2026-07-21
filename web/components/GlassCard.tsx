"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className={`glass rounded-[22px] p-5 ${className}`}>{children}</motion.section>;
}
