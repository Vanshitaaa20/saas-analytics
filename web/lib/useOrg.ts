"use client";
import { useEffect, useState } from "react";
import { api } from "./api";

export function useOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orgs/mine").then((res) => {
      if (res.data.length > 0) {
        setOrgId(res.data[0].id);
        setOrgName(res.data[0].name);
      }
      setLoading(false);
    });
  }, []);

  return { orgId, orgName, loading };
}