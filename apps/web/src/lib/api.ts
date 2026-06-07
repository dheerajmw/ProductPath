import { getApiBaseUrl, REMOTE_API_URL } from "./api-url";
import { authDebug } from "./auth-debug";

export { getApiBaseUrl, REMOTE_API_URL as API_URL };

function assertProductionApiUrl() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (/localhost|127\.0\.0\.1/.test(REMOTE_API_URL)) {
    console.error(
      "[ProductPath] NEXT_PUBLIC_API_URL points at localhost in production. " +
        "Deploy apps/api (see docs/vercel-production.md) and set NEXT_PUBLIC_API_URL on Vercel.",
    );
  }
}

assertProductionApiUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

function createNetworkError(): ApiError {
  const base = getApiBaseUrl();
  const isLocalApi = /localhost|127\.0\.0\.1/.test(REMOTE_API_URL);
  const hint = isLocalApi
    ? "Start the API locally (pnpm dev) or set NEXT_PUBLIC_API_URL on Vercel."
    : "The API may be waking up on Render (wait 30–60s and retry). If this persists, confirm NEXT_PUBLIC_API_URL and redeploy Vercel.";
  return new ApiError(`Cannot reach the API at ${base}. ${hint}`, 0, "NETWORK_ERROR");
}

function createHttpError(res: Response, data: Record<string, unknown>): ApiError {
  const status = res.status;
  const code = typeof data.code === "string" ? data.code : undefined;
  const serverMessage = typeof data.error === "string" ? data.error : "Request failed";

  if (status === 401) {
    return new ApiError(
      serverMessage === "Authentication required" ? "Please log in to continue." : serverMessage,
      401,
      code ?? "UNAUTHORIZED",
      data,
    );
  }

  if (status >= 500) {
    return new ApiError("Server error — please try again in a moment.", status, code ?? "SERVER_ERROR", data);
  }

  return new ApiError(serverMessage, status, code, data);
}

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  return res.json().catch(() => ({}));
}

