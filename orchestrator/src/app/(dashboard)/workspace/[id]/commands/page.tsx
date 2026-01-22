"use client";

import { use } from "react";
import { CommandsDocumentation } from "./CommandsDocumentation";

export default function CommandsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: workspaceId } = use(params);
  return <CommandsDocumentation workspaceId={workspaceId} />;
}
