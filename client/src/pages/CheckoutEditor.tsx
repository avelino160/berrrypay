import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import { useCheckout, useCreateCheckout, useUpdateCheckout } from "@/hooks/use-checkouts";
import { ArrowLeft, Save, Layout as LayoutIcon, Palette, Settings, Eye, Monitor, Smartphone, Plus, Trash2, Clock, Bell, User, Star } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/checkouts/edit/:id");
  const checkoutId = params?.id ? parseInt(params.id) : null;
  const { data: products } = useProducts();
  const { data: checkout, isLoading: loadingCheckout } = useCheckout(checkoutId!);
  const createMutation = useCreateCheckout();
  const updateMutation = useUpdateCheckout();
  const { toast } = useToast();
  
  const isNew = !checkoutId;
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
    primaryColor: "#9333ea",
    backgroundColor: "#ffffff",
    showTitle: true,
    title: "Finalize sua Compra",
    subtitle: "Ambiente 100% seguro",
    timerMinutes: 15,
    showTimer: true,
  });

  useEffect(() => {
    if (checkout) {
      setConfig({
        ...config,
        name: checkout.name,
        product: checkout.productId.toString(),
        // Since we don't have all these fields in the schema yet, we'll use defaults or mock them
        // In a real app, you'd extend the schema to support these visual configs
      });
    }
  }, [checkout]);

  const handleSave = async () => {
    if (!config.product) {
      toast({ title: "Erro", description: "Selecione um produto principal", variant: "destructive" });
      return;
    }

    try {
      if (isNew) {
        const slug = config.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        await createMutation.mutateAsync({
          name: config.name,
          productId: parseInt(config.product),
          slug: slug + '-' + Math.random().toString(36).substring(2, 7),
          active: true,
        });
        toast({ title: "Sucesso", description: "Checkout criado com sucesso!" });
      } else {
        await updateMutation.mutateAsync({
          id: checkoutId!,
          data: {
            name: config.name,
            productId: parseInt(config.product),
          }
        });
        toast({ title: "Sucesso", description: "Checkout atualizado com sucesso!" });
      }
      setLocation("/checkouts");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const selectedProduct = useMemo(() => 
    products?.find(p => p.id.toString() === config.product),
  [products, config.product]);

  if (checkoutId && loadingCheckout) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Produto Principal</Label>
                <Select 
                  value={config.product} 
                  onValueChange={(v) => setConfig({...config, product: v})}
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Produtos de Order Bump (Opcional)</Label>
                <Select 
                  value={config.orderBump} 
                  onValueChange={(v) => setConfig({...config, orderBump: v})}
                >
                  <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm">
                    <SelectValue placeholder="Nenhum order bump selecionado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
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
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 border-0 ring-0 focus-visible:ring-0"
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
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
            className={`h-8 w-8 ${device === 'desktop' ? 'bg-zinc-800 text-purple-500' : 'text-zinc-500'}`}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${device === 'mobile' ? 'bg-zinc-800 text-purple-500' : 'text-zinc-500'}`}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          <div 
            className={`transition-all duration-300 shadow-2xl rounded-xl overflow-hidden h-fit ${device === 'desktop' ? 'w-full max-w-[900px]' : 'w-[375px]'}`}
            style={{ backgroundColor: config.backgroundColor }}
          >
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
                  {selectedProduct?.imageUrl ? (
                    <img src={selectedProduct.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                      {selectedProduct?.name?.charAt(0) || 'g'}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{selectedProduct?.name || "Curso Checkout"}</h2>
                    <p className="text-lg font-bold" style={{ color: config.primaryColor }}>
                      {selectedProduct ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price / 100 * 5.5) : "R$ 99,00"}
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-50/50 p-4 rounded-xl min-w-[240px] border border-zinc-100">
                  <h3 className="text-sm font-bold text-zinc-900 mb-3">Resumo da compra</h3>
                  <div className="flex justify-between text-sm text-zinc-600 mb-4 pb-4 border-b border-zinc-100">
                    <span>{selectedProduct?.name || "Curso Checkout"}</span>
                    <span>{selectedProduct ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price / 100 * 5.5) : "R$ 99,00"}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-zinc-900">Total a pagar</span>
                    <span className="text-xl" style={{ color: config.primaryColor }}>
                      {selectedProduct ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price / 100 * 5.5) : "R$ 99,00"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="max-w-[500px] space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold border-b border-zinc-100 pb-2">
                    <User className="w-4 h-4" />
                    <h3>Seus dados</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Qual é o seu nome completo?</Label>
                      <Input placeholder="Nome da Silva" className="h-11 bg-zinc-50 border-zinc-100" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-500">Qual é o seu e-mail?</Label>
                      <Input placeholder="Digite o e-mail que receberá o produto" className="h-11 bg-zinc-50 border-zinc-100" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold border-b border-zinc-100 pb-2">
                    <Settings className="w-4 h-4" />
                    <h3>Escolha a forma de pagamento</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="border-2 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer"
                      style={{ 
                        borderColor: config.primaryColor,
                        backgroundColor: `${config.primaryColor}08`
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${config.primaryColor}15` }}
                      >
                        <div 
                          className="w-4 h-4 rotate-45"
                          style={{ backgroundColor: config.primaryColor }}
                        />
                      </div>
                      <span className="text-sm font-bold text-zinc-900">Pix</span>
                    </div>
                    <div className="border border-zinc-100 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-zinc-200">
                      <Smartphone className="w-8 h-8 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-500">Cartão de Crédito</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-14 text-white text-lg font-black rounded-xl uppercase tracking-wider"
                  style={{ backgroundColor: config.primaryColor }}
                >
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
