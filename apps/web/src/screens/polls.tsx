import { useMemo, useState } from "react";
import * as Y from "yjs";
import { Icon } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import { ScreenHeader } from "../components/ui";
import { useTripDoc, useYArray } from "../lib/yjs";
import type { MemberDirectory } from "../lib/adapters";
import { NewPollModal } from "./modals";

interface PollOptionVM {
  id: string;
  label: string;
  sub: string;
  votes: string[];
  optionMap: Y.Map<unknown>;
}

interface PollVM {
  id: string;
  q: string;
  author: string;
  createdAt: number;
  closed: boolean;
  pollMap: Y.Map<unknown>;
  options: PollOptionVM[];
}

function readOption(opt: Y.Map<unknown>): PollOptionVM | null {
  const id = opt.get("id");
  const label = opt.get("label");
  if (typeof id !== "string" || typeof label !== "string") return null;
  const votesArr = opt.get("votes");
  const votes =
    votesArr instanceof Y.Array
      ? (votesArr.toArray().filter((v): v is string => typeof v === "string"))
      : [];
  const sub = opt.get("sub");
  return {
    id,
    label,
    sub: typeof sub === "string" ? sub : "",
    votes,
    optionMap: opt,
  };
}

function readPoll(map: Y.Map<unknown>): PollVM | null {
  const id = map.get("id");
  const q = map.get("q");
  const author = map.get("author");
  if (typeof id !== "string" || typeof q !== "string" || typeof author !== "string") {
    return null;
  }
  const created = map.get("createdAt");
  const closed = map.get("closed");
  const optsArr = map.get("options");
  const options: PollOptionVM[] =
    optsArr instanceof Y.Array
      ? optsArr
          .toArray()
          .map((o) => (o instanceof Y.Map ? readOption(o) : null))
          .filter((o): o is PollOptionVM => !!o)
      : [];
  return {
    id,
    q,
    author,
    createdAt: typeof created === "number" ? created : 0,
    closed: Boolean(closed),
    pollMap: map,
    options,
  };
}

export interface NewPollDraft {
  q: string;
  options: string[];
}

interface PollsProps {
  embed?: boolean;
  onBack?: () => void;
  directory: MemberDirectory;
}

export function Polls({ embed, onBack, directory }: PollsProps) {
  const { doc, polls } = useTripDoc();
  const rows = useYArray(polls);
  const [showNew, setShowNew] = useState(false);

  const items = useMemo(
    () => rows.map((m) => readPoll(m)).filter((p): p is PollVM => !!p).sort((a, b) => b.createdAt - a.createdAt),
    [rows],
  );

  const meId = directory.me.id;

  const vote = (poll: PollVM, optionId: string) => {
    doc.transact(() => {
      const optsArr = poll.pollMap.get("options");
      if (!(optsArr instanceof Y.Array)) return;
      for (let i = 0; i < optsArr.length; i++) {
        const opt = optsArr.get(i);
        if (!(opt instanceof Y.Map)) continue;
        const votesArr = opt.get("votes");
        if (!(votesArr instanceof Y.Array)) continue;
        // Remove the voter from every option
        for (let j = votesArr.length - 1; j >= 0; j--) {
          if (votesArr.get(j) === meId) votesArr.delete(j, 1);
        }
      }
      // Add to chosen option
      for (let i = 0; i < optsArr.length; i++) {
        const opt = optsArr.get(i);
        if (!(opt instanceof Y.Map)) continue;
        if (opt.get("id") === optionId) {
          const votesArr = opt.get("votes");
          if (votesArr instanceof Y.Array) votesArr.push([meId]);
          break;
        }
      }
    });
  };

  const addOption = (poll: PollVM, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    doc.transact(() => {
      const optsArr = poll.pollMap.get("options");
      if (!(optsArr instanceof Y.Array)) return;
      const opt = new Y.Map<unknown>();
      opt.set("id", "po_" + Math.random().toString(36).slice(2, 8));
      opt.set("label", trimmed);
      opt.set("sub", "");
      opt.set("votes", new Y.Array<string>());
      optsArr.push([opt]);
    });
  };

  const removePoll = (poll: PollVM) => {
    if (!confirm("Delete this poll?")) return;
    doc.transact(() => {
      for (let i = 0; i < polls.length; i++) {
        if (polls.get(i) === poll.pollMap) {
          polls.delete(i, 1);
          break;
        }
      }
    });
  };

  const createPoll = (draft: NewPollDraft) => {
    doc.transact(() => {
      const poll = new Y.Map<unknown>();
      poll.set("id", "pl_" + Math.random().toString(36).slice(2, 10));
      poll.set("q", draft.q.trim());
      poll.set("author", meId);
      poll.set("createdAt", Date.now());
      poll.set("closed", false);
      const opts = new Y.Array<Y.Map<unknown>>();
      for (const label of draft.options) {
        const trimmed = label.trim();
        if (!trimmed) continue;
        const opt = new Y.Map<unknown>();
        opt.set("id", "po_" + Math.random().toString(36).slice(2, 8));
        opt.set("label", trimmed);
        opt.set("sub", "");
        opt.set("votes", new Y.Array<string>());
        opts.push([opt]);
      }
      poll.set("options", opts);
      polls.push([poll]);
    });
    setShowNew(false);
  };

  return (
    <div className="screen-enter">
      {!embed && (
        <ScreenHeader
          title="Polls"
          onBack={onBack}
          subtitle="Decide together — votes update in real time"
        />
      )}
      <div style={{ padding: embed ? "0 20px 20px" : "4px 20px 20px", display: "grid", gap: 16 }}>
        {items.length === 0 && (
          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 18,
              background: "var(--c-tint)",
              border: 0,
              fontSize: 13,
              color: "var(--c-ink-2)",
              lineHeight: 1.5,
            }}
          >
            <b style={{ color: "var(--c-ink)" }}>No polls yet.</b> Start one to put a decision to the
            group — every vote shows up live for everyone.
          </div>
        )}
        {items.map((p) => (
          <PollCard
            key={p.id}
            poll={p}
            directory={directory}
            meId={meId}
            onVote={(oid) => vote(p, oid)}
            onAddOption={(label) => addOption(p, label)}
            onRemove={p.author === meId ? () => removePoll(p) : undefined}
          />
        ))}

        <button
          onClick={() => setShowNew(true)}
          style={{
            padding: "14px",
            borderRadius: 16,
            border: "1px dashed var(--c-ink-4)",
            color: "var(--c-ink-2)",
            fontSize: 14,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Icon name="plus" size={16} /> Start a new poll
        </button>
      </div>

      <NewPollModal open={showNew} onClose={() => setShowNew(false)} onCreate={createPoll} />
    </div>
  );
}

