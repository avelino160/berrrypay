import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, CreditCard, User, BarChart3, Wallet, Shield, Bell, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

import paypalLogo from "@assets/paypal-logo-icon-png_44635_1769721723658.jpg";

export default function Settings() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const activeTab = searchParams.get("tab") || "gateway";

  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    paypalClientId: "",
    paypalClientSecret: "",
    paypalWebhookId: "",
    environment: "production"
  });

  useEffect(() => {
    if (settings) {
      setForm({
        paypalClientId: settings.paypalClientId || "",
        paypalClientSecret: settings.paypalClientSecret || "",
        paypalWebhookId: settings.paypalWebhookId || "",
        environment: "production"
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form);
      toast({ title: "Configurações salvas", description: "Suas credenciais foram atualizadas com sucesso." });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar as alterações.", variant: "destructive" });
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const renderGateway = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg mb-8">
        <CardHeader className="border-b border-zinc-800/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-zinc-800/50 overflow-hidden p-1.5">
              <img src={paypalLogo} alt="PayPal" className="w-full h-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">PayPal Gateway</CardTitle>
              <CardDescription className="text-zinc-500">
                Configure suas credenciais de API do PayPal para processar pagamentos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Client ID</label>
            <Input 
              className="bg-zinc-900 border-zinc-800 font-mono text-xs" 
              value={form.paypalClientId}
              onChange={(e) => setForm({...form, paypalClientId: e.target.value})}
              placeholder="Ex: Ad3s8..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Client Secret</label>
            <Input 
              type="password"
              className="bg-zinc-900 border-zinc-800 font-mono text-xs" 
              value={form.paypalClientSecret}
              onChange={(e) => setForm({...form, paypalClientSecret: e.target.value})}
              placeholder="••••••••••••••••••••••••"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-400">Webhook ID (Opcional)</label>
              {form.paypalWebhookId && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  CONECTADO
                </div>
              )}
            </div>
            <Input 
              className="bg-zinc-900 border-zinc-800 font-mono text-xs" 
              value={form.paypalWebhookId}
              onChange={(e) => setForm({...form, paypalWebhookId: e.target.value})}
              placeholder="Ex: 4JH..."
            />
            <p className="text-xs text-zinc-600">
              Necessário para atualizações de status de pagamento em tempo real.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={updateSettings.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0"
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Gateway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsuario = () => (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#18181b] border-zinc-800/60 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">Perfil</h3>
              <p className="text-xs text-zinc-500">Dados da conta</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Username</label>
              <div className="p-2 bg-zinc-900 rounded-lg text-sm text-zinc-300 border border-zinc-800">
                admin
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs h-9 border-zinc-800 hover:bg-zinc-800">Editar Perfil</Button>
          </div>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800/60 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">Segurança</h3>
              <p className="text-xs text-zinc-500">Senha e acessos</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 italic">Último acesso: hoje, às 14:30</p>
            <Button variant="outline" className="w-full text-xs h-9 border-zinc-800 hover:bg-zinc-800">Alterar Senha</Button>
          </div>
        </Card>
      </div>

      <Card className="bg-[#18181b] border-zinc-800/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-zinc-400" />
            <CardTitle className="text-base text-white">Notificações</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
              <div>
                <p className="text-sm font-bold text-zinc-200">Alertas de Vendas</p>
                <p className="text-xs text-zinc-500">Receba avisos de novos pedidos pagos</p>
              </div>
              <div className="w-10 h-5 bg-purple-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
              <div>
                <p className="text-sm font-bold text-zinc-200">Webhook Status</p>
                <p className="text-xs text-zinc-500">Avisar se o gateway falhar</p>
              </div>
              <div className="w-10 h-5 bg-zinc-800 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricas = () => (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#18181b] border-zinc-800/60 p-6 flex flex-col items-center text-center">
          <BarChart3 className="w-8 h-8 text-purple-500 mb-3" />
          <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Conversão Total</h4>
          <p className="text-2xl font-black text-white">4.2%</p>
          <span className="text-[10px] text-emerald-500 font-bold mt-1">+0.8% este mês</span>
        </Card>
        <Card className="bg-[#18181b] border-zinc-800/60 p-6 flex flex-col items-center text-center">
          <History className="w-8 h-8 text-blue-500 mb-3" />
          <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Tempo Médio Pago</h4>
          <p className="text-2xl font-black text-white">45s</p>
          <span className="text-[10px] text-zinc-500 font-bold mt-1">Checkout ultrarrápido</span>
        </Card>
        <Card className="bg-[#18181b] border-zinc-800/60 p-6 flex flex-col items-center text-center">
          <CreditCard className="w-8 h-8 text-orange-500 mb-3" />
          <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Taxa de Aprovação</h4>
          <p className="text-2xl font-black text-white">98.5%</p>
          <span className="text-[10px] text-emerald-500 font-bold mt-1">Alta performance</span>
        </Card>
      </div>

      <Card className="bg-[#18181b] border-zinc-800/60">
        <CardHeader className="border-b border-zinc-800/50">
          <CardTitle className="text-white text-base">Relatórios Detalhados</CardTitle>
          <CardDescription>Visualize o desempenho por produto e período.</CardDescription>
        </CardHeader>
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <BarChart3 size={32} />
          </div>
          <div>
            <p className="text-white font-bold">Aguardando mais dados</p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
              Os relatórios avançados de métricas estarão disponíveis assim que você atingir suas primeiras 50 vendas.
            </p>
          </div>
          <Button variant="outline" className="border-zinc-800 text-xs">Agendar Demonstração</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout 
      title={activeTab === "gateway" ? "Configurações de Gateway" : activeTab === "usuario" ? "Perfil do Usuário" : "Métricas do Sistema"} 
      subtitle={activeTab === "gateway" ? "Gerencie suas credenciais de pagamento" : activeTab === "usuario" ? "Personalize sua conta e segurança" : "Acompanhe a performance do seu negócio"}
    >
      <div className="flex flex-col gap-6">
        {/* Tab Selection Header (Desktop Only maybe, but useful for context) */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl w-fit">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.pushState({}, "", "/settings?tab=gateway")}
            className={cn("h-8 px-4 rounded-lg text-xs font-bold transition-all", activeTab === "gateway" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500")}
          >
            <Wallet className="w-3 h-3 mr-2" /> Gateway
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.pushState({}, "", "/settings?tab=usuario")}
            className={cn("h-8 px-4 rounded-lg text-xs font-bold transition-all", activeTab === "usuario" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500")}
          >
            <User className="w-3 h-3 mr-2" /> Usuário
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.pushState({}, "", "/settings?tab=metricas")}
            className={cn("h-8 px-4 rounded-lg text-xs font-bold transition-all", activeTab === "metricas" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500")}
          >
            <BarChart3 className="w-3 h-3 mr-2" /> Métricas
          </Button>
        </div>

        {activeTab === "gateway" && renderGateway()}
        {activeTab === "usuario" && renderUsuario()}
        {activeTab === "metricas" && renderMetricas()}
      </div>
    </Layout>
  );
}
