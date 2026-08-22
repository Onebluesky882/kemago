import { useState } from "react";

// Local UI state only — no backend yet (see agentic/PIPELINE.md stage-7-feed).
// Swap `submit`'s body for a real POST /v1/feed call once the Go backend exists.
export function useComposePost() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  function submit(onSubmit: (body: string) => void) {
    if (!canSubmit) return;
    setIsSubmitting(true);
    onSubmit(text.trim());
    setText("");
    setIsSubmitting(false);
  }

  return { text, setText, isSubmitting, canSubmit, submit };
}