/** Public connectivity check — uses GET /health (never a protected route). */
export async function checkApiReachable(): Promise<{
  ok: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      return {
        ok: false,
        error: `Health check returned HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      status: typeof data.status === "string" ? data.status : "ok",
    };
  } catch {
    return { ok: false, error: createNetworkError().message };
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw createNetworkError();
  }

  const data = await parseJsonResponse(res);

  if (path === "/auth/me" || path === "/auth/login") {
    authDebug({
      event: `api:${path}`,
      detail: `status=${res.status} base=${base}`,
      isAuthenticated: res.ok,
    });
  }

  if (!res.ok) {
    throw createHttpError(res, data);
  }

  return data as T;
}

export const api = {
  signup: (body: { email: string; password: string; displayName?: string }) =>
    request<{ user: unknown; message: string; devVerifyUrl?: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),

  me: () => request<{ user: User }>("/auth/me"),

  verifyEmail: (token: string) =>
    request<{ user: User }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    request<{ message: string; devVerifyUrl?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  roles: () => request<{ roles: ProductRole[] }>("/roles"),

  selectRole: (roleId: string, confirmArchive?: boolean) =>
    request<{ role: ProductRole }>("/candidates/me/role", {
      method: "POST",
      body: JSON.stringify({ roleId, confirmArchive }),
    }),

  getRoadmap: () => request<RoadmapResponse>("/candidates/me/roadmap"),

  getProgress: () => request<{ progress: LearningProgress }>("/candidates/me/progress"),

  getModule: (id: string) => request<ModuleDetailResponse>(`/modules/${id}`),

  toggleResource: (moduleId: string, resourceId: string, completed: boolean) =>
    request<ModuleDetailResponse>(`/modules/${moduleId}/resources/${resourceId}/toggle`, {
      method: "POST",
      body: JSON.stringify({ completed }),
    }),

  completeModule: (moduleId: string) =>
    request<ModuleDetailResponse>(`/modules/${moduleId}/complete`, { method: "POST" }),

  getAssessmentHub: () => request<AssessmentHubResponse>("/assessments/hub"),

  startAssessment: (assessmentId: string) =>
    request<AttemptStateResponse>(`/assessments/${assessmentId}/attempts`, { method: "POST" }),

  getAttempt: (attemptId: string) => request<AttemptStateResponse>(`/attempts/${attemptId}`),

  saveAnswer: (attemptId: string, body: { questionId: string; selectedIndex: number; currentQuestionIndex?: number }) =>
    request<AttemptStateResponse>(`/attempts/${attemptId}/answers`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  submitAttempt: (attemptId: string) =>
    request<AssessmentResultResponse>(`/attempts/${attemptId}/submit`, { method: "POST" }),

  getAttemptResult: (attemptId: string) =>
    request<AssessmentResultResponse>(`/attempts/${attemptId}/result`),

  getGaps: () => request<GapsResponse>("/candidates/me/gaps"),

  getRecommendations: () => request<RecommendationsResponse>("/candidates/me/recommendations"),

  refreshRecommendations: () =>
    request<RecommendationsResponse>("/candidates/me/recommendations/refresh", { method: "POST" }),

  getSkillDevelopment: () => request<SkillDevelopmentResponse>("/candidates/me/skill-development"),

  getAssessmentHistory: () =>
    request<{ results: AssessmentResultSummary[] }>("/candidates/me/assessments/results"),

  getProjectTemplates: () => request<ProjectTemplatesResponse>("/projects/templates"),

  getProjectTemplate: (slug: string) =>
    request<{ template: ProjectTemplateDetail }>(`/projects/templates/${slug}`),

  getVerification: () => request<VerificationResponse>("/candidates/me/verification"),

  refreshVerification: () =>
    request<VerificationResponse>("/candidates/me/verification/refresh", { method: "POST" }),

  getPublicProfile: (userId: string) =>
    request<{ profile: PublicCandidateProfile }>(`/candidates/${userId}/public`),

  getMySubmissions: () => request<{ submissions: ProjectSubmissionSummary[] }>("/candidates/me/submissions"),

  getProjectSubmission: (id: string) => request<ProjectSubmissionDetailResponse>(`/projects/submissions/${id}`),

  createProjectSubmission: (body: { templateId: string; title?: string; narrative?: string }) =>
    request<{ submission: ProjectSubmissionSummary }>("/projects/submissions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProjectSubmission: (
    id: string,
    body: { title?: string; narrative?: string; artifactUrls?: { type: "URL"; name: string; url: string }[] },
  ) =>
    request<{ submission: ProjectSubmissionSummary }>(`/projects/submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  submitProject: (id: string) =>
    request<{ submission: ProjectSubmissionSummary }>(`/projects/submissions/${id}/submit`, {
      method: "POST",
    }),

  resubmitProject: (id: string) =>
    request<{ submission: ProjectSubmissionSummary }>(`/projects/submissions/${id}/resubmit`, {
      method: "POST",
    }),

  async uploadProjectFile(submissionId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    let res: Response;
    try {
      res = await fetch(`${getApiBaseUrl()}/projects/submissions/${submissionId}/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
    } catch {
      throw createNetworkError();
    }
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw createHttpError(res, data);
    }
    return data as { submission: ProjectSubmissionSummary };
  },

  health: () => request<{ status: string }>("/health"),

  getDiscoverySettings: () =>
    request<DiscoverySettingsResponse>("/candidates/me/discovery"),

  updateDiscovery: (discoverable: boolean) =>
    request<DiscoverySettingsResponse>("/candidates/me/discovery", {
      method: "PATCH",
      body: JSON.stringify({ discoverable }),
    }),

  getMyInterests: () => request<InterestListResponse>("/candidates/me/interests"),

  respondToInterest: (id: string, action: "accept" | "decline") =>
    request<InterestActionResponse>(`/interest-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),

  recruiterSignup: (body: {
    email: string;
    password: string;
    company: string;
    companyDomain?: string;
  }) =>
    request<{ user: unknown; verificationPending: boolean }>("/recruiters/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getRecruiterMe: () => request<RecruiterMeResponse>("/recruiters/me"),

  searchTalent: (params?: { roleSlug?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.roleSlug) qs.set("roleSlug", params.roleSlug);
    if (params?.q) qs.set("q", params.q);
    const query = qs.toString();
    return request<TalentSearchResponse>(`/recruiters/talent${query ? `?${query}` : ""}`);
  },

  getRecruiterCandidate: (id: string) =>
    request<RecruiterCandidateResponse>(`/recruiters/candidates/${id}`),

  sendInterest: (candidateId: string, message: string) =>
    request<{ interest: InterestSummary }>("/interest-requests", {
      method: "POST",
      body: JSON.stringify({ candidateId, message }),
    }),

  getRecruiterInterests: () => request<InterestListResponse>("/recruiters/me/interests"),

  getFeed: (cursor?: string) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return request<FeedResponse>(`/feed${qs}`);
  },

  createPost: (body: {
    type?: "TEXT" | "PROJECT_SHARE";
    body: string;
    projectSubmissionId?: string;
  }) =>
    request<{ post: CommunityPost }>("/posts", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getCommunityPost: (id: string) => request<CommunityPostDetailResponse>(`/posts/${id}`),

  addComment: (postId: string, body: { body: string; parentId?: string }) =>
    request<{ comment: CommunityComment }>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  toggleLike: (postId: string) =>
    request<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
      method: "POST",
    }),

  reportContent: (body: { targetType: "POST" | "COMMENT"; targetId: string; reason: string }) =>
    request<{ report: { id: string; status: string } }>("/reports", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export type User = {
  id: string;
  email: string;
  platformRole: string;
  emailVerified: boolean;
  createdAt: string;
  candidateProfile?: {
    displayName: string | null;
    activeRoleId: string | null;
    activeRole?: ProductRole | null;
  } | null;
  recruiterProfile?: {
    company: string;
    companyDomain: string | null;
    verified: boolean;
  } | null;
};

export type ProductRole = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type LearningProgress = {
  completedModules: number;
  totalModules: number;
  percent: number;
  label: string;
  hiringReadiness: boolean;
};

export type RoadmapModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  status: string;
  prerequisitesMet: boolean;
  locked: boolean;
  requiredResourcesTotal: number;
  requiredResourcesCompleted: number;
  prerequisites: { id: string; title: string }[];
};

export type RoadmapResponse = {
  roadmap: { id: string; title: string; description: string | null; version: number };
  role: ProductRole;
  modules: RoadmapModule[];
  progress: LearningProgress;
};

export type ModuleResource = {
  id: string;
  title: string;
  type: string;
  url: string | null;
  content: string | null;
  required: boolean;
  sortOrder: number;
  completed: boolean;
};

export type ModuleDetailResponse = {
  module: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    prerequisitesMet: boolean;
    locked: boolean;
    status: string;
  };
  resources: ModuleResource[];
  canComplete: boolean;
  prerequisites: { id: string; title: string }[];
};

export type AssessmentHubResponse = {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    version: number;
  };
  role: ProductRole;
  learningGate: {
    progressPercent: number;
    warn: boolean;
    blocked: boolean;
    warnThreshold: number;
    blockThreshold: number;
  };
  retake: {
    attemptsUsed: number;
    maxAttempts: number;
    cooldownEndsAt: string | null;
    canStart: boolean;
  };
  activeAttempt: { id: string; expiresAt: string } | null;
  latestResult: {
    id: string;
    overallScore: number;
    passed: boolean;
    createdAt: string;
    attemptId: string;
  } | null;
};

export type AttemptQuestion = {
  id: string;
  prompt: string;
  options: string[];
  sortOrder: number;
  answered: boolean;
  selectedIndex: number | null;
};

export type AttemptStateResponse = {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    expiresAt: string;
    secondsRemaining: number;
    currentQuestionIndex: number;
  };
  assessment: { title: string; durationMinutes: number };
  questions: AttemptQuestion[];
};

