// TeamPanel.tsx client/src/components/admin/TeamPanel.tsx
// Admin → Settings → "Team": every admin, "Make admin" for an existing account (by email), and removing admin rights.
// GET / POST /api/admin/team and DELETE /api/admin/team/:id (server: adminTeamController.ts).
// The server keeps the rules: you can't remove yourself, and there's always at least one admin.

import { useState, type FormEvent } from "react";
import { MdOutlineAdminPanelSettings, MdPersonAddAlt } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { AdminTeamMember } from "../../types/admin";
import { api } from "../../utils/api";
import { shortDate } from "../../utils/dates";

const TeamPanel = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, error, reload } = useApi<{ admins: AdminTeamMember[] }>("/admin/team");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null); // the row asking "Remove?"

  const admins = data?.admins ?? [];

  const addAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return setFormError("Please enter their email address.");
    setFormError("");
    setAdding(true);
    try {
      const { message } = await api<{ message: string }>("/admin/team", { method: "POST", body: { email: email.trim() } });
      showToast({ type: "success", title: "Admin added", message }); // "Tolu Ade is now an admin."
      setEmail("");
      reload();
    } catch (err) {
      setFormError((err as Error).message); // e.g. "No QuickCart account uses ... Ask them to sign up first."
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (member: AdminTeamMember) => {
    try {
      const { message } = await api<{ message: string }>(`/admin/team/${member._id}`, { method: "DELETE" });
      showToast({ type: "success", title: message });
      reload();
    } catch (err) {
      showToast({ type: "error", title: "Couldn't remove the admin", message: (err as Error).message });
    }
    setConfirmId(null);
  };

  return (
    <section aria-labelledby="team-title" className="rounded-3xl bg-surface p-6 shadow-card max-sm:p-4">
      <h2 id="team-title" className="flex items-center gap-2 text-xl font-semibold text-ink">
        <MdOutlineAdminPanelSettings size={22} aria-hidden="true" className="text-primary" /> Team
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        The people who can open this dashboard. To add someone, they first sign up on the website, then you make their
        account an admin here.
      </p>

      {/* The admins */}
      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : !data ? (
        <div aria-busy="true" className="mt-4 h-24 animate-pulse rounded-2xl bg-field" />
      ) : (
        <ul aria-label="Admins" className="mt-4 flex flex-col divide-y divide-line">
          {admins.map((member) => {
            const isMe = member._id === user?._id;
            return (
              <li key={member._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-hover">
                    {`${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      {member.firstName} {member.lastName}
                      {isMe && <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary-hover">You</span>}
                    </p>
                    <p className="truncate text-sm text-ink-soft">
                      {member.email} · since {shortDate(member.createdAt)}
                    </p>
                  </div>
                </div>

                {!isMe &&
                  (confirmId === member._id ? (
                    <span className="flex items-center gap-3 text-sm">
                      Remove admin rights?
                      <button type="button" onClick={() => removeAdmin(member)} className="font-semibold text-danger hover:underline">
                        Yes
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="font-semibold text-ink-soft hover:underline">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(member._id)}
                      disabled={admins.length <= 1}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger-light disabled:opacity-40"
                    >
                      Remove
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>
      )}

      {/* Make an existing account an admin */}
      <form onSubmit={addAdmin} noValidate className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="new-admin-email" className="sr-only">
            Email of the person to make an admin
          </label>
          <input
            id="new-admin-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFormError("");
            }}
            placeholder="Their account email, e.g. tolu@gmail.com"
            aria-invalid={formError ? true : undefined}
            aria-describedby={formError ? "new-admin-error" : undefined}
            className="h-12 w-full rounded-xl bg-field px-4 text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40"
          />
          {formError && (
            <p id="new-admin-error" role="alert" className="mt-1.5 text-[13px] text-danger">
              {formError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={adding}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-hover px-5 font-semibold whitespace-nowrap text-white hover:bg-primary disabled:opacity-60"
        >
          <MdPersonAddAlt size={20} aria-hidden="true" />
          {adding ? "Adding..." : "Make admin"}
        </button>
      </form>
    </section>
  );
};

export default TeamPanel;
