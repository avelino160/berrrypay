import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";
import { Loader2, TrendingUp, DollarSign, CheckCircle, BarChart3, Plus, Package, ShoppingCart, Calendar as CalendarIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState("30d");

  // Mock chart data - in a real app this would come from an API
  const allChartData = [
    { name: '01/01', date: new Date(2026, 0, 1), sales: 0 },
    { name: '05/01', date: new Date(2026, 0, 5), sales: 0 },
    { name: '10/01', date: new Date(2026, 0, 10), sales: 0 },
    { name: '15/01', date: new Date(2026, 0, 15), sales: 0 },
    { name: '20/01', date: new Date(2026, 0, 20), sales: 0 },
    { name: '25/01', date: new Date(2026, 0, 25), sales: 0 },
    { name: '29/01', date: new Date(2026, 0, 29), sales: 0 },
  ];

  const filteredData = useMemo(() => {
    const now = new Date(2026, 0, 29); // Consistent with the mock data end date
    let start: Date;

    switch (dateRange) {
      case "7d":
        start = subDays(now, 7);
        break;
      case "15d":
        start = subDays(now, 15);
        break;
      case "this-month":
        start = startOfMonth(now);
        break;
      case "30d":
      default:
        start = subDays(now, 30);
        break;
    }

    return allChartData.filter(d => d.date >= start);
  }, [dateRange]);

  const dateRangeLabel = useMemo(() => {
    if (filteredData.length === 0) return "";
    return `${filteredData[0].name} - ${filteredData[filteredData.length - 1].name}`;
  }, [filteredData]);

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-zinc-500" />
                 <CardTitle className="text-base font-semibold text-white">Faturamento do Período</CardTitle>
              </div>
              <p className="text-xs text-zinc-500" data-testid="text-date-range">{dateRangeLabel}</p>
            </div>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-zinc-300" data-testid="select-date-range">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="15d">Últimos 15 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="this-month">Este mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
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
