export function getPostLoginPath(user: {
  platformRole: string;
  candidateProfile?: { activeRoleId: string | null } | null;
}): string {
  if (user.platformRole === "RECRUITER") {
    return "/recruiter/search";
  }
  if (user.platformRole === "ADMIN") {
    return "/dashboard";
  }
  if (!user.candidateProfile?.activeRoleId) {
    return "/onboarding/role";
  }
  return "/dashboard";
}
