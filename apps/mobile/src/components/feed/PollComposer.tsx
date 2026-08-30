import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";

// Standalone poll-creation form: question + dynamic add/remove option
// inputs + submit. Wired into PostCard behind a "+ Add poll" toggle (see
// stage-31 in PIPELINE.md). onSubmit receives the validated
// { question, options } and is expected to call pollsApi.createPoll and
// handle its own success/error UI.
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

type PollComposerProps = {
  onSubmit: (input: { question: string; options: string[] }) => void | Promise<void>;
  onCancel?: () => void;
};

export function PollComposer({ onSubmit, onCancel }: PollComposerProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
  const canSubmit = question.trim().length > 0 && trimmedOptions.length >= MIN_OPTIONS && !isSubmitting;

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => (prev.length >= MAX_OPTIONS ? prev : [...prev, ""]));
  }

  function removeOption(index: number) {
    setOptions((prev) => (prev.length <= MIN_OPTIONS ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ question: question.trim(), options: trimmedOptions });
      setQuestion("");
      setOptions(["", ""]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="bg-surface border border-border rounded-lg p-3 mb-4">
      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="Ask a question…"
        placeholderTextColor={colors.textMuted}
        className="text-sm text-text border-b border-border pb-2 mb-3"
      />

      <View className="gap-2">
        {options.map((option, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <TextInput
              value={option}
              onChangeText={(value) => updateOption(index, value)}
              placeholder={`Option ${index + 1}`}
              placeholderTextColor={colors.textMuted}
              className="flex-1 text-sm text-text bg-bg border border-border rounded-lg px-3 py-2"
            />
            {options.length > MIN_OPTIONS ? (
              <Pressable onPress={() => removeOption(index)} className="px-2 py-2">
                <Text className="text-text-muted text-sm">Remove</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Pressable onPress={addOption} disabled={options.length >= MAX_OPTIONS} className="px-1 py-1">
          <Text className={`text-xs font-semibold ${options.length >= MAX_OPTIONS ? "text-text-muted" : "text-brand"}`}>
            + Add option
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          {onCancel ? (
            <Pressable onPress={onCancel} className="px-2 py-1.5">
              <Text className="text-xs font-semibold text-text-muted">Cancel</Text>
            </Pressable>
          ) : null}
          <Pressable
            disabled={!canSubmit}
            onPress={handleSubmit}
            className={`rounded-full px-3.5 py-1.5 ${canSubmit ? "bg-brand" : "bg-border"}`}
          >
            <Text className={`text-xs font-semibold ${canSubmit ? "text-white" : "text-text-muted"}`}>
              Create poll
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
