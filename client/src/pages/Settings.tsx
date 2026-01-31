import { useEffect, useState, useMemo } from "react";
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
import { useQuery } from "@tanstack/react-query";

import paypalLogo from "@assets/paypal-logo-icon-png_44635_1769721723658.jpg";

export default function Settings() {
  const [location] = useLocation();
  // Using a separate state for activeTab that syncs with URL
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "gateway";
  });

  // Sync state with URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "gateway";
      setActiveTab(tab);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Create a custom event for pushState/replaceState since wouter uses them
    const originalPushState = window.history.pushState;
    window.history.pushState = function(data: any, unused: string, url?: string | URL | null) {
      originalPushState.apply(this, [data, unused, url]);
      handleLocationChange();
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(data: any, unused: string, url?: string | URL | null) {
      originalReplaceState.apply(this, [data, unused, url]);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const { data: usersList, isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
    enabled: activeTab === "usuario"
  });

  const [form, setForm] = useState({
    paypalClientId: "",
    paypalClientSecret: "",
    paypalWebhookId: "",
    facebookPixelId: "",
    utmfyToken: "",
    environment: "production"
  });

  useEffect(() => {
    if (settings) {
      setForm({
        paypalClientId: settings.paypalClientId || "",
        paypalClientSecret: settings.paypalClientSecret || "",
        paypalWebhookId: settings.paypalWebhookId || "",
        facebookPixelId: settings.facebookPixelId || "",
        utmfyToken: settings.utmfyToken || "",
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

  const renderUsuario = () => {
    return (
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg mb-6">
          <CardHeader className="border-b border-zinc-800/50 pb-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-500" />
              <div>
                <CardTitle className="text-base text-white">Usuários do Sistema</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Lista de usuários com acesso à plataforma</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-700" /></div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {usersList?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs font-bold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{u.username}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">ID: #{u.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold border border-emerald-500/20">ATIVO</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500"><Settings className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-[10px] text-zinc-500 italic">Mantenha sua senha atualizada para maior segurança.</p>
              <Button variant="outline" className="w-full text-xs h-9 border-zinc-800 hover:bg-zinc-800">Alterar Senha</Button>
            </div>
          </Card>

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
                    <p className="text-xs text-zinc-500">Avisos de novos pedidos</p>
                  </div>
                  <div className="w-10 h-5 bg-purple-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderMetricas = () => (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg">
          <CardHeader className="border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <CardTitle className="text-base text-white">Facebook Pixel</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Acompanhe suas conversões no Facebook</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pixel ID</label>
              <Input 
                className="bg-zinc-900 border-zinc-800 text-sm h-11" 
                value={form.facebookPixelId}
                onChange={(e) => setForm({...form, facebookPixelId: e.target.value})}
                placeholder="Ex: 123456789012345"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <Shield className="w-3 h-3" />
              Os eventos serão enviados automaticamente via API de Conversões.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg">
          <CardHeader className="border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <CardTitle className="text-base text-white">UTMfy Connection</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Rastreamento avançado de origens</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">UTMfy Token</label>
              <Input 
                className="bg-zinc-900 border-zinc-800 text-sm h-11" 
                value={form.utmfyToken}
                onChange={(e) => setForm({...form, utmfyToken: e.target.value})}
                placeholder="Insira seu token UTMfy"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <History className="w-3 h-3" />
              Conecte sua conta para sincronizar dados de rastreio.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-8">
        <Button 
          onClick={handleSave} 
          disabled={updateSettings.isPending}
          className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg h-12 px-8"
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações de Métricas
        </Button>
      </div>

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
    </div>
  );

  return (
    <Layout 
      title={activeTab === "gateway" ? "Configurações de Gateway" : activeTab === "usuario" ? "Perfil do Usuário" : "Métricas do Sistema"} 
      subtitle={activeTab === "gateway" ? "Gerencie suas credenciais de pagamento" : activeTab === "usuario" ? "Personalize sua conta e segurança" : "Acompanhe a performance do seu negócio"}
    >
      <div className="flex flex-col gap-6">
        {activeTab === "gateway" && renderGateway()}
        {activeTab === "usuario" && renderUsuario()}
        {activeTab === "metricas" && renderMetricas()}
      </div>
    </Layout>
  );
}