export type AssessmentResultResponse = {
  result: {
    id: string;
    attemptId: string;
    overallScore: number;
    passed: boolean;
    createdAt: string;
    assessmentTitle: string;
  };
  scoresBySkill: {
    skillId: string;
    skillName: string;
    skillSlug: string;
    score: number;
  }[];
  gaps: {
    skillId: string;
    skillName: string;
    skillSlug: string;
    score: number;
    floor: number;
    gap: number;
  }[];
};

export type GapsResponse = {
  gaps: AssessmentResultResponse["gaps"];
  overallScore: number;
  passed: boolean;
  latestResultId: string;
  latestAttemptId: string;
};

export type AssessmentResultSummary = {
  id: string;
  attemptId: string;
  overallScore: number;
  passed: boolean;
  createdAt: string;
  assessmentTitle: string;
};

export type RecommendedModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  completed: boolean;
};

export type SkillRecommendation = {
  skillId: string;
  skillName: string;
  skillSlug: string;
  score: number;
  floor: number;
  gap: number;
  modules: RecommendedModule[];
  emptyContent: boolean;
};

export type RecommendationsResponse = {
  sourceAttemptId: string;
  latestResultId: string;
  overallScore: number;
  passed: boolean;
  gaps: GapsResponse["gaps"];
  recommendations: SkillRecommendation[];
  retakeNote: string;
};

