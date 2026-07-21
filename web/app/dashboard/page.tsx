"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useOrg } from "@/lib/useOrg";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Users, CreditCard } from "lucide-react";

export default function DashboardHome() {
  const { orgId, orgName, loading: orgLoading } = useOrg();
  const [summary, setSummary] = useState<any>(null);
  const [volume, setVolume] = useState<any[]>([]);

  useEffect(() => {
    if (!orgId) return;
    api.get(`/orgs/${orgId}/dashboard/summary`).then((res) => setSummary(res.data));
    api.get(`/orgs/${orgId}/dashboard/event-volume`).then((res) => {
      const chartData = res.data.map((r: any) => ({
        time: new Date(r.bucketAt).toLocaleTimeString([], { hour: "2-digit" }),
        count: r.count,
      }));
      setVolume(chartData);
    });
  }, [orgId]);

  if (orgLoading) return <p className="text-sm text-slate-500">Loading...</p>;
  if (!orgId) return <p className="text-sm text-slate-500">No organization found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{orgName}</h1>
      <p className="mt-1 text-sm text-slate-500">Overview</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Total Events" value={summary?.totalEvents ?? "—"} />
        <StatCard icon={Users} label="Members" value={summary?.memberCount ?? "—"} />
        <StatCard icon={CreditCard} label="Plan" value={summary?.planTier ?? "—"} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-slate-700">Event Volume</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={volume}>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={18} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}