import { notFound } from "next/navigation";
import { getGameById } from "@/lib/games";
import { GamePlayer } from "@/components/GamePlayer";

export default async function JuegoJugarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameById(id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