export type ProjectTemplateCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  instructions: string;
  sortOrder: number;
  latestSubmission: { id: string; status: string; version: number } | null;
};

export type ProjectTemplatesResponse = {
  templates: ProjectTemplateCard[];
};

export type ProjectTemplateDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  instructions: string;
  rubric: unknown;
};

export type ProjectSubmissionSummary = {
  id: string;
  templateId: string;
  templateSlug?: string;
  templateTitle?: string;
  roleId: string;
  version: number;
  status: string;
  title: string | null;
  narrative: string | null;
  artifacts: { type: string; name: string; url: string }[];
  parentId: string | null;
  submittedAt: string | null;
  lockedAt: string | null;
  editable: boolean;
  latestReview: {
    id: string;
    decision: string;
    feedback: string;
    rubricScores: unknown;
    createdAt: string;
  } | null;
};

export type ProjectSubmissionDetailResponse = {
  submission: ProjectSubmissionSummary;
  template: ProjectTemplateDetail & { instructions: string; rubric: { criteria: { key: string; label: string; required: boolean; maxScore: number }[] } };
};

export type VerificationChecklistItem = {
  key: string;
  label: string;
  met: boolean;
  detail: string;
};

export type DiscoverySettingsResponse = {
  discoverable: boolean;
  eligible: boolean;
  role: ProductRole | null;
  verificationState: string;
};

export type InterestSummary = {
  id: string;
  recruiterId: string;
  candidateId: string;
  message: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  recruiter?: { company: string; verified: boolean };
  candidate?: { displayName: string };
  connection?: {
    contactRevealedAt: string;
    recruiterEmail?: string;
    candidateEmail?: string;
  } | null;
};

export type InterestListResponse = { interests: InterestSummary[] };

export type InterestActionResponse = {
  interest: InterestSummary;
  connection?: {
    contactRevealedAt: string;
    recruiter: { email: string; company: string | null };
    candidate: { email: string; displayName: string | null };
  };
};

export type TalentSearchResponse = {
  candidates: {
    id: string;
    displayName: string | null;
    role: ProductRole;
    verificationState: string;
    validUntil: string | null;
    overallScore: number | null;
    approvedProjects: number;
  }[];
  total: number;
};

export type RecruiterMeResponse = {
  company: string | null;
  companyDomain: string | null;
  verified: boolean;
  email: string;
  emailVerified: boolean;
};

export type RecruiterCandidateResponse = {
  candidate: {
    id: string;
    displayName: string | null;
    role: ProductRole;
    verification: { state: string | undefined; validUntil: string | null };
    evidence: {
      latestAssessmentScore: number | null;
      passed: boolean;
      approvedProjects: number;
    };
    hasPendingInterest: boolean;
  };
};

export type VerificationResponse = {
  state: string;
  stateLabel: string;
  role: ProductRole;
  grantedAt: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  expiringSoon: boolean;
  expired: boolean;
  policyVersion: number;
  discoverable: boolean;
  discoveryEligible?: boolean;
  checklist: VerificationChecklistItem[];
  badges: {
    emergingTalent: boolean;
    interviewReady: boolean;
    verifiedProfessional: boolean;
  };
};

export type PublicCandidateProfile = {
  id: string;
  displayName: string | null;
  role: ProductRole;
  verification: {
    state: string;
    stateLabel: string;
    validUntil: string | null;
    interviewReady: boolean;
    verifiedProfessional: boolean;
    discoverable: boolean;
  };
};

export type ProjectShareMeta = {
  submissionId: string;
  title: string | null;
  status: string;
  verified: boolean;
  label: string;
};

export type CommunityPost = {
  id: string;
  type: string;
  body: string;
  status: string;
  author: { id: string; displayName: string };
  projectShare: ProjectShareMeta | null;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
  isAuthor: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  author: { id: string; displayName: string };
  replies: CommunityComment[];
  createdAt: string;
};

export type FeedResponse = {
  posts: CommunityPost[];
  nextCursor: string | null;
};

export type CommunityPostDetailResponse = {
  post: CommunityPost;
  comments: CommunityComment[];
};

export type SkillDevelopmentResponse = {
  summary: {
    openGaps: number;
    inProgress: number;
    modulesCompleted: number;
    hasAssessment: boolean;
    overallScore: number | null;
    passed: boolean | null;
  };
  skills: {
    skillId: string;
    skillName: string;
    skillSlug: string;
    status: string;
    recommendedCompleted: number;
    recommendedTotal: number;
    sourceAttemptId: string;
    updatedAt: string;
  }[];
};
