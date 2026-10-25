import Preview from "@/components/Preview";
export default async function PublicAgent({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-8">
      <span className="wordmark text-xl">Spicy</span>
      <div className="flex-1"><Preview agentId={agentId} demo={agentId === "demo"} /></div>
      <p className="text-center text-xs text-neutral-500">Built with Spicy</p>
    </main>
  );
}