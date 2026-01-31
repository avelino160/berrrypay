import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/use-products";
import { useCheckout, useCreateCheckout, useUpdateCheckout } from "@/hooks/use-checkouts";
import { ArrowLeft, Save, Monitor, Smartphone, Clock, Shield, Zap, Mail, Lock, CheckCircle2, Star, CreditCard, Building2, Copy, Plus, Trash2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckoutConfig } from "@shared/schema";
import { SiPaypal } from "react-icons/si";

const defaultConfig: CheckoutConfig = {
  timerMinutes: 10,
  timerText: "Oferta Especial por Tempo Limitado!",
  heroTitle: "Promoção por tempo limitado",
  heroBadgeText: "7 DIAS",
  heroImageUrl: "",
  benefitsList: [
    { icon: "zap", title: "ACESSO IMEDIATO", subtitle: "Seu produto disponível em instantes" },
    { icon: "shield", title: "PAGAMENTO SEGURO", subtitle: "Dados protegidos e criptografados" }
  ],
  privacyText: "Your information is 100% secure",
  safeText: "Safe purchase",
  deliveryText: "Delivery via E-mail",
  approvedText: "Approved content",
  testimonial: {
    name: "Marisa Correia",
    imageUrl: "",
    rating: 5,
    text: "\"Acreditem em mim, essa é a melhor compra que vocês vão fazer esse ano. Não percam a chance!\""
  },
  upsellProducts: [],
  payButtonText: "Buy now",
  footerText: "BerryPay © 2026. All rights reserved.",
  primaryColor: "#22a559",
  showChangeCountry: true,
};

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'paypal'>('card');
  
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
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

  useEffect(() => {
    if (checkout) {
      setName(checkout.name);
      setProductId(checkout.productId.toString());
      if (checkout.config) {
        setConfig({ ...defaultConfig, ...checkout.config });
      }
    }
  }, [checkout]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!productId) {
      toast({ title: "Erro", description: "Selecione um produto principal", variant: "destructive" });
      return;
    }

    try {
      if (isNew) {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        await createMutation.mutateAsync({
          name,
          productId: parseInt(productId),
          slug: slug + '-' + Math.random().toString(36).substring(2, 7),
          active: true,
          config,
        });
        toast({ title: "Sucesso", description: "Checkout criado com sucesso!" });
      } else {
        await updateMutation.mutateAsync({
          id: checkoutId!,
          data: {
            name,
            productId: parseInt(productId),
            config,
          }
        });
        toast({ title: "Sucesso", description: "Checkout atualizado com sucesso!" });
      }
      setLocation("/checkouts");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const selectedProduct = products?.find(p => p.id.toString() === productId);
  const upsellProducts = products?.filter(p => config.upsellProducts.includes(p.id)) || [];

  const toggleUpsell = (id: number) => {
    const current = config.upsellProducts || [];
    if (current.includes(id)) {
      setConfig({ ...config, upsellProducts: current.filter(x => x !== id) });
    } else {
      setConfig({ ...config, upsellProducts: [...current, id] });
    }
  };

  if (checkoutId && loadingCheckout) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      <div className="w-[420px] flex flex-col border-r border-zinc-800 bg-[#0c0c0e]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/checkouts")} className="h-8 w-8" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold text-white uppercase tracking-tight">Editor de Checkout</h1>
          </div>
        </div>

        <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4">
            <TabsList className="w-full bg-zinc-900/50 border border-zinc-800 p-1">
              <TabsTrigger value="geral" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Geral</TabsTrigger>
              <TabsTrigger value="hero" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Hero</TabsTrigger>
              <TabsTrigger value="testimonial" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Depoimento</TabsTrigger>
              <TabsTrigger value="upsells" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Upsells</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="geral" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Nome do Checkout *</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-checkout-name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Produto Principal *</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm" data-testid="select-product">
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
              <Label className="text-xs text-zinc-400">Cor Principal</Label>
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-md border border-zinc-700" style={{ backgroundColor: config.primaryColor }} />
                <Input 
                  value={config.primaryColor} 
                  onChange={(e) => setConfig({...config, primaryColor: e.target.value})} 
                  className="bg-zinc-900/50 border-zinc-800 h-9 text-sm flex-1"
                  data-testid="input-primary-color"
                />
              </div>
              <div className="flex gap-1 mt-2">
                {['#22a559', '#2563eb', '#9333ea', '#dc2626', '#d97706', '#000000'].map(color => (
                  <button 
                    key={color} 
                    className="w-6 h-6 rounded-full border border-white/20" 
                    style={{ backgroundColor: color }}
                    onClick={() => setConfig({...config, primaryColor: color})}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Timer (minutos)</Label>
              <Input 
                type="number"
                value={config.timerMinutes}
                onChange={(e) => setConfig({...config, timerMinutes: parseInt(e.target.value) || 0})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-timer-minutes"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Texto do Timer</Label>
              <Input 
                value={config.timerText}
                onChange={(e) => setConfig({...config, timerText: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-timer-text"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Texto do Botão</Label>
              <Input 
                value={config.payButtonText}
                onChange={(e) => setConfig({...config, payButtonText: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-button-text"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Texto do Rodapé</Label>
              <Input 
                value={config.footerText}
                onChange={(e) => setConfig({...config, footerText: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-footer-text"
              />
            </div>

            {checkout?.publicUrl && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-2 mt-4">
                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Link Público</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={checkout.publicUrl} 
                    className="bg-zinc-950 border-zinc-800 h-8 text-[10px]" 
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 border-zinc-800"
                    onClick={() => {
                      navigator.clipboard.writeText(checkout.publicUrl!);
                      toast({ title: "Copiado!" });
                    }}
                    data-testid="button-copy-url"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <Button 
              className="w-full h-10 font-bold mt-4"
              style={{ backgroundColor: config.primaryColor }}
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" /> {isNew ? "Criar Checkout" : "Salvar Alterações"}
            </Button>
          </TabsContent>

          <TabsContent value="hero" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Título do Hero</Label>
              <Input 
                value={config.heroTitle}
                onChange={(e) => setConfig({...config, heroTitle: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-hero-title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Upload de Banner (Hero)</Label>
              <Input 
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      setConfig({...config, heroImageUrl: data.url});
                      toast({ title: "Sucesso", description: "Banner enviado com sucesso!" });
                    } catch (err) {
                      toast({ title: "Erro", description: "Falha ao enviar imagem", variant: "destructive" });
                    }
                  }
                }}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-hero-image-upload"
              />
              {config.heroImageUrl && (
                <div className="mt-2 relative group">
                  <img src={config.heroImageUrl} alt="Banner Preview" className="w-full h-20 object-cover rounded-md border border-zinc-800" />
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setConfig({...config, heroImageUrl: ""})}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="testimonial" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Nome do Cliente</Label>
              <Input 
                value={config.testimonial.name}
                onChange={(e) => setConfig({...config, testimonial: {...config.testimonial, name: e.target.value}})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-testimonial-name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">URL da Foto</Label>
              <Input 
                value={config.testimonial.imageUrl}
                onChange={(e) => setConfig({...config, testimonial: {...config.testimonial, imageUrl: e.target.value}})}
                placeholder="https://..."
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-testimonial-image"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Avaliação (1-5 estrelas)</Label>
              <Input 
                type="number"
                min={1}
                max={5}
                value={config.testimonial.rating}
                onChange={(e) => setConfig({...config, testimonial: {...config.testimonial, rating: parseInt(e.target.value) || 5}})}
                className="bg-zinc-900/50 border-zinc-800 h-9 text-sm"
                data-testid="input-testimonial-rating"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Texto do Depoimento</Label>
              <Textarea 
                value={config.testimonial.text}
                onChange={(e) => setConfig({...config, testimonial: {...config.testimonial, text: e.target.value}})}
                className="bg-zinc-900/50 border-zinc-800 text-sm min-h-[100px]"
                data-testid="input-testimonial-text"
              />
            </div>
          </TabsContent>

          <TabsContent value="upsells" className="flex-1 overflow-y-auto p-4 space-y-4">
            <Label className="text-xs text-zinc-400">Selecione produtos para upsell:</Label>
            <div className="space-y-2">
              {products?.filter(p => p.id.toString() !== productId).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <Checkbox 
                    checked={config.upsellProducts.includes(p.id)}
                    onCheckedChange={() => toggleUpsell(p.id)}
                    data-testid={`checkbox-upsell-${p.id}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-zinc-500">{(p.price / 100).toFixed(2)} US$</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col bg-zinc-900/20 relative">
        <div className="h-14 border-b border-zinc-800/50 flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${device === 'desktop' ? 'bg-zinc-800 text-green-500' : 'text-zinc-500'}`}
            onClick={() => setDevice('desktop')}
            data-testid="button-desktop"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${device === 'mobile' ? 'bg-zinc-800 text-green-500' : 'text-zinc-500'}`}
            onClick={() => setDevice('mobile')}
            data-testid="button-mobile"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className={`flex-1 overflow-y-auto ${device === 'mobile' ? 'flex justify-center p-8 bg-zinc-800' : ''}`}>
          <div className={`bg-gray-50 h-fit ${device === 'desktop' ? 'w-full' : 'w-[375px] shadow-2xl rounded-xl overflow-hidden'}`}>
            <div 
              className="py-2 px-4 text-center text-white flex items-center justify-center gap-3"
              style={{ backgroundColor: config.primaryColor }}
            >
              <span className="font-mono text-lg font-bold tracking-wider tabular-nums">
                {formatTime(timerSeconds)}
              </span>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{config.timerText}</span>
            </div>

            <div className="bg-[#1a3a2a] py-8 px-4">
              <div className={`max-w-5xl mx-auto flex ${device === 'mobile' ? 'flex-col' : 'flex-row'} items-center justify-between gap-6`}>
                <div className="text-white">
                  <h1 className={`${device === 'mobile' ? 'text-2xl' : 'text-3xl'} font-bold italic leading-tight`}>
                    {config.heroTitle}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  {config.heroImageUrl ? (
                    <img src={config.heroImageUrl} alt="" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white/50 text-[10px]">Imagem</span>
                    </div>
                  )}
                  <div className="bg-[#0d5c3d] rounded-lg px-3 py-2 text-center">
                    <span className="text-3xl font-bold text-white">{config.heroBadgeText.split(' ')[0]}</span>
                    <div className="text-white text-xs font-medium">{config.heroBadgeText.split(' ').slice(1).join(' ')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`max-w-5xl mx-auto px-4 py-6 ${device === 'mobile' ? 'space-y-4' : 'grid grid-cols-3 gap-6'}`}>
              <div className={device === 'mobile' ? 'space-y-4' : 'col-span-2 space-y-4'}>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    {selectedProduct?.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">
                        {selectedProduct?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-gray-400 text-[10px] uppercase">BY MOVE DIGITAL MARKETING</div>
                      <h2 className="font-bold text-gray-900 text-sm">{selectedProduct?.name || 'Selecione um produto'}</h2>
                      <div className="text-lg font-bold" style={{ color: config.primaryColor }}>
                        {selectedProduct ? (selectedProduct.price / 100).toFixed(2) : '0.00'} US$
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500">Secure checkout • 1 Pagamento Único</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your email address</label>
                    <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-sm">Enter the email to receive your purchase</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm your email</label>
                    <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-sm">Enter your email again</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your full name</label>
                    <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-sm">Enter your full name</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-md px-2 h-10 bg-gray-50 text-xs">
                        <span>🇧🇷</span> +55
                      </div>
                      <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex-1"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 text-[10px] font-medium ${paymentMethod === 'card' ? 'bg-gray-50 border-b-2 text-gray-900' : 'text-gray-500'}`} style={{ borderColor: paymentMethod === 'card' ? config.primaryColor : 'transparent' }} onClick={() => setPaymentMethod('card')}>
                      <CreditCard className="w-3 h-3" /> Credit Card
                    </button>
                    <button className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 text-[10px] font-medium ${paymentMethod === 'transfer' ? 'bg-gray-50 border-b-2 text-gray-900' : 'text-gray-500'}`} style={{ borderColor: paymentMethod === 'transfer' ? config.primaryColor : 'transparent' }} onClick={() => setPaymentMethod('transfer')}>
                      <Building2 className="w-3 h-3" /> Transfer
                    </button>
                    <button className={`flex-1 py-2 px-2 flex items-center justify-center gap-1 text-[10px] font-medium ${paymentMethod === 'paypal' ? 'bg-gray-50 border-b-2 text-gray-900' : 'text-gray-500'}`} style={{ borderColor: paymentMethod === 'paypal' ? config.primaryColor : 'transparent' }} onClick={() => setPaymentMethod('paypal')}>
                      <SiPaypal className="w-3 h-3 text-blue-600" /> PayPal
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1">Card number</label>
                      <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-xs">0000 0000 0000 0000</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">Expiration date</label>
                        <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-xs">MM/YY</div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">Security code</label>
                        <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-xs">CVV</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-700 mb-1">Account holder name</label>
                      <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-400 text-xs">Enter name printed on card</div>
                    </div>
                  </div>
                </div>

                {config.testimonial && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        {config.testimonial.imageUrl ? (
                          <img src={config.testimonial.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                            {config.testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{config.testimonial.name}</h4>
                        <div className="flex gap-0.5 my-1">
                          {[...Array(config.testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-600 italic">{config.testimonial.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {upsellProducts.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-3">Buy together</h3>
                    <div className="space-y-3">
                      {upsellProducts.map((p) => (
                        <div key={p.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                          <Checkbox checked disabled className="mt-1" />
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="w-14 h-14 object-cover rounded" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-sm">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-xs">{p.name}</h4>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                            <div className="mt-1 font-bold text-xs" style={{ color: config.primaryColor }}>
                              {(p.price / 100).toFixed(2)} US$
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={device === 'mobile' ? 'space-y-3' : 'space-y-3'}>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 text-sm mb-3">Order details</h3>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-600">{selectedProduct?.name || 'Produto'}</span>
                    <span className="font-medium">{selectedProduct ? (selectedProduct.price / 100).toFixed(2) : '0.00'} US$</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xs">Total</span>
                      <span className="font-bold text-lg" style={{ color: config.primaryColor }}>
                        {selectedProduct ? (selectedProduct.price / 100).toFixed(2) : '0.00'} US$
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 text-base font-bold"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.payButtonText}
                </Button>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                    <Lock className="w-2 h-2" />
                    Secured by <span className="font-bold">Berry Pay</span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="py-4 border-t border-gray-200 text-center">
              <p className="text-[10px] text-gray-400">{config.footerText}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
