import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import { Loader2, TrendingUp, CheckCircle, BarChart3, Eye, EyeOff, PackageX } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [, setLocation] = useLocation();
  const [showSales, setShowSales] = useState(true);
  const [showQty, setShowQty] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Mock data generation based on filters
  const chartData = useMemo(() => {
    const days = parseInt(selectedPeriod) || 30;
    const data = [];
    const now = new Date();
    
    // Varying data based on product and period
    const baseValue = selectedProduct === "all" ? 100 : (parseInt(selectedProduct) * 50) % 200;
    
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const name = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Pseudo-random but deterministic sales based on product and day
      const dayFactor = (i % 7) + 1;
      const sales = Math.floor(baseValue * dayFactor * (selectedPeriod === "7" ? 1.5 : 1));
      
      data.push({ name, sales });
    }
    return data;
  }, [selectedProduct, selectedPeriod]);

  if (statsLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Visão geral das suas vendas">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-end justify-end gap-3 mb-6">
        <div className="w-full sm:w-48">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="bg-[#18181b] border-zinc-800 text-zinc-400 h-10">
              <SelectValue placeholder="Produtos" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181b] border-zinc-800 text-white">
              <SelectItem value="all">Todos os produtos</SelectItem>
              {products && products.length > 0 ? (
                products.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
                  <PackageX className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-500 font-medium">Nenhum registro encontrado</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <div className="relative">
            <span className="absolute -top-2.5 left-3 px-1 bg-[#09090b] text-[10px] text-zinc-500 z-10 font-medium uppercase tracking-wider">Período</span>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-[#18181b] border-zinc-800 text-white h-10">
                <SelectValue placeholder="Últimos 30 dias" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-zinc-800 text-white">
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-zinc-400 tracking-wider">Vendas realizadas</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-white transition-colors"
              onClick={() => setShowSales(!showSales)}
              data-testid="button-toggle-sales-visibility"
            >
              {showSales ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-bold text-white mb-0.5">
              {showSales 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.salesToday || 0)
                : "••••••"
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md" />
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-zinc-400 tracking-wider">Quantidade de vendas</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-white transition-colors"
              onClick={() => setShowQty(!showQty)}
              data-testid="button-toggle-qty-visibility"
            >
              {showQty ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-xl font-bold text-white mb-0.5">
              {showQty ? (stats?.salesApproved || 0) : "••••"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
             <CardTitle className="text-base font-bold text-white tracking-tight">Faturamento do Período</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  tick={{fill: '#71717a', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#52525b" 
                  tick={{fill: '#71717a', fontSize: 12}} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `R$${value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
