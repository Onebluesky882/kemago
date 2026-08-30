import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { type ApiStory, uploadStory } from "../../lib/api/storiesApi";
import { useAuthStore } from "../../store/useAuthStore";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type StoriesBarProps = {
  stories: ApiStory[];
  onOpenStory: (story: ApiStory) => void;
  onUploaded: (story: ApiStory) => void;
};

// One ring per author, showing only their most recent story — a full
// multi-story-per-author carousel (like IG cycling through everyone's
// last 24h of posts) isn't built yet, this is a single-item MVP.
export function StoriesBar({ stories, onOpenStory, onUploaded }: StoriesBarProps) {
  const token = useAuthStore((s) => s.token);
  const [uploading, setUploading] = useState(false);

  const latestByAuthor = new Map<string, ApiStory>();
  for (const story of stories) {
    const existing = latestByAuthor.get(story.authorId);
    if (!existing || story.createdAt > existing.createdAt) {
      latestByAuthor.set(story.authorId, story);
    }
  }
  const items = Array.from(latestByAuthor.values());

  async function handleAddStory() {
    if (!token || uploading) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mediaType = asset.type === "video" ? "video" : "image";
    const contentType = asset.mimeType ?? (mediaType === "video" ? "video/mp4" : "image/jpeg");

    setUploading(true);
    try {
      const story = await uploadStory(token, { uri: asset.uri, mediaType, contentType });
      onUploaded(story);
    } catch {
      // No toast/alert pattern exists elsewhere in this app yet — the "+"
      // just goes back to idle so the user can retry.
    } finally {
      setUploading(false);
    }
  }

  if (items.length === 0 && !token) return null;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(item) => item.authorId}
      contentContainerClassName="px-4 py-3"
      className="bg-surface border-b border-border"
      ListHeaderComponent={
        token ? (
          <Pressable onPress={handleAddStory} disabled={uploading} className="items-center mr-3" style={{ width: 64 }}>
            <View
              className="items-center justify-center rounded-full border-2 border-dashed border-border"
              style={{ width: 56, height: 56 }}
            >
              <Text className="text-lg text-text-muted">{uploading ? "…" : "+"}</Text>
            </View>
            <Text className="text-xs text-text-muted mt-1" numberOfLines={1}>
              {uploading ? "Uploading" : "Your story"}
            </Text>
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => onOpenStory(item)} className="items-center mr-3" style={{ width: 64 }}>
          <View className="rounded-full border-2 border-brand p-0.5" style={{ width: 56, height: 56 }}>
            <Avatar initials={initialsOf(item.author)} size={48} />
          </View>
          <Text className="text-xs text-text-muted mt-1" numberOfLines={1}>
            {item.author}
          </Text>
        </Pressable>
      )}
    />
  );
}
