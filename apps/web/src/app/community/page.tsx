"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Alert,
  Spinner,
  EmptyState,
  Label,
} from "@productpath/ui";
import { api, ApiError, type CommunityPost } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function PostCard({
  post,
  onLike,
}: {
  post: CommunityPost;
  onLike: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{post.author.displayName}</p>
          <span style={{ fontSize: "0.75rem", color: "var(--pp-muted)" }}>
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>
        {post.projectShare ? (
          <p
            style={{
              margin: "8px 0",
              fontSize: "0.8125rem",
              color: post.projectShare.verified ? "var(--pp-secondary)" : "var(--pp-muted)",
              fontWeight: 600,
            }}
          >
            {post.projectShare.label}
            {post.projectShare.title ? ` · ${post.projectShare.title}` : ""}
          </p>
        ) : null}
        <p style={{ margin: "12px 0", whiteSpace: "pre-wrap" }}>{post.body}</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button size="sm" variant="secondary" onClick={() => onLike(post.id)}>
            {post.likedByViewer ? "Unlike" : "Like"} ({post.likeCount})
          </Button>
          <Link href={`/community/posts/${post.id}`} style={{ fontSize: "0.875rem" }}>
            {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [compose, setCompose] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (loadCursor?: string, append = false) => {
    const data = await api.getFeed(loadCursor);
    setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
    setNextCursor(data.nextCursor);
  }, []);

  useEffect(() => {
    api
      .me()
      .then(() => loadFeed())
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load feed");
      })
      .finally(() => setLoading(false));
  }, [loadFeed, router]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!compose.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await api.createPost({ body: compose.trim() });
      setCompose("");
      await loadFeed();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    try {
      const res = await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByViewer: res.liked, likeCount: res.likeCount }
            : p,
        ),
      );
    } catch {
      /* ignore */
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadFeed(nextCursor, true);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Community">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Community">
      <Card>
        <CardContent>
          <CardTitle>Community</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            Share learnings and project work with other product professionals.
          </p>
          <form onSubmit={submitPost} style={{ marginTop: 16 }}>
            <Label htmlFor="compose">New post</Label>
            <textarea
              id="compose"
              value={compose}
              onChange={(e) => setCompose(e.target.value)}
              rows={4}
              placeholder="What did you learn this week?"
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--pp-border)",
                fontFamily: "inherit",
              }}
              maxLength={5000}
            />
            <Button type="submit" disabled={posting || !compose.trim()} style={{ marginTop: 12 }}>
              {posting ? "Posting…" : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Be the first to share something." />
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={handleLike} />)
        )}
      </div>

      {nextCursor ? (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </CandidateAppShell>
  );
}
