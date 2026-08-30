import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Card } from "../ui/Card";
import { colors } from "../../theme/colors";
import { getPoll, votePoll, PollNotFoundError, type ApiPoll } from "../../lib/api/pollsApi";
import { useAuthStore } from "../../store/useAuthStore";

// Standalone poll display — fetches and manages its own poll/vote state via
// postId. Wired into PostCard: renders when post.hasPoll is true (see
// stage-31 in PIPELINE.md).
type PollCardProps = {
  postId: string;
};

export function PollCard({ postId }: PollCardProps) {
  const token = useAuthStore((s) => s.token);
  const [poll, setPoll] = useState<ApiPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPoll(postId, token ?? undefined);
        if (!cancelled) setPoll(result);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof PollNotFoundError) {
          setNotFound(true);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load poll");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  async function handleVote(optionId: string) {
    if (!token || votingOptionId) return;
    setVotingOptionId(optionId);
    setError(null);
    try {
      await votePoll(token, postId, optionId);
      const refreshed = await getPoll(postId, token);
      setPoll(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to vote");
    } finally {
      setVotingOptionId(null);
    }
  }

  if (notFound) return null;

  if (loading) {
    return (
      <Card className="mb-3 items-center py-6">
        <ActivityIndicator color={colors.textMuted} />
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className="mb-3">
        <Text className="text-xs text-text-muted">{error ?? "Poll unavailable"}</Text>
      </Card>
    );
  }

  const hasVoted = poll.myVoteOptionId != null;

  return (
    <Card className="mb-3">
      <Text className="text-sm font-semibold text-text mb-3">{poll.question}</Text>

      <View className="gap-2">
        {poll.options.map((option) => {
          const percent = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
          const isMine = poll.myVoteOptionId === option.id;
          const isVoting = votingOptionId === option.id;

          return (
            <Pressable
              key={option.id}
              disabled={!token || isVoting}
              onPress={() => handleVote(option.id)}
              className="relative overflow-hidden rounded-lg border border-border"
            >
              {hasVoted ? (
                <View
                  className={`absolute inset-y-0 left-0 ${isMine ? "bg-brand-soft" : "bg-bg"}`}
                  style={{ width: `${percent}%` }}
                />
              ) : null}
              <View className="flex-row items-center justify-between px-3 py-2.5">
                <Text className={`text-sm flex-1 ${isMine ? "font-semibold text-brand" : "text-text"}`}>
                  {option.label}
                </Text>
                {isVoting ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : hasVoted ? (
                  <Text className={`text-xs ml-2 ${isMine ? "font-semibold text-brand" : "text-text-muted"}`}>
                    {percent}%
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text className="text-xs text-text-muted mt-3">
        {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
        {!token ? " · sign in to vote" : ""}
      </Text>
      {error ? <Text className="text-xs text-accent mt-1">{error}</Text> : null}
    </Card>
  );
}
