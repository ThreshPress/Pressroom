import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/editor/workspace";

export const Route = createFileRoute("/project/$id")({
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  return <Workspace projectId={id} />;
}
