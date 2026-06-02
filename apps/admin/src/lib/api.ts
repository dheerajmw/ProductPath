const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error ?? "Request failed", res.status);
  }
  return data as T;
}

export const adminApi = {
  login: (body: { email: string; password: string }) =>
    request<{ user: AdminUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: AdminUser }>("/auth/me"),

  dashboard: () =>
    request<{
      stats: { users: number; candidates: number; recruiters: number; roles: number; auditCount: number };
      environment: string;
    }>("/admin/dashboard"),

  auditLogs: () => request<{ logs: AuditLog[] }>("/admin/audit-logs?limit=20"),

  featureFlags: () => request<{ flags: FeatureFlag[] }>("/admin/feature-flags"),

  listRoadmaps: () =>
    request<{
      roadmaps: {
        id: string;
        title: string;
        version: number;
        published: boolean;
        role: { slug: string; name: string };
        _count: { modules: number };
      }[];
    }>("/admin/content/roadmaps"),

  listSkillMappings: () =>
    request<{
      mappings: {
        id: string;
        priority: number;
        skill: { name: string; slug: string };
        module: {
          slug: string;
          title: string;
          roadmap: { role: { name: string; slug: string } };
        };
      }[];
    }>("/admin/content/skill-mappings"),

  listPendingRecruiters: () =>
    request<{
      recruiters: {
        id: string;
        userId: string;
        company: string | null;
        companyDomain: string | null;
        user: { id: string; email: string; createdAt: string; emailVerifiedAt: string | null };
      }[];
    }>("/admin/recruiters/pending"),

  verifyRecruiter: (userId: string) =>
    request<{ verified: boolean }>(`/admin/recruiters/${userId}/verify`, { method: "POST" }),

  listModerationReports: () =>
    request<{ reports: ModerationReport[] }>("/admin/moderation/reports"),

  resolveReport: (reportId: string, action: "hide_post" | "dismiss") =>
    request<{ status: string }>(`/admin/moderation/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),

  getRoadmap: (id: string) =>
    request<{
      roadmap: {
        id: string;
        title: string;
        description: string | null;
        modules: {
          id: string;
          title: string;
          slug: string;
          sortOrder: number;
          resources: { id: string; title: string; type: string }[];
        }[];
      };
    }>(`/admin/content/roadmaps/${id}`),
};

export type AdminUser = {
  id: string;
  email: string;
  platformRole: string;
  emailVerified: boolean;
};

export type AuditLog = {
  id: string;
  action: string;
  createdAt: string;
  user?: { email: string; platformRole: string } | null;
};

export type FeatureFlag = { key: string; enabled: boolean; description: string | null };

export type ModerationReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { email: string };
  post: {
    id: string;
    body: string;
    type: string;
    status: string;
    authorDisplay: string;
  } | null;
  targetPreview: string | null;
};
