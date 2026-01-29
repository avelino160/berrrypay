import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    paypalClientId: "",
    paypalClientSecret: "",
    paypalWebhookId: "",
    environment: "sandbox"
  });

  useEffect(() => {
    if (settings) {
      setForm({
        paypalClientId: settings.paypalClientId || "",
        paypalClientSecret: settings.paypalClientSecret || "",
        paypalWebhookId: settings.paypalWebhookId || "",
        environment: settings.environment || "sandbox"
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

  return (
    <Layout title="Configurações" subtitle="Gerencie suas credenciais de pagamento">
      <div className="max-w-2xl">
        <Card className="bg-[#18181b] border-zinc-800/60 shadow-lg mb-8">
          <CardHeader className="border-b border-zinc-800/50 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#003087]/10 flex items-center justify-center border border-[#003087]/20">
                <CreditCard className="w-5 h-5 text-[#003087]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Integração PayPal</CardTitle>
                <CardDescription className="text-zinc-500">
                  Configure suas credenciais de API do PayPal para processar pagamentos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Ambiente</label>
              <Select 
                value={form.environment} 
                onValueChange={(val) => setForm({...form, environment: val})}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                  <SelectItem value="production">Produção (Real)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-600">
                Use "Sandbox" para testes e "Produção" para vendas reais.
              </p>
            </div>

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
              <label className="text-sm font-medium text-zinc-400">Webhook ID (Opcional)</label>
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
                className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0 outline-none ring-0 focus-visible:ring-0"
              >
                {updateSettings.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
