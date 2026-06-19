"use client";

import { useEffect, useMemo, useState } from "react";
import type { Collaborator, Trip } from "@/lib/types";
import { buildInviteLink } from "@/lib/share";
import { CloseIcon } from "./Icons";

interface Props {
  trip: Trip;
  fromName: string;
  onChangeName: (name: string) => void;
  onAdd: (c: Omit<Collaborator, "id">) => void;
  onUpdate: (id: string, patch: Partial<Collaborator>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const AVATAR_COLORS = ["#ff7a59", "#2193b0", "#11998e", "#7367f0", "#c471ed", "#f7971e"];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function ShareModal({
  trip,
  fromName,
  onChangeName,
  onAdd,
  onUpdate,
  onRemove,
  onClose,
}: Props) {
  const [linkRole, setLinkRole] = useState<"editor" | "viewer">("editor");
  const [copied, setCopied] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");

  const link = useMemo(
    () => buildInviteLink(trip, linkRole, fromName || "A friend"),
    [trip, linkRole, fromName],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      /* clipboard may be blocked; link is visible to copy manually */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() && !inviteEmail.trim()) return;
    onAdd({
      name: inviteName.trim() || inviteEmail.trim().split("@")[0],
      email: inviteEmail.trim() || undefined,
      role: inviteRole,
    });
    setInviteName("");
    setInviteEmail("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Share trip"
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        style={{ animation: "var(--animate-scrim)" }}
        onClick={onClose}
      />
      <div
        className="card relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-[1.75rem] p-5 sm:rounded-[1.75rem] sm:p-6"
        style={{ animation: "var(--animate-sheet)" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />

        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Invite to {trip.emoji} {trip.name}</h3>
            <p className="text-sm text-text-faint">
              Plan together — friends and family can view or edit.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost h-9 w-9 !p-0" aria-label="Close">
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* your name (used as the inviter) */}
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Your name
          </span>
          <input
            className="field"
            value={fromName}
            placeholder="e.g. Sam"
            onChange={(e) => onChangeName(e.target.value)}
          />
        </label>

        {/* invite link */}
        <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">Invite link</span>
            <div className="flex rounded-full bg-surface p-0.5 text-xs font-semibold shadow-[var(--shadow-sm)]">
              {(["editor", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setLinkRole(r)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    linkRole === r ? "bg-brand text-white" : "text-text-soft"
                  }`}
                >
                  {r === "editor" ? "Can edit" : "View only"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2.5 flex gap-2">
            <input
              readOnly
              aria-label="Invite link"
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="field flex-1 truncate text-xs text-text-soft"
            />
            <button onClick={copy} className="btn btn-primary shrink-0 px-4 py-2 text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-text-faint">
            Anyone with this link can {linkRole === "editor" ? "edit" : "view"} a copy of the trip.
          </p>
        </div>

        {/* add a person */}
        <form onSubmit={submitInvite} className="mt-5">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            Invite people
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field flex-1"
              placeholder="Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
            <input
              className="field flex-1"
              placeholder="email (optional)"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <select
              className="field w-32"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
              aria-label="Invite role"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button type="submit" className="btn btn-outline flex-1 py-2.5 text-sm">
              Add person
            </button>
          </div>
        </form>

        {/* people with access */}
        <div className="mt-5">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-faint">
            People with access
          </span>
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-3">
              <Avatar name={fromName || "You"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{fromName || "You"} (you)</p>
                <p className="truncate text-xs text-text-faint">Organiser</p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-strong">
                Owner
              </span>
            </li>
            {trip.collaborators.map((c) => (
              <li key={c.id} className="flex items-center gap-3" data-collab>
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  {c.email && <p className="truncate text-xs text-text-faint">{c.email}</p>}
                </div>
                <select
                  className="field h-9 w-24 !py-0 text-xs"
                  value={c.role}
                  onChange={(e) => onUpdate(c.id, { role: e.target.value as "editor" | "viewer" })}
                  aria-label={`Role for ${c.name}`}
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => onRemove(c.id)}
                  className="btn btn-ghost h-8 w-8 !p-0 text-text-faint hover:!text-lodging"
                  aria-label={`Remove ${c.name}`}
                >
                  <CloseIcon width={15} height={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onClose} className="btn btn-primary mt-6 w-full py-2.5">
          Done
        </button>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ background: avatarColor(name) }}
    >
      {initials(name)}
    </span>
  );
}
