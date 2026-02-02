"use client";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-28 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-md px-8 flex items-center justify-between w-full shrink-0">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-lg text-zinc-500 mt-1">{subtitle}</p>}
      </div>
    </header>
  );
}
