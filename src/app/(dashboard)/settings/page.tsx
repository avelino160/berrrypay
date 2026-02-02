"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Loader2, Save, Wallet, User, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "gateway";
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    paypalClientId: "",
    paypalClientSecret: "",
    paypalWebhookId: "",
    facebookPixelId: "",
    utmfyToken: "",
    environment: "sandbox",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        paypalClientId: settings.paypalClientId || "",
        paypalClientSecret: settings.paypalClientSecret || "",
        paypalWebhookId: settings.paypalWebhookId || "",
        facebookPixelId: settings.facebookPixelId || "",
        utmfyToken: settings.utmfyToken || "",
        environment: settings.environment || "sandbox",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie suas configurações" />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto pb-20">
          {currentTab === "gateway" && (
            <Card className="bg-[#18181b] border-zinc-800/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wallet className="w-5 h-5" />
                  Gateway de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400">PayPal Client ID</label>
                  <Input
                    value={formData.paypalClientId}
                    onChange={(e) => setFormData({ ...formData, paypalClientId: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="Seu Client ID do PayPal"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">PayPal Client Secret</label>
                  <Input
                    type="password"
                    value={formData.paypalClientSecret}
                    onChange={(e) => setFormData({ ...formData, paypalClientSecret: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="Seu Client Secret do PayPal"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">PayPal Webhook ID</label>
                  <Input
                    value={formData.paypalWebhookId}
                    onChange={(e) => setFormData({ ...formData, paypalWebhookId: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="ID do Webhook"
                  />
                </div>
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          )}

          {currentTab === "metricas" && (
            <Card className="bg-[#18181b] border-zinc-800/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5" />
                  Métricas e Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400">Facebook Pixel ID</label>
                  <Input
                    value={formData.facebookPixelId}
                    onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="Seu Pixel ID"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">UTMFY Token</label>
                  <Input
                    value={formData.utmfyToken}
                    onChange={(e) => setFormData({ ...formData, utmfyToken: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="Seu token UTMFY"
                  />
                </div>
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-500" disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          )}

          {currentTab === "usuario" && (
            <Card className="bg-[#18181b] border-zinc-800/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  Configurações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500">Configurações do usuário em desenvolvimento.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}
