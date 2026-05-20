import { useState } from "react";
import { Icon } from "../components/Icon";
import { Avatar, AvatarStack } from "../components/Avatar";
import { ScreenHeader } from "../components/ui";
import { POLLS, memberById, type Poll } from "../lib/data";

interface PollsProps {
  embed?: boolean;
  onBack?: () => void;
}

export function Polls({ embed, onBack }: PollsProps) {
  const [polls, setPolls] = useState<Poll[]>(POLLS);

  const vote = (pid: string, oid: string) => {
    setPolls((prev) =>
      prev.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              options: p.options.map((o) => {
                const without = (o.votes ?? []).filter((v) => v !== "u1");
                return { ...o, votes: o.id === oid ? [...without, "u1"] : without };
              }),
            },
      ),
    );
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
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} onVote={(oid) => vote(p.id, oid)} />
        ))}

        <button
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
    </div>
  );
}

function PollCard({ poll, onVote }: { poll: Poll; onVote: (oid: string) => void }) {
  const author = memberById(poll.author);
  const totalVotes = poll.options.reduce((n, o) => n + (o.votes?.length ?? 0), 0);
  const youVotedOption = poll.options.find((o) => (o.votes ?? []).includes("u1"));
  const maxVotes = Math.max(...poll.options.map((x) => (x.votes ?? []).length));

  return (
    <div className="card" style={{ borderRadius: 20, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Avatar user={author} size={28} showOnline />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>
            <b style={{ color: "var(--c-ink)" }}>{author.name}</b> started a poll
          </div>
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{poll.deadline}</div>
        </div>
        <span className="chip">{totalVotes} votes</span>
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
          const votes = o.votes ?? [];
          const pct = totalVotes > 0 ? (votes.length / totalVotes) * 100 : 0;
          const youHere = votes.includes("u1");
          const leading = totalVotes > 0 && votes.length === maxVotes;
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

              {o.img && (
                <div
                  className={o.img}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.1 }}>{o.label}</span>
                  {leading && (
                    <span className="chip chip-tint" style={{ fontSize: 10, padding: "2px 7px" }}>
                      Leading
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{o.sub}</div>
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
                <span
                  style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                >
                  {Math.round(pct)}%
                </span>
                {votes.length > 0 && <AvatarStack ids={votes} size={18} max={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
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
        <button style={{ color: "var(--c-link)", fontWeight: 600, fontSize: 12 }}>Add option</button>
      </div>
    </div>
  );
}
