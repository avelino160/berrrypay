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
import { ArrowLeft, Save, Layout as LayoutIcon, Palette, Settings, Eye, Monitor, Smartphone, Plus, Trash2, Clock, Bell, User, Star, Copy, CreditCard, Shield, Lock, CheckCircle2 } from "lucide-react";
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
    name: "",
    product: "",
    orderBump: "",
    bannerUrl: "",
    timerText: "Oferta Especial por Tempo Limitado!",
    paymentButtonText: "PAGAR AGORA",
    requirePhone: false,
    requireCpf: false,
    primaryColor: "#9333ea",
    backgroundColor: "#ffffff",
    timerColor: "#f59e0b",
    showTitle: true,
    title: "Finalize sua Compra",
    subtitle: "Ambiente 100% seguro",
    timerMinutes: 0,
    showTimer: true,
    socialProofs: [] as { id: string; name: string; text: string; stars: number }[],
  });

  const [timerSeconds, setTimerSeconds] = useState(config.timerMinutes * 60);

  useEffect(() => {
    setTimerSeconds(config.timerMinutes * 60);
  }, [config.timerMinutes]);

  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTimeParts = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0')
    };
  };

  const addSocialProof = () => {
    const newProof = {
      id: Math.random().toString(36).substr(2, 9),
      name: "Novo Cliente",
      text: "Excelente produto!",
      stars: 5
    };
    setConfig({ ...config, socialProofs: [...config.socialProofs, newProof] });
  };

  const removeSocialProof = (id: string) => {
    setConfig({ ...config, socialProofs: config.socialProofs.filter(p => p.id !== id) });
  };

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

  const orderBumpProduct = useMemo(() => 
    products?.find(p => p.id.toString() === config.orderBump),
  [products, config.orderBump]);

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
              <h1 className="text-xl font-bold text-white leading-tight uppercase tracking-tight">Editor de Checkout</h1>
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
                <div className="flex gap-2">
                  <Input 
                    value={config.timerText}
                    onChange={(e) => setConfig({...config, timerText: e.target.value})}
                    className="bg-zinc-900/50 border-zinc-800 h-9 text-sm flex-1"
                  />
                  <Input 
                    type="number"
                    value={config.timerMinutes}
                    onChange={(e) => setConfig({...config, timerMinutes: parseInt(e.target.value) || 0})}
                    className="bg-zinc-900/50 border-zinc-800 h-9 text-sm w-20"
                    placeholder="Min"
                  />
                </div>
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

            <div className="pt-4 space-y-4">
              {checkout?.publicUrl && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-2">
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Link Público</Label>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={checkout.publicUrl} 
                      className="bg-zinc-950 border-zinc-800 h-8 text-[10px] focus:ring-0" 
                    />
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-8 w-8 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                      onClick={() => {
                        navigator.clipboard.writeText(checkout.publicUrl!);
                        toast({ title: "Copiado!" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
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
            
            <div className="space-y-3">
              {config.socialProofs.map((proof) => (
                <div key={proof.id} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-2 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSocialProof(proof.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Input 
                    value={proof.name} 
                    onChange={(e) => {
                      const newProofs = config.socialProofs.map(p => p.id === proof.id ? { ...p, name: e.target.value } : p);
                      setConfig({ ...config, socialProofs: newProofs });
                    }}
                    className="bg-transparent border-none p-0 h-auto text-xs font-bold focus-visible:ring-0" 
                  />
                  <textarea 
                    value={proof.text} 
                    onChange={(e) => {
                      const newProofs = config.socialProofs.map(p => p.id === proof.id ? { ...p, text: e.target.value } : p);
                      setConfig({ ...config, socialProofs: newProofs });
                    }}
                    className="bg-transparent border-none p-0 w-full resize-none text-[10px] text-zinc-400 focus:outline-none" 
                  />
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-zinc-800 bg-zinc-900/50 text-xs border-dashed hover:bg-zinc-800 h-10"
              onClick={addSocialProof}
            >
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
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-md border border-zinc-800 shrink-0" style={{ backgroundColor: config.primaryColor }} />
                    <Input value={config.primaryColor} onChange={(e) => setConfig({...config, primaryColor: e.target.value})} className="flex-1 bg-zinc-900 border-zinc-800 h-9 text-xs" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['#9333ea', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#000000'].map(color => (
                      <button 
                        key={color} 
                        className="w-5 h-5 rounded-full border border-white/10" 
                        style={{ backgroundColor: color }}
                        onClick={() => setConfig({...config, primaryColor: color})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Cor do Timer</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="w-9 h-9 rounded-md border border-zinc-800 shrink-0" style={{ backgroundColor: config.timerColor }} />
                    <Input value={config.timerColor} onChange={(e) => setConfig({...config, timerColor: e.target.value})} className="flex-1 bg-zinc-900 border-zinc-800 h-9 text-xs" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['#f59e0b', '#ef4444', '#000000', '#9333ea', '#ffffff'].map(color => (
                      <button 
                        key={color} 
                        className="w-5 h-5 rounded-full border border-white/10" 
                        style={{ backgroundColor: color }}
                        onClick={() => setConfig({...config, timerColor: color})}
                      />
                    ))}
                  </div>
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

        <div className={`flex-1 overflow-y-auto custom-scrollbar flex ${device === 'mobile' ? 'justify-center p-8 bg-zinc-100' : ''}`}>
          <div 
            className={`transition-all duration-300 h-fit bg-white ${device === 'desktop' ? 'w-full' : 'w-[375px] shadow-2xl rounded-xl overflow-hidden'}`}
          >
            {/* Header / Timer */}
            <div 
              className="py-2.5 px-4 text-center text-white flex items-center justify-center gap-4 text-sm font-bold"
              style={{ backgroundColor: "#22a559" }}
            >
              {(() => {
                const { hours, mins, secs } = formatTimeParts(timerSeconds);
                return (
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xl font-bold tracking-wider text-white tabular-nums">
                      {hours} : {mins} : {secs}
                    </span>
                    <Clock className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">{config.timerText}</span>
                  </div>
                );
              })()}
            </div>

            <div className={`p-4 md:p-8 grid grid-cols-1 ${device === 'desktop' ? 'lg:grid-cols-12' : ''} gap-8 text-zinc-900`}>
              {/* Coluna da Esquerda - Dados e Pagamento */}
              <div className={device === 'desktop' ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Dados de Acesso</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`grid grid-cols-1 ${device === 'desktop' ? 'md:grid-cols-2' : ''} gap-4`}>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome Completo</label>
                        <div className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white flex items-center text-zinc-400 text-sm italic">Seu nome completo</div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">E-mail para Acesso</label>
                        <div className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white flex items-center text-zinc-400 text-sm italic">exemplo@email.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Pagamento Seguro</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-4 border-purple-500 bg-white" />
                        <span className="font-bold text-zinc-900">PayPal</span>
                      </div>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg" className="h-6 opacity-80" alt="PayPal" />
                    </div>

                    <Button 
                      className="w-full h-16 text-xl font-black rounded-2xl shadow-xl border-0"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {config.paymentButtonText}
                    </Button>

                    <div className="flex items-center justify-center gap-6 py-4 border-t border-zinc-200/50">
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>Criptografia SSL</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                        <Lock className="w-3 h-3 text-green-500" />
                        <span>Compra Segura</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provas Sociais */}
                {config.socialProofs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-2">O que dizem nossos clientes</h3>
                    <div className={`grid grid-cols-1 ${device === 'desktop' ? 'md:grid-cols-2' : ''} gap-4`}>
                      {config.socialProofs.map((proof) => (
                        <div key={proof.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl shadow-sm">
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(proof.stars)].map((_, s) => <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                          </div>
                          <p className="text-xs font-bold text-zinc-900 mb-1">{proof.name}</p>
                          <p className="text-[11px] text-zinc-500 leading-relaxed italic">"{proof.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna da Direita - Resumo */}
              <div className={device === 'desktop' ? 'lg:col-span-5' : ''}>
                <div className="space-y-6">
                  <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                      {selectedProduct?.imageUrl ? (
                        <img src={selectedProduct.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-md border border-zinc-100" alt="" />
                      ) : (
                        <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg border border-zinc-100">
                          {selectedProduct?.name?.charAt(0) || 'P'}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">{selectedProduct?.name || "Produto Principal"}</h2>
                        <p className="text-lg font-black mt-1" style={{ color: config.primaryColor }}>
                          {selectedProduct ? `R$ ${(selectedProduct.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-zinc-200/50">
                      <div className="flex items-center gap-2 text-zinc-900 font-black uppercase text-[10px] tracking-widest opacity-40">
                        <Settings className="w-3 h-3" />
                        <span>Resumo do Pedido</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold text-zinc-600">
                          <span>{selectedProduct?.name || "Produto Principal"}</span>
                          <span>{selectedProduct ? `R$ ${(selectedProduct.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00"}</span>
                        </div>
                        {orderBumpProduct && (
                          <div className="flex justify-between text-sm font-bold text-zinc-600">
                            <span>{orderBumpProduct.name} (Order Bump)</span>
                            <span>R$ {(orderBumpProduct.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-zinc-200/50 flex justify-between items-center">
                          <span className="text-zinc-900 font-black uppercase text-xs tracking-widest">Total</span>
                          <span className="text-3xl font-black" style={{ color: config.primaryColor }}>
                            {`R$ ${(((selectedProduct?.price || 0) + (orderBumpProduct?.price || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="p-4 bg-green-50 border border-green-100 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Acesso Imediato</span>
                        </div>
                        <p className="text-[11px] text-green-600/80 leading-relaxed">
                          Seu acesso será enviado para o e-mail informado assim que o pagamento for aprovado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <footer className="text-center px-4">
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                      BerryPay - Tecnologia de Pagamentos Seguros<br />
                      Todos os direitos reservados &copy; {new Date().getFullYear()}
                    </p>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
