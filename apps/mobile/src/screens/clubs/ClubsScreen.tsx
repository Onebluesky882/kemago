import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClubCard } from "../../components/clubs/ClubCard";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  type ApiClub,
  createClub as apiCreateClub,
  joinClub as apiJoinClub,
  leaveClub as apiLeaveClub,
  listClubs as apiListClubs,
} from "../../lib/api/clubsApi";
import { clubs as seedClubs } from "../../lib/mockData";
import { colors } from "../../theme/colors";
import { useAuthStore } from "../../store/useAuthStore";

// No local-first cache for clubs yet (unlike posts — see lib/db/postsRepo) —
// this offline fallback just reshapes the old mock array into ApiClub's
// shape so the screen still shows something when the backend is
// unreachable. leaderId/leaderName/createdAt are fabricated placeholders in
// that fallback path only; real data always comes from GET /api/clubs.
function seedAsApiClubs(): ApiClub[] {
  return seedClubs.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    leaderId: "",
    leaderName: "Unknown",
    memberCount: c.memberCount,
    joined: c.joined,
    createdAt: new Date().toISOString(),
  }));
}

export function ClubsScreen() {
  const token = useAuthStore((s) => s.token);
  const [clubs, setClubs] = useState<ApiClub[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newClubName, setNewClubName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiClubs = await apiListClubs();
        if (!cancelled) setClubs(apiClubs);
      } catch {
        // Backend unreachable (offline, or not running) — fall back to the
        // mock list so the screen still shows something, same spirit as
        // FeedScreen's local-first fallback.
        if (!cancelled) setClubs(seedAsApiClubs());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleMembership = useCallback(
    async (club: ApiClub) => {
      if (!token || busyId) return;
      setBusyId(club.id);
      try {
        const updated = club.joined
          ? await apiLeaveClub(token, club.id)
          : await apiJoinClub(token, club.id);
        setClubs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } catch {
        // Leave state as-is (e.g. leader tried to leave and got rejected by
        // the backend) — no toast/alert pattern exists elsewhere in this app
        // yet to surface the message.
      } finally {
        setBusyId(null);
      }
    },
    [token, busyId],
  );

  const handleLeaderChanged = useCallback((updated: ApiClub) => {
    setClubs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const handleCreateClub = useCallback(async () => {
    const name = newClubName.trim();
    if (!token || !name || creating) return;
    setCreating(true);
    try {
      const created = await apiCreateClub(token, { name });
      setClubs((prev) => [created, ...prev]);
      setNewClubName("");
    } catch {
      // No toast/alert pattern exists elsewhere in this app yet — the input
      // simply stays filled in so the user can retry.
    } finally {
      setCreating(false);
    }
  }, [token, newClubName, creating]);

  const canCreate = newClubName.trim().length > 0 && !creating;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-4 pt-3 pb-2 bg-surface border-b border-border">
        <Text className="text-xl font-bold text-text">Clubs</Text>
      </View>

      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4 pb-8"
        ListHeaderComponent={
          token ? (
            <View className="flex-row items-end bg-surface border border-border rounded-lg px-3 py-2 mb-4">
              <TextInput
                value={newClubName}
                onChangeText={setNewClubName}
                placeholder="Start a new club…"
                placeholderTextColor={colors.textMuted}
                className="flex-1 text-sm text-text py-1.5"
              />
              <Pressable
                disabled={!canCreate}
                onPress={handleCreateClub}
                className={`ml-2 rounded-full px-3.5 py-1.5 ${canCreate ? "bg-brand" : "bg-border"}`}
              >
                <Text className={`text-xs font-semibold ${canCreate ? "text-white" : "text-text-muted"}`}>
                  Create
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ClubCard
            club={item}
            onToggleMembership={handleToggleMembership}
            onLeaderChanged={handleLeaderChanged}
            busy={busyId === item.id}
          />
        )}
        ListEmptyComponent={
          <EmptyState title="No clubs yet" body="Clubs you join in the neighborhood will show up here." />
        }
      />
    </SafeAreaView>
  );
}
