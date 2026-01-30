import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Layout as LayoutIcon, Palette, Settings, Eye, Monitor, Smartphone, Plus, Trash2, Clock, Bell, User, Star } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";

export default function CheckoutEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/checkouts/edit/:id");
  const isNew = !params?.id;
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  
  // State for editor fields
  const [config, setConfig] = useState({
    name: "CHECKOUT PRO",
    product: "",
    orderBump: "",
    bannerUrl: "",
    timerText: "Oferta por Tempo Limitado:",
    paymentButtonText: "PAGAR AGORA",
    requirePhone: false,
    requireCpf: false,
    primaryColor: "#3de148",
    backgroundColor: "#f34ef6",
    showTitle: true,
    title: "Finalize sua Compra",
    subtitle: "Ambiente 100% seguro",
    timerMinutes: 15,
    showTimer: true,
  });

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      {/* Sidebar Editor */}
      <div className="w-[400px] flex flex-col border-r border-zinc-800 bg-[#0c0c0e]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/checkouts")} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Editor de Checkout</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{config.name || "Curso Checkout"}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4">
            <TabsList className="w-full bg-zinc-900/50 border border-zinc-800 p-1">
              <TabsTrigger value="geral" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Geral</TabsTrigger>
              <TabsTrigger value="provas" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Provas Sociais</TabsTrigger>
              <TabsTrigger value="visual" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Visual</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="geral" className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Settings className="w-4 h-4" />
                <h2 className="text-sm font-bold">Configurações Gerais</h2>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Nome do Checkout *</Label>
                <Input 
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm focus:ring-1 focus:ring-[#3de148]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Produto Principal</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm">
                    <SelectValue placeholder="Nenhum produto específico" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="p1">Produto X</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Produtos de Order Bump (Opcional)</Label>
                <Select>
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm">
                    <SelectValue placeholder="Nenhum order bump selecionado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="bump1">Produto Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 text-zinc-400">
                <LayoutIcon className="w-4 h-4" />
                <h2 className="text-sm font-bold">Conteúdo e Dados Adicionais</h2>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">URL do Banner (Opcional)</Label>
                <Input 
                  placeholder="https://exemplo.com/banner.jpg"
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Texto do Timer *</Label>
                <Input 
                  value={config.timerText}
                  onChange={(e) => setConfig({...config, timerText: e.target.value})}
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Texto do Botão de Pagamento *</Label>
                <Input 
                  value={config.paymentButtonText}
                  onChange={(e) => setConfig({...config, paymentButtonText: e.target.value})}
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Exigir Telefone</Label>
                    <p className="text-[10px] text-zinc-500">Se marcado, o cliente precisará fornecer um número de telefone válido.</p>
                  </div>
                  <Switch checked={config.requirePhone} onCheckedChange={(v) => setConfig({...config, requirePhone: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Exigir CPF</Label>
                    <p className="text-[10px] text-zinc-500">Se marcado, o cliente precisará fornecer um CPF válido.</p>
                  </div>
                  <Switch checked={config.requireCpf} onCheckedChange={(v) => setConfig({...config, requireCpf: v})} />
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-[#3de148] hover:bg-[#34c740] text-black font-bold h-10">
                  <Save className="w-4 h-4 mr-2" /> {isNew ? "Criar Checkout" : "Salvar Alterações"}
                </Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="provas" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <User className="w-4 h-4" />
              <h2 className="text-sm font-bold">Provas Sociais</h2>
            </div>
            <Button variant="outline" className="w-full border-zinc-800 bg-zinc-900/50 text-xs border-dashed hover:bg-zinc-800 h-10">
              <Plus className="w-3 h-3 mr-2" /> Adicionar Avaliação
            </Button>
          </TabsContent>

          <TabsContent value="visual" className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Palette className="w-4 h-4" />
              <h2 className="text-sm font-bold">Aparência Visual</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-md border border-zinc-800" style={{ backgroundColor: config.primaryColor }} />
                  <Input value={config.primaryColor} onChange={(e) => setConfig({...config, primaryColor: e.target.value})} className="flex-1 bg-zinc-900 border-zinc-800 h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-md border border-zinc-800" style={{ backgroundColor: config.backgroundColor }} />
                  <Input value={config.backgroundColor} onChange={(e) => setConfig({...config, backgroundColor: e.target.value})} className="flex-1 bg-zinc-900 border-zinc-800 h-9 text-xs" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-zinc-900/20 relative">
        <div className="h-14 border-b border-zinc-800/50 flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${device === 'desktop' ? 'bg-zinc-800 text-[#3de148]' : 'text-zinc-500'}`}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${device === 'mobile' ? 'bg-zinc-800 text-[#3de148]' : 'text-zinc-500'}`}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          <div className={`bg-white transition-all duration-300 shadow-2xl rounded-xl overflow-hidden h-fit ${device === 'desktop' ? 'w-full max-w-[900px]' : 'w-[375px]'}`}>
            {/* Real Checkout Preview Content */}
            <div className="bg-[#f59e0b] p-3 text-center text-white flex items-center justify-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{config.timerText}</span>
              </div>
              <div className="bg-black/20 px-3 py-1 rounded flex items-center gap-1 font-mono">
                <span>06</span>:<span>31</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl">g</div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">Curso Checkout</h2>
                    <p className="text-lg font-bold text-[#3de148]">R$ 99,00</p>
                  </div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 min-w-[240px]">
                  <h3 className="text-sm font-bold text-zinc-900 mb-3">Resumo da compra</h3>
                  <div className="flex justify-between text-sm text-zinc-600 mb-4 pb-4 border-b">
                    <span>Curso Checkout</span>
                    <span>R$ 99,00</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-zinc-900">Total a pagar</span>
                    <span className="text-xl text-[#3de148]">R$ 99,00</span>
                  </div>
                </div>
              </div>

              <div className="max-w-[500px] space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold border-b pb-2">
                    <User className="w-4 h-4" />
                    <h3>Seus dados</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Qual é o seu nome completo?</Label>
                      <Input placeholder="Nome da Silva" className="h-11 bg-zinc-50 border-zinc-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Qual é o seu e-mail?</Label>
                      <Input placeholder="Digite o e-mail que receberá o produto" className="h-11 bg-zinc-50 border-zinc-200" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold border-b pb-2">
                    <Settings className="w-4 h-4" />
                    <h3>Escolha a forma de pagamento</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-[#3de148] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer bg-zinc-50">
                      <div className="w-8 h-8 bg-[#3de148]/10 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#3de148] rotate-45" />
                      </div>
                      <span className="text-sm font-bold text-zinc-900">Pix</span>
                    </div>
                    <div className="border border-zinc-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-zinc-300">
                      <Smartphone className="w-8 h-8 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-500">Cartão de Crédito</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 bg-[#3de148] hover:bg-[#34c740] text-black text-lg font-black rounded-xl uppercase tracking-wider">
                  {config.paymentButtonText}
                </Button>
                
                <div className="text-center">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-center gap-1">
                    <Settings className="w-3 h-3" /> Compra segura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
