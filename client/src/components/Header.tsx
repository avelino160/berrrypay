import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-20 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        {/* Date Picker (Static visual) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-400">
          <Calendar size={14} className="text-zinc-500" />
          <span>01/01/2026</span>
          <span className="text-zinc-600">-</span>
          <span>29/01/2026</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-6 border-l border-zinc-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">Avelino Chissico</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
          <Avatar className="h-9 w-9 border border-zinc-800">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-blue-600 text-white font-bold">AC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
