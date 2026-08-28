import { Text, View } from "react-native";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { VerifiedBadge } from "../ui/VerifiedBadge";
import type { JobPost } from "../../lib/mockData";

export function JobCard({ job }: { job: JobPost }) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Badge label={job.kind} tone={job.kind === "Job" ? "brand" : "neutral"} />
        <Text className="text-xs text-text-muted">{job.postedAt}</Text>
      </View>

      <Text className="text-base font-semibold text-text mb-2">{job.title}</Text>

      <View className="flex-row items-center gap-1">
        <Text className="text-xs text-text-muted">
          {job.posterName} · {job.location}
        </Text>
        {job.posterVerified ? <VerifiedBadge size={12} /> : null}
      </View>
    </Card>
  );
}
