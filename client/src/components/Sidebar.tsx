import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Produtos", icon: Package },
    { href: "/checkouts", label: "Checkouts", icon: ShoppingCart },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col">
      {/* Brand */}
      <div className="p-5 border-b border-zinc-800/50 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-blue-500">Cold</span>
          <span className="text-white">Pay</span>
        </h1>
        <p className="text-[10px] text-zinc-500 mt-1">Plataforma de Vendas</p>
      </div>

      {/* Navigation and Widgets Area - No internal scroll, fixed within flex */}
      <div className="flex-1">
        {/* Revenue Widget */}
        <div className="px-4 py-5">
          <div className="bg-zinc-900/50 rounded-lg p-3.5 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                <LayoutDashboard className="w-3.5 h-3.5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-zinc-500 block leading-tight">Faturamento</span>
                <span className="text-[13px] font-bold text-white leading-tight">R$ 0,00 / R$ 10K</span>
              </div>
              <span className="text-[10px] text-zinc-500">0%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full w-0" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#0ea5e9] text-white shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer - No fixed positioning */}
      <div className="p-4 mt-auto">
        <div className="px-2">
          <p className="text-[10px] text-zinc-600 truncate mb-3">avelinochissico0000@gmail.com</p>
          <Link href="/">
            <button className="flex items-center gap-2 text-xs font-medium text-white hover:text-zinc-300 transition-colors">
              <LogOut size={14} />
              Sair
            </button>
          </Link>
          <p className="text-[9px] text-zinc-800 text-center mt-4">
            © 2026 ColdPay
          </p>
        </div>
      </div>
    </div>
  );
}
