import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 0, 29),
  });

  return (
    <header className="h-16 border-b border-zinc-800/50 bg-[#09090b] px-6 flex items-center justify-between w-full shrink-0">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-zinc-800 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-700">
            AV
          </div>
          <span className="text-xs text-zinc-400 font-medium">avelinochissico0000@gmail.com</span>
        </div>
      </div>
    </header>
  );
}
