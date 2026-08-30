import { Pressable, Text, TextInput, View } from "react-native";
import { useComposePost } from "../../hooks/useComposePost";
import { colors } from "../../theme/colors";

type CommentComposerProps = {
  onSubmit: (body: string) => Promise<void> | void;
};

export function CommentComposer({ onSubmit }: CommentComposerProps) {
  const { text, setText, canSubmit, submit } = useComposePost();

  return (
    <View className="flex-row items-end bg-surface border border-border rounded-lg px-3 py-2 mt-2">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Write a reply…"
        placeholderTextColor={colors.textMuted}
        multiline
        className="flex-1 text-sm text-text max-h-24 py-1.5"
      />
      <Pressable
        disabled={!canSubmit}
        onPress={() => submit(onSubmit)}
        className={`ml-2 rounded-full px-3.5 py-1.5 ${canSubmit ? "bg-brand" : "bg-border"}`}
      >
        <Text className={`text-xs font-semibold ${canSubmit ? "text-white" : "text-text-muted"}`}>Reply</Text>
      </Pressable>
    </View>
  );
}
