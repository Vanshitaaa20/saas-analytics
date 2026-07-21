"use client";
import { ReactNode } from "react";
import { motion } from "motion/react";

export default function StatPill({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col gap-2 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 text-slate-200">
        <Icon size={18} />
        <span className="text-xs font-medium text-slate-200">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </motion.div>
  );
}
