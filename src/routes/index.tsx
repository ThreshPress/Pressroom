import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/studio/home-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HomeView />;
}
