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
    <div className="w-80 bg-[#09090b] border-r border-zinc-800 flex flex-col">
      {/* Brand */}
      <div className="p-8 border-b border-zinc-800/50 flex-shrink-0">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Cold</span>
          <span className="text-white">Pay</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Plataforma de Vendas</p>
      </div>

      {/* Navigation and Widgets Area - No internal scroll, fixed within flex */}
      <div className="flex-1">
        {/* Revenue Widget */}
        <div className="px-4 py-4">
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-zinc-400">Faturamento</span>
              <span className="text-xs font-medium text-zinc-400">0%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2">
              <div className="bg-blue-500 h-1.5 rounded-full w-0" />
            </div>
            <div className="flex justify-between items-end">
              <span className="text-lg font-semibold text-white">R$ 0,00</span>
              <span className="text-[10px] text-zinc-500">Meta: R$ 10K</span>
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
                    "w-full flex items-center gap-4 px-5 py-4 rounded-xl text-xl font-bold transition-all duration-200",
                    isActive
                      ? "bg-[#3b82f6] text-white shadow-lg"
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
            © 2026 ColdPay Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
