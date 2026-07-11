import { Chat } from "@/components/chat/chat";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex-1">
      <div className="aurora" aria-hidden>
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="grid-dots" />
      </div>

      <div className="fixed left-4 top-3 z-10 sm:left-6">
        <ThemeToggle />
      </div>

      <Chat />
    </main>
  );
}
