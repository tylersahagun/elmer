type ReusableThread = {
  isArchived?: boolean;
  contextEntityType?: string | null;
  contextEntityId?: string | null;
  title?: string | null;
  model?: string | null;
};

export function deriveThreadTitle(content: string, maxLength = 48) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "New conversation";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getThreadContextLabel(contextEntityType?: string | null) {
  switch (contextEntityType) {
    case "project":
      return "Project";
    case "job":
      return "Run";
    case "document":
      return "Doc";
    case "signal":
      return "Signal";
    default:
      return null;
  }
}

export function findReusableContextThread<T extends ReusableThread>(
  threads: T[],
  contextEntityType: string,
  contextEntityId: string,
) {
  return threads.find(
    (thread) =>
      !thread.isArchived &&
      thread.contextEntityType === contextEntityType &&
      thread.contextEntityId === contextEntityId,
  );
}

export function shouldRetitleThread(
  existingTitle?: string | null,
  nextTitle?: string | null,
) {
  return Boolean(
    existingTitle === "New conversation" &&
      nextTitle &&
      nextTitle !== existingTitle,
  );
}
