import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Button } from "@productpath/ui";

export default function RoadmapNotFound() {
  return (
    <MarketingShell
      headerExtra={
        <Link href="/roadmaps">
          <Button size="sm" variant="secondary">
            Back to roadmaps
          </Button>
        </Link>
      }
    >
      <h1 className="pp-headline-lg">Roadmap not found</h1>
      <p className="pp-body-muted">This career roadmap does not exist or was removed.</p>
      <Link href="/roadmaps" style={{ marginTop: 24, display: "inline-block" }}>
        <Button>Browse all roadmaps</Button>
      </Link>
    </MarketingShell>
  );
}
