"use client";

import { useEffect } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        style={{ animation: "var(--animate-scrim)" }}
        onClick={onCancel}
      />
      <div
        className="card relative z-10 w-full max-w-sm p-6 text-center"
        style={{ animation: "var(--animate-pop)" }}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-lodging/15 text-2xl">
          🗑️
        </div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-1.5 text-sm text-text-soft">{message}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="btn btn-outline flex-1 py-2.5">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="btn flex-1 py-2.5 text-white"
            style={{ background: "var(--c-lodging)" }}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