interface PollCardProps {
  poll: PollVM;
  directory: MemberDirectory;
  meId: string;
  onVote: (optionId: string) => void;
  onAddOption: (label: string) => void;
  onRemove?: () => void;
}

function PollCard({ poll, directory, meId, onVote, onAddOption, onRemove }: PollCardProps) {
  const author = directory.resolve(poll.author);
  const totalVotes = poll.options.reduce((n, o) => n + o.votes.length, 0);
  const youVotedOption = poll.options.find((o) => o.votes.includes(meId));
  const maxVotes = Math.max(0, ...poll.options.map((x) => x.votes.length));
  const [adding, setAdding] = useState(false);
  const [newOption, setNewOption] = useState("");

  const submitNewOption = () => {
    if (!newOption.trim()) {
      setAdding(false);
      return;
    }
    onAddOption(newOption);
    setNewOption("");
    setAdding(false);
  };

  return (
    <div className="card" style={{ borderRadius: 20, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar user={author} size={28} showOnline />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>
            <b style={{ color: "var(--c-ink)" }}>
              {author.id === meId ? "You" : author.name}
            </b>{" "}
            started a poll
          </div>
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
            {relativeTime(poll.createdAt)}
          </div>
        </div>
        <span className="chip">{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            style={{ padding: 6, color: "var(--c-ink-3)" }}
            title="Delete poll"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <div
        style={{
          fontFamily: "var(--sf-display)",
          fontSize: 24,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginBottom: 12,
        }}
      >
        {poll.q}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {poll.options.map((o) => {
          const pct = totalVotes > 0 ? (o.votes.length / totalVotes) * 100 : 0;
          const youHere = o.votes.includes(meId);
          const leading = totalVotes > 0 && o.votes.length === maxVotes;
          return (
            <button
              key={o.id}
              onClick={() => onVote(o.id)}
              style={{
                position: "relative",
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                overflow: "hidden",
                border: youHere ? "1.5px solid var(--c-accent)" : "0.5px solid var(--c-hair)",
                background: "var(--c-surface)",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pct}%`,
                  background: youHere
                    ? "color-mix(in oklab, var(--c-accent), transparent 84%)"
                    : "color-mix(in oklab, var(--c-ink), transparent 94%)",
                  transition: "width .35s cubic-bezier(.2,.8,.2,1)",
                }}
              />

              <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.1 }}>
                    {o.label}
                  </span>
                  {leading && (
                    <span className="chip chip-tint" style={{ fontSize: 10, padding: "2px 7px" }}>
                      Leading
                    </span>
                  )}
                </div>
                {o.sub && (
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{o.sub}</div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(pct)}%
                </span>
                {o.votes.length > 0 && <AvatarStack ids={o.votes} size={18} max={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        {adding ? (
          <input
            className="input"
            autoFocus
            placeholder="New option"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewOption();
              if (e.key === "Escape") {
                setAdding(false);
                setNewOption("");
              }
            }}
            onBlur={submitNewOption}
          />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              color: "var(--c-ink-3)",
            }}
          >
            {youVotedOption ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="check" size={14} style={{ color: "var(--c-accent)" }} />
                You voted for <b style={{ color: "var(--c-ink)" }}>{youVotedOption.label}</b>
              </span>
            ) : (
              <span>Tap a card to vote · tap again to change</span>
            )}
            <button
              onClick={() => setAdding(true)}
              style={{ color: "var(--c-link)", fontWeight: 600, fontSize: 12 }}
            >
              Add option
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function relativeTime(ms: number): string {
  if (!ms) return "just now";
  const diff = Date.now() - ms;
  const s = Math.round(diff / 1000);
  if (s < 60) return s <= 5 ? "just now" : `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ms).toLocaleDateString();
}
