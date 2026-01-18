import { ProjectDetailPage } from "./ProjectDetailPage";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  return <ProjectDetailPage projectId={id} />;
}
