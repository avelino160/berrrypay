import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/use-stats";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Produtos", icon: Package },
    { href: "/checkouts", label: "Checkouts", icon: ShoppingCart },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  const { data: stats } = useStats();
  const currentRevenue = stats?.revenuePaid || 0;

  const goals = [
    { label: "10K", value: 10000 },
    { label: "100K", value: 100000 },
    { label: "1M", value: 1000000 },
    { label: "10M", value: 10000000 },
    { label: "100M", value: 100000000 },
    { label: "1B", value: 1000000000 },
  ];

  const currentGoal = goals.find(g => currentRevenue < g.value) || goals[goals.length - 1];
  const progress = Math.min((currentRevenue / currentGoal.value) * 100, 100);

  return (
    <div className="w-80 bg-[#09090b] border-r border-zinc-800 flex flex-col">
      {/* Brand */}
      <div className="p-8 border-b border-zinc-800/50 flex-shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">Berry</span>
          <span className="text-white">Pay</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Plataforma de Vendas</p>
      </div>
      {/* Navigation and Widgets Area - No internal scroll, fixed within flex */}
      <div className="flex-1">
        {/* Revenue Widget */}
        <div className="px-4 py-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-lg shadow-lg shadow-yellow-900/20">
                   <LayoutDashboard className="text-yellow-950 w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-zinc-400 block mb-1 uppercase tracking-wider">Faturamento</span>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-lg font-black text-white whitespace-nowrap">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentRevenue)}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">/ R$ {currentGoal.label}</span>
                  </div>
                </div>
             </div>
             
             <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-zinc-800/50 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-xs font-black text-white tabular-nums">{Math.floor(progress)}%</span>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-2 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-200 text-[17px]",
                    isActive
                      ? "bg-[#8b5cf6] text-white shadow-lg"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  <Icon size={20} strokeWidth={2.5} />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Footer - No fixed positioning */}
      <div className="p-4 border-t border-zinc-800/50 flex-shrink-0">
        <div className="px-2">
          <p className="text-xs text-zinc-500 truncate mb-2">avelinochissico0000@gmail.com</p>
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors border border-zinc-700">
              <LogOut size={16} />
              Sair
            </button>
          </Link>
          <p className="text-[10px] text-zinc-600 text-center mt-3">
            © 2026 BerryPay Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
