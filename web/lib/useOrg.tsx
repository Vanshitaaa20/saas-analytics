"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

type Org = {
  id: string;
  name: string;
  role: string;
};

type OrgContextValue = {
  orgs: Org[];
  orgId: string | null;
  orgName: string;
  role: string | null;
  loading: boolean;
  error: string | null;
  selectedOrg: Org | null;
  selectOrg: (orgId: string) => void;
  refresh: () => Promise<void>;
};

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/orgs/mine");
      const nextOrgs = Array.isArray(res.data) ? res.data : [];
      setOrgs(nextOrgs);
      setSelectedOrgId((current) => {
        if (current && nextOrgs.some((org) => org.id === current)) return current;
        return nextOrgs[0]?.id ?? null;
      });
    } catch {
      setError("We couldn't load your organizations right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrgs();
  }, []);

  const selectedOrg = useMemo(
    () => orgs.find((org) => org.id === selectedOrgId) ?? null,
    [orgs, selectedOrgId],
  );

  const value = useMemo<OrgContextValue>(
    () => ({
      orgs,
      orgId: selectedOrg?.id ?? null,
      orgName: selectedOrg?.name ?? "",
      role: selectedOrg?.role ?? null,
      loading,
      error,
      selectedOrg,
      selectOrg: setSelectedOrgId,
      refresh: loadOrgs,
    }),
    [error, loading, orgs, selectedOrg],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) throw new Error("useOrg must be used within OrgProvider");
  return context;
}