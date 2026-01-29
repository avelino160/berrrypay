import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";
import { Loader2, TrendingUp, DollarSign, CheckCircle, BarChart3, Plus, Package, ShoppingCart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();
  const [, setLocation] = useLocation();

  // Mock chart data - in a real app this would come from an API
  const chartData = [
    { name: '01/01', sales: 0 },
    { name: '05/01', sales: 450 },
    { name: '10/01', sales: 1200 },
    { name: '15/01', sales: 850 },
    { name: '20/01', sales: 2400 },
    { name: '25/01', sales: 1800 },
    { name: '29/01', sales: 3200 },
  ];

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
            <TrendingUp className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
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
            <DollarSign className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
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
            <CheckCircle className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">{stats?.salesApproved || 0}</div>
            <p className="text-xs text-zinc-500">Transações aprovadas (pago)</p>
          </CardContent>
        </Card>
      </div>

      {/* Criar Agora Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Criar Agora
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setLocation('/products')}
            data-testid="card-create-product"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1">Novo Produto</h3>
                <p className="text-sm text-zinc-400">Adicione um novo produto para vender</p>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-create-product"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#18181b] border-zinc-800/60 shadow-lg hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
            onClick={() => setLocation('/checkouts')}
            data-testid="card-create-checkout"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1">Novo Checkout</h3>
                <p className="text-sm text-zinc-400">Crie uma nova página de checkout</p>
              </div>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-create-checkout"
              >
                <Plus className="w-4 h-4 mr-1" />
                Criar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Section */}
      <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-2">
             <BarChart3 className="w-4 h-4 text-blue-500" />
             <CardTitle className="text-base font-semibold text-white">Faturamento do Período</CardTitle>
          </div>
          <p className="text-xs text-zinc-500">01/01 - 29/01</p>
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
