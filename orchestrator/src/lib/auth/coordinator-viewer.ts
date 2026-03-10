import type { WorkspaceRole } from "@/lib/permissions";

export const DEFAULT_COORDINATOR_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID ?? "mn7e43jc0m7bc5jn708d3ye4e182a7me";

const DEFAULT_COORDINATOR_VIEWER_EMAILS = [
  "tylersahagun@gmail.com",
  "tyler@askelephant.ai",
  "tyler.sahagun@askelephant.ai",
];
const DEFAULT_COORDINATOR_VIEWER_CLERK_USER_IDS = [
  "user_3AYHC3SLAA3cY6m7Nz7npZqIrF4",
];

function parseCoordinatorViewerEmails() {
  const configured = process.env.COORDINATOR_VIEWER_EMAILS;
  const values = configured
    ? configured.split(",")
    : DEFAULT_COORDINATOR_VIEWER_EMAILS;
  return new Set(
    values
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

const COORDINATOR_VIEWER_EMAILS = parseCoordinatorViewerEmails();

function parseCoordinatorViewerClerkUserIds() {
  const configured = process.env.COORDINATOR_VIEWER_CLERK_USER_IDS;
  const values = configured
    ? configured.split(",")
    : DEFAULT_COORDINATOR_VIEWER_CLERK_USER_IDS;
  return new Set(values.map((value) => value.trim()).filter(Boolean));
}

const COORDINATOR_VIEWER_CLERK_USER_IDS =
  parseCoordinatorViewerClerkUserIds();

export function normalizeViewerEmail(value?: string | null) {
  return value?.trim().toLowerCase() ?? null;
}

export function canUseCoordinatorViewerAccess({
  workspaceId,
  clerkUserId,
  email,
  requiredRole = "viewer",
  convexMembersCount,
}: {
  workspaceId: string;
  clerkUserId?: string | null;
  email?: string | null;
  requiredRole?: WorkspaceRole;
  convexMembersCount: number | null;
}) {
  const normalizedEmail = normalizeViewerEmail(email);
  const normalizedClerkUserId = clerkUserId?.trim() || null;
  const isAllowedIdentity = Boolean(
    (normalizedEmail && COORDINATOR_VIEWER_EMAILS.has(normalizedEmail)) ||
      (normalizedClerkUserId &&
        COORDINATOR_VIEWER_CLERK_USER_IDS.has(normalizedClerkUserId)),
  );

  if (!isAllowedIdentity) return false;

  return (
    requiredRole === "viewer" &&
    workspaceId === DEFAULT_COORDINATOR_WORKSPACE_ID &&
    convexMembersCount === 0 &&
    isAllowedIdentity
  );
}
