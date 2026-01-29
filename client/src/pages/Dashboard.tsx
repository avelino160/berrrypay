import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import { Loader2, TrendingUp, DollarSign, CheckCircle, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const [, setLocation] = useLocation();

  // Mock chart data - in a real app this would come from an API
  const chartData = [
    { name: '01/01', sales: 0 },
    { name: '05/01', sales: 0 },
    { name: '10/01', sales: 0 },
    { name: '15/01', sales: 0 },
    { name: '20/01', sales: 0 },
    { name: '25/01', sales: 0 },
    { name: '29/01', sales: 0 },
  ];

  const dateRangeLabel = "01/01 - 29/01";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Visão geral das suas vendas">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-zinc-700 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Vendas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.salesToday || 0)}
            </div>
            <p className="text-xs text-zinc-500">0 venda(s) hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-zinc-700 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Faturamento (Pago)</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.revenuePaid || 0)}
            </div>
            <p className="text-xs text-zinc-500">0 venda(s) confirmadas</p>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-zinc-700 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Vendas Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-zinc-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{stats?.salesApproved || 0}</div>
            <p className="text-xs text-zinc-500">Transações aprovadas (pago)</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-zinc-500" />
             <CardTitle className="text-base font-bold text-white tracking-tight">Faturamento do Período</CardTitle>
          </div>
          <p className="text-xs text-zinc-500" data-testid="text-date-range">{dateRangeLabel}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
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
