import { useState } from "react";

// Writes now go through the local-first SQLite/localStorage repo (see
// src/lib/db/postsRepo.*) — onSubmit is genuinely async, so submit awaits
// it before clearing isSubmitting to actually prevent a double post.
export function useComposePost() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  async function submit(onSubmit: (body: string) => void | Promise<void>) {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { text, setText, isSubmitting, canSubmit, submit };
}
