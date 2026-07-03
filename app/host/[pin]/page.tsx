import { HostView } from "@/components/HostView";

export default async function HostGamePage({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = await params;
  return <HostView pin={pin} />;
}
