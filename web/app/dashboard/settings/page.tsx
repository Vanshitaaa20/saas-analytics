"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useOrg } from "@/lib/useOrg";
import { Settings, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { orgName, loading, error, orgId } = useOrg();
  const [planTier, setPlanTier] = useState<string>("—");

  useEffect(() => {
    if (!orgId) {
      setPlanTier("—");
      return;
    }

    api.get(`/orgs/${orgId}/dashboard/summary`).then((res) => setPlanTier(res.data?.planTier ?? "—"));
  }, [orgId]);

  if (loading) {
    return <PageState title="Loading settings" description="Preparing your workspace details..." icon={Loader2} loading />;
  }

  if (error) {
    return <PageState title="Unable to load settings" description={error} icon={Settings} />;
  }

  if (!orgId) {
    return <PageState title="No organization selected" description="Choose an organization from the sidebar to view settings." icon={Settings} />;
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Workspace</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Settings</h1><p className="mt-1 text-sm text-[#91a0c3]">Manage your current workspace preferences.</p>

      <div className="glass mt-7 rounded-[22px] p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d8bad]">Organization</p><p className="mt-2 text-lg font-semibold text-white">{orgName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d8bad]">Plan</p><p className="mt-2 text-lg font-semibold text-white">{planTier}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageState({ title, description, icon: Icon, loading = false }: { title: string; description: string; icon: any; loading?: boolean }) {
  return (
    <div className="glass flex min-h-[60vh] flex-col items-center justify-center rounded-[22px] p-10 text-center">
      <div className={`rounded-full border border-slate-100 bg-slate-50 p-3 ${loading ? "animate-pulse" : ""}`}>
        <Icon size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2><p className="mt-2 max-w-sm text-sm text-[#91a0c3]">{description}</p>
    </div>
  );
}
