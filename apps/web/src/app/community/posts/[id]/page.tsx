"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Alert,
  Spinner,
  Label,
} from "@productpath/ui";
import { api, ApiError, type CommunityComment, type CommunityPost } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function CommentBlock({
  comment,
  onReply,
}: {
  comment: CommunityComment;
  onReply: (parentId: string) => void;
}) {
  return (
    <div style={{ marginLeft: comment.parentId ? 24 : 0, marginTop: 12 }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem" }}>{comment.author.displayName}</p>
      <p style={{ margin: "4px 0", whiteSpace: "pre-wrap", fontSize: "0.9375rem" }}>{comment.body}</p>
      {!comment.parentId ? (
        <button
          type="button"
          onClick={() => onReply(comment.id)}
          style={{
            background: "none",
            border: "none",
            color: "var(--pp-primary)",
            cursor: "pointer",
            fontSize: "0.8125rem",
            padding: 0,
          }}
        >
          Reply
        </button>
      ) : null}
      {comment.replies.map((r) => (
        <CommentBlock key={r.id} comment={r} onReply={onReply} />
      ))}
    </div>
  );
}

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    return api.getCommunityPost(id).then((res) => {
      setPost(res.post);
      setComments(res.comments);
    });
  }

  useEffect(() => {
    api
      .me()
      .then(() => load())
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setError(null);
    try {
      await api.addComment(id, { body: commentBody.trim(), parentId: replyTo ?? undefined });
      setCommentBody("");
      setReplyTo(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not comment");
    }
  }

  async function toggleLike() {
    if (!post) return;
    try {
      const res = await api.toggleLike(post.id);
      setPost({ ...post, likedByViewer: res.liked, likeCount: res.likeCount });
    } catch {
      /* ignore */
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.reportContent({
        targetType: "POST",
        targetId: id,
        reason: reportReason.trim(),
      });
      setMessage("Report submitted. Our moderators will review it.");
      setShowReport(false);
      setReportReason("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit report");
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Community">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!post) {
    return (
      <CandidateAppShell title="Community">
        <Alert variant="error">{error ?? "Post not found"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Community">
      <p style={{ marginBottom: 16 }}>
        <Link href="/community">← Back to feed</Link>
      </p>

      <Card>
        <CardContent>
          <CardTitle>{post.author.displayName}</CardTitle>
          {post.projectShare ? (
            <p
              style={{
                marginTop: 8,
                fontSize: "0.8125rem",
                color: post.projectShare.verified ? "green" : "var(--pp-muted)",
                fontWeight: 600,
              }}
            >
              {post.projectShare.label}
            </p>
          ) : null}
          <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{post.body}</p>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Button size="sm" variant="secondary" onClick={toggleLike}>
              {post.likedByViewer ? "Unlike" : "Like"} ({post.likeCount})
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReport((v) => !v)}>
              Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReport ? (
        <Card style={{ marginTop: 16 }}>
          <CardContent>
            <form onSubmit={submitReport}>
              <Label htmlFor="reason">Why are you reporting this post?</Label>
              <textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                minLength={10}
                required
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--pp-border)",
                }}
              />
              <Button type="submit" size="sm" style={{ marginTop: 12 }}>
                Submit report
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="info">{message}</Alert>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Card style={{ marginTop: 16 }}>
        <CardContent>
          <CardTitle>Comments</CardTitle>
          <form onSubmit={submitComment} style={{ marginTop: 12 }}>
            {replyTo ? (
              <p style={{ fontSize: "0.875rem", color: "var(--pp-muted)" }}>
                Replying…{" "}
                <button type="button" onClick={() => setReplyTo(null)}>
                  Cancel
                </button>
              </p>
            ) : null}
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={3}
              placeholder="Add a comment"
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--pp-border)",
              }}
            />
            <Button type="submit" size="sm" style={{ marginTop: 8 }} disabled={!commentBody.trim()}>
              Comment
            </Button>
          </form>
          <div style={{ marginTop: 16 }}>
            {comments.map((c) => (
              <CommentBlock key={c.id} comment={c} onReply={setReplyTo} />
            ))}
          </div>
        </CardContent>
      </Card>
    </CandidateAppShell>
  );
}
