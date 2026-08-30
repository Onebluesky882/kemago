import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import {
  type ApiClub,
  type ClubMember,
  changeLeader,
  listClubMembers,
} from "../../lib/api/clubsApi";
import { useAuthStore } from "../../store/useAuthStore";

type ClubCardProps = {
  club: ApiClub;
  onToggleMembership: (club: ApiClub) => void;
  onLeaderChanged: (club: ApiClub) => void;
  busy?: boolean;
};

export function ClubCard({ club, onToggleMembership, onLeaderChanged, busy }: ClubCardProps) {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);
  const isLeader = userId != null && userId === club.leaderId;

  const [handoffOpen, setHandoffOpen] = useState(false);
  const [members, setMembers] = useState<ClubMember[] | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [changingTo, setChangingTo] = useState<string | null>(null);

  async function openHandoff() {
    setHandoffOpen(true);
    if (members) return; // already fetched this session
    setLoadingMembers(true);
    try {
      setMembers(await listClubMembers(club.id));
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }

  async function handleMakeLeader(newLeaderId: string) {
    if (!token || changingTo) return;
    setChangingTo(newLeaderId);
    try {
      const updated = await changeLeader(token, club.id, newLeaderId);
      onLeaderChanged(updated);
      setHandoffOpen(false);
    } catch {
      // No toast/alert pattern exists elsewhere in this app yet — panel
      // stays open so the user can retry.
    } finally {
      setChangingTo(null);
    }
  }

  const otherMembers = (members ?? []).filter((m) => m.id !== club.leaderId);

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={club.category || "Club"} tone="neutral" />
        {club.joined ? <Badge label="Joined" tone="brand" /> : null}
      </View>

      <Text className="text-base font-semibold text-text mb-1">{club.name}</Text>
      <Text className="text-sm text-text-muted leading-relaxed mb-2">{club.description}</Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">
          {club.memberCount} members · led by {club.leaderName}
        </Text>
        <Pressable
          disabled={busy}
          onPress={() => onToggleMembership(club)}
          className={`rounded-full px-3 py-1.5 ${club.joined ? "bg-border" : "bg-brand"}`}
        >
          <Text className={`text-xs font-semibold ${club.joined ? "text-text-muted" : "text-white"}`}>
            {club.joined ? "Leave" : "Join"}
          </Text>
        </Pressable>
      </View>

      {isLeader && !handoffOpen ? (
        <Pressable onPress={openHandoff} hitSlop={8} className="mt-2">
          <Text className="text-xs font-semibold text-brand">Hand off leadership</Text>
        </Pressable>
      ) : null}

      {isLeader && handoffOpen ? (
        <View className="mt-3 pt-3 border-t border-border">
          <Text className="text-xs font-semibold text-text-muted uppercase mb-2">Make someone else leader</Text>
          {loadingMembers ? (
            <ActivityIndicator />
          ) : otherMembers.length === 0 ? (
            <Text className="text-xs text-text-muted">No other members yet — invite someone to join first.</Text>
          ) : (
            otherMembers.map((member) => (
              <View key={member.id} className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm text-text">{member.name}</Text>
                <Pressable
                  disabled={changingTo != null}
                  onPress={() => handleMakeLeader(member.id)}
                  className="rounded-full px-3 py-1 border border-brand"
                >
                  <Text className="text-xs font-semibold text-brand">
                    {changingTo === member.id ? "Making leader…" : "Make leader"}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
          <Pressable onPress={() => setHandoffOpen(false)} className="mt-2">
            <Text className="text-xs font-semibold text-text-muted">Cancel</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}
