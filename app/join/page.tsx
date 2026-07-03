import { JoinFlow } from "@/components/JoinFlow";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string }>;
}) {
  const { pin } = await searchParams;
  return <JoinFlow initialPin={pin ?? ""} />;
}
