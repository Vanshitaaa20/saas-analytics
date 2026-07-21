"use client";
import { motion } from "motion/react";
import GlassCard from "./GlassCard";
import { Activity, Users, CreditCard } from "lucide-react";

export default function PhoneMock() {
  return (
    <div className="phone-stack show-on-mobile">
      <div className="relative">
        <div className="phone-mock glass-bg">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-500">Dashboard</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">HELLO, WILL SMITH</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-3">
                <div className="flex flex-col items-start">
                  <Activity size={20} className="text-slate-700" />
                  <p className="text-xs text-slate-600 mt-2">Lorem Ipsum</p>
                </div>
              </GlassCard>

              <GlassCard className="p-3">
                <div className="flex flex-col items-start">
                  <Users size={20} className="text-slate-700" />
                  <p className="text-xs text-slate-600 mt-2">Members</p>
                </div>
              </GlassCard>

              <GlassCard className="p-3">
                <div className="flex flex-col items-start">
                  <CreditCard size={20} className="text-slate-700" />
                  <p className="text-xs text-slate-600 mt-2">Plan</p>
                </div>
              </GlassCard>

              <GlassCard className="p-3">
                <div className="flex flex-col items-start">
                  <p className="text-xs text-slate-600">More</p>
                </div>
              </GlassCard>
            </div>

            <div className="mt-2">
              <div className="rounded-full bg-white/40 w-14 h-2 mx-auto" />
            </div>
          </div>
        </div>
        <motion.div
          className="ribbon"
          style={{ width: 120, height: 120, left: -30, top: -40, background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.28), transparent 40%)' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="relative">
        <div className="phone-mock glass-bg">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Analytics</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Overview</h3>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-white/60 flex items-center justify-center">
                <p className="text-xl font-semibold">75%</p>
              </div>
            </div>

            <div className="mt-2">
              <div className="rounded-full bg-white/40 w-14 h-2 mx-auto" />
            </div>
          </div>
        </div>
        <motion.div
          className="ribbon"
          style={{ width: 160, height: 160, left: -10, top: -20, background: 'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.2), transparent 40%)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity }}
        />
      </div>

      <div className="relative">
        <div className="phone-mock glass-bg">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-xs text-slate-500">Trends</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">2201</h3>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <svg width="180" height="80" viewBox="0 0 180 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 60 C30 20, 60 40, 90 30 C120 20, 150 50, 180 20" stroke="url(#g)" strokeWidth="4" fill="none" strokeLinecap="round" />
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-2">
              <div className="rounded-full bg-white/40 w-14 h-2 mx-auto" />
            </div>
          </div>
        </div>
        <motion.div
          className="ribbon"
          style={{ width: 140, height: 140, right: -30, bottom: -20, background: 'radial-gradient(circle at 70% 70%, rgba(59,130,246,0.18), transparent 40%)' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
