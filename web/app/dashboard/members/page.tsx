"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useOrg } from "@/lib/useOrg";
import { Loader2, Users, UserPlus } from "lucide-react";

type Member = {
  id: string;
  role: string;
  user?: { email?: string | null };
};

export default function MembersPage() {
  const { orgId, orgName, loading: orgLoading, error, role } = useOrg();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const [submitting, setSubmitting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setFetchError(null);

    api
      .get(`/orgs/${orgId}/members`)
      .then((res) => {
        if (!active) return;
        setMembers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setFetchError("We couldn't load the members list right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orgId]);

  const canManageMembers = role === "OWNER" || role === "ADMIN";

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!orgId) return;

    setSubmitting(true);
    setInviteMessage(null);
    setInviteError(null);

    try {
      await api.post(`/orgs/${orgId}/invites`, { email, role: memberRole });
      setInviteMessage(`An invitation was sent to ${email}.`);
      setEmail("");
      setMemberRole("MEMBER");
    } catch {
      setInviteError("The invitation could not be created. Please check the email and permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orgLoading || loading) {
    return <PageState title="Loading members" description="Fetching the current roster..." icon={Loader2} loading />;
  }

  if (error || fetchError) {
    return <PageState title="Unable to load members" description={error ?? fetchError ?? "Please try again in a moment."} icon={Users} />;
  }

  if (!orgId) {
    return <PageState title="No organization selected" description="Choose an organization from the sidebar to view members." icon={Users} />;
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{orgName}</h1>
          <p className="mt-1 text-sm text-slate-500">Members</p>
        </div>
      </div>

      {canManageMembers ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <UserPlus size={18} />
            <h2 className="text-sm font-medium">Invite member</h2>
          </div>
          <form onSubmit={handleInvite} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              required
            />
            <select
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
            <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? "Sending..." : "Invite"}
            </button>
          </form>
          {inviteMessage ? <p className="mt-3 text-sm text-green-600">{inviteMessage}</p> : null}
          {inviteError ? <p className="mt-3 text-sm text-red-500">{inviteError}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-medium text-slate-700">Current members</h2>
        </div>
        {members.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-6 text-sm text-slate-500">
            No members have been added to this organization yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 text-slate-700">{member.user?.email ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-700">{member.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PageState({ title, description, icon: Icon, loading = false }: { title: string; description: string; icon: any; loading?: boolean }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
      <div className={`rounded-full border border-slate-100 bg-slate-50 p-3 ${loading ? "animate-pulse" : ""}`}>
        <Icon size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
