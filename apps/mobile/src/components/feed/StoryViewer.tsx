import { useVideoPlayer, VideoView } from "expo-video";
import { Image, Pressable, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import type { ApiStory } from "../../lib/api/storiesApi";

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round">
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
}

type StoryViewerProps = {
  story: ApiStory;
  onClose: () => void;
};

// Single-item viewer — no auto-advance timer, no next/prev between
// different authors' stories yet (StoriesBar only tracks one story per
// author anyway). Full-screen overlay, not a routed screen, since it has
// no state worth deep-linking to.
export function StoryViewer({ story, onClose }: StoryViewerProps) {
  const player = useVideoPlayer(story.mediaType === "video" ? story.mediaUrl : null, (p) => {
    p.loop = false;
    p.play();
  });

  return (
    <View className="absolute inset-0 bg-black">
      {story.mediaType === "video" ? (
        <VideoView player={player} style={{ flex: 1 }} contentFit="contain" nativeControls={false} />
      ) : (
        <Image source={{ uri: story.mediaUrl }} className="flex-1" resizeMode="contain" />
      )}

      {/* Tap-anywhere-to-close background, painted before the header below
          so the header's own touches (the close button) take priority. */}
      <Pressable className="absolute inset-0" onPress={onClose} />

      <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-12 pb-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-semibold text-white">{story.author}</Text>
          {story.authorVerified ? <VerifiedBadge size={12} /> : null}
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </View>
    </View>
  );
}
