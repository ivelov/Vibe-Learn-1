"use client";

import dynamic from "next/dynamic";
import { BoardProvider } from "@/context/BoardContext";

const Board = dynamic(() => import("@/components/Board").then((mod) => mod.Board), {
  ssr: false,
});

export default function Home() {
  return (
    <BoardProvider>
      <Board />
    </BoardProvider>
  );
}
