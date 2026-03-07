import { ControlCenterShell } from "@/components/control-center/ControlCenterShell";

type PageProps = { params: Promise<{ id: string }> };

export default async function ControlCenterPage({ params }: PageProps) {
  const { id } = await params;
  return <ControlCenterShell workspaceId={id} />;
}
