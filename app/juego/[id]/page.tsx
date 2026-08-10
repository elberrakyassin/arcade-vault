import { notFound } from "next/navigation";
import { getGameById } from "@/lib/games";
import { GameDetail } from "@/components/GameDetail";

export default async function JuegoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) notFound();
  return <GameDetail game={game} />;
}
