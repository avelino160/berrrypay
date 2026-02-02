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
import { ArrowLeft, Save, Monitor, Smartphone, Clock, Shield, Zap, Mail, Lock, CheckCircle2, Star, CreditCard, Building2, Copy, Plus, Trash2, Timer } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckoutConfig } from "@shared/schema";
import { SiPaypal } from "react-icons/si";
import ColorPicker from 'react-best-gradient-color-picker';

const defaultConfig: CheckoutConfig = {
  timerMinutes: 10,
  timerText: "Oferta Especial por Tempo Limitado!",
  timerColor: "#dc2626",
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
  testimonials: [],
  upsellProducts: [],
  orderBumpProduct: null,
  payButtonText: "Buy now",
  footerText: "BerryPay © 2026. Todos os direitos reservados.",
  primaryColor: "#22a559",
  backgroundColor: "#f9fafb",
  highlightColor: "#f3f4f6",
  textColor: "#111827",
  showChangeCountry: true,
  showTimer: false,
  showPhone: false,
  showCpf: false,
};

import { timerIcon } from "@/lib/assets";

// Helper function to generate a soft, light pastel version of a color
function getSoftBackgroundColor(color: string): string {
  let r = 0, g = 0, b = 0;
  
  // Handle different color formats
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    // Parse rgb(r, g, b) or rgba(r, g, b, a)
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
  } else if (color.startsWith('#')) {
    // Parse hex color
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else {
    // Fallback: try to parse as hex without #
    const hex = color;
    if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  
  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }
  
  // Create a soft pastel: keep hue, reduce saturation, increase lightness
  const newS = Math.min(s * 0.35, 0.25); // Soft saturation
  const newL = 0.94; // Very light
  
  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let newR, newG, newB;
  if (newS === 0) {
    newR = newG = newB = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
    const p = 2 * newL - q;
    newR = hue2rgb(p, q, h + 1/3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1/3);
  }
  
  // Convert back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'paypal'>('paypal');
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);
  
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [config, setConfig] = useState<CheckoutConfig>(defaultConfig);
  const [timerSeconds, setTimerSeconds] = useState(547); // 9 minutes and 7 seconds
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!name) {
      toast({ title: "Erro", description: "O nome do checkout é obrigatório", variant: "destructive" });
      return;
    }
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
  const orderBumpProductData = products?.find(p => p.id === config.orderBumpProduct);

  const toggleUpsell = (id: number) => {
    const current = config.upsellProducts || [];
    if (current.includes(id)) {
      setConfig({ ...config, upsellProducts: current.filter(x => x !== id) });
    } else {
      if (current.length >= 10) {
        toast({ title: "Limite atingido", description: "Você pode selecionar no máximo 10 produtos de upsell", variant: "destructive" });
        return;
      }
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
              <TabsTrigger value="testimonial" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Depoimento</TabsTrigger>
              <TabsTrigger value="visual" className="flex-1 text-xs data-[state=active]:bg-zinc-800">Visual</TabsTrigger>
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
              <Label className="text-xs text-zinc-400 font-bold uppercase">Opções de Exibição</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <Checkbox 
                    id="showTimer"
                    checked={config.showTimer}
                    onCheckedChange={(checked) => setConfig({...config, showTimer: !!checked})}
                    data-testid="checkbox-show-timer"
                  />
                  <Label htmlFor="showTimer" className="text-sm text-white cursor-pointer">Mostrar Timer de Oferta</Label>
                </div>
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <Checkbox 
                    id="showPhone"
                    checked={config.showPhone}
                    onCheckedChange={(checked) => setConfig({...config, showPhone: !!checked})}
                    data-testid="checkbox-show-phone"
                  />
                  <Label htmlFor="showPhone" className="text-sm text-white cursor-pointer">Mostrar Campo de Celular</Label>
                </div>
                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <Checkbox 
                    id="showCpf"
                    checked={config.showCpf}
                    onCheckedChange={(checked) => setConfig({...config, showCpf: !!checked})}
                    data-testid="checkbox-show-cpf"
                  />
                  <Label htmlFor="showCpf" className="text-sm text-white cursor-pointer">Mostrar Campo de CPF</Label>
                </div>
              </div>
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
              <Label className="text-xs text-zinc-400 font-bold uppercase">Upload de Banner (Hero)</Label>
              <div className="p-4 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const localUrl = URL.createObjectURL(file);
                      setConfig({...config, heroImageUrl: localUrl});

                      const xhr = new XMLHttpRequest();
                      const formData = new FormData();
                      formData.append("file", file);

                      xhr.upload.addEventListener("progress", (event) => {
                        if (event.lengthComputable) {
                          const percent = Math.round((event.loaded / event.total) * 95);
                          setUploadProgress(percent);
                        }
                      });

                      xhr.addEventListener("load", () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                          setUploadProgress(100);
                          setTimeout(() => {
                            try {
                              const data = JSON.parse(xhr.responseText);
                              setConfig({...config, heroImageUrl: data.url});
                              toast({ title: "Sucesso", description: "Banner enviado com sucesso!" });
                            } catch (err) {
                              toast({ title: "Erro", description: "Erro ao processar resposta", variant: "destructive" });
                            }
                            setUploadProgress(null);
                          }, 200);
                        } else {
                          toast({ title: "Erro", description: "Falha no upload", variant: "destructive" });
                          setUploadProgress(null);
                        }
                      });

                      xhr.addEventListener("error", () => {
                        toast({ title: "Erro", description: "Falha ao enviar imagem", variant: "destructive" });
                        setUploadProgress(null);
                      });

                      xhr.open("POST", "/api/upload");
                      xhr.send(formData);
                    }
                  }}
                  className="bg-transparent border-0 h-9 text-sm focus-visible:ring-0 p-0 file:bg-zinc-800 file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-zinc-700 cursor-pointer"
                  data-testid="input-hero-image-upload"
                />
              </div>
              {uploadProgress !== null && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
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

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Selecione produtos para upsell:</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
                {products?.filter(p => p.id.toString() !== productId).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <Checkbox 
                      checked={config.upsellProducts.includes(p.id)}
                      onCheckedChange={() => toggleUpsell(p.id)}
                      data-testid={`checkbox-upsell-${p.id}`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-zinc-500">{(p.price / 100).toFixed(2).replace('.', ',')} US$</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Order Bump (Você também pode gostar):</Label>
              <Select 
                value={config.orderBumpProduct?.toString() || "none"} 
                onValueChange={(val) => setConfig({...config, orderBumpProduct: val === "none" ? null : parseInt(val)})}
              >
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 h-9 text-sm" data-testid="select-order-bump">
                  <SelectValue placeholder="Nenhum produto selecionado" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="none">Nenhum</SelectItem>
                  {products?.filter(p => p.id.toString() !== productId).map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} - {(p.price / 100).toFixed(2).replace('.', ',')} US$</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Direitos Autorais do Rodapé</Label>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg text-zinc-500 text-xs italic">
                BerryPay © 2026. Todos os direitos reservados.
              </div>
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

          <TabsContent value="visual" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Cor do Timer</Label>
              <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
                <ColorPicker 
                  value={config.timerColor} 
                  onChange={(color) => setConfig({...config, timerColor: color})} 
                  hidePresets
                  hideOpacity
                  hideAdvancedSliders
                  hideColorTypeBtns
                  width={340}
                  height={150}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Cor Principal (Botões e Destaques)</Label>
              <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
                <ColorPicker 
                  value={config.primaryColor} 
                  onChange={(color) => setConfig({...config, primaryColor: color})} 
                  hidePresets
                  hideOpacity
                  hideAdvancedSliders
                  hideColorTypeBtns
                  width={340}
                  height={150}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Cor de Fundo</Label>
              <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
                <ColorPicker 
                  value={config.backgroundColor} 
                  onChange={(color) => setConfig({...config, backgroundColor: color})} 
                  hidePresets
                  hideOpacity
                  hideAdvancedSliders
                  hideColorTypeBtns
                  width={340}
                  height={150}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Cor de Destaque (Inputs/Cards)</Label>
              <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
                <ColorPicker 
                  value={config.highlightColor} 
                  onChange={(color) => setConfig({...config, highlightColor: color})} 
                  hidePresets
                  hideOpacity
                  hideAdvancedSliders
                  hideColorTypeBtns
                  width={340}
                  height={150}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Cor do Texto</Label>
              <div className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
                <ColorPicker 
                  value={config.textColor} 
                  onChange={(color) => setConfig({...config, textColor: color})} 
                  hidePresets
                  hideOpacity
                  hideAdvancedSliders
                  hideColorTypeBtns
                  width={340}
                  height={150}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testimonial" className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400 font-bold uppercase tracking-tight">Depoimentos</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] bg-zinc-900 border-zinc-800"
                disabled={(config.testimonials || []).length >= 3}
                onClick={() => {
                  if ((config.testimonials || []).length >= 3) {
                    toast({ title: "Limite atingido", description: "O máximo é de 3 depoimentos", variant: "destructive" });
                    return;
                  }
                  const newId = Math.random().toString(36).substring(2, 9);
                  const newList = [...(config.testimonials || []), {
                    id: newId,
                    name: "Novo Cliente",
                    imageUrl: "",
                    rating: 5,
                    text: "Escreva aqui o depoimento..."
                  }];
                  setConfig({...config, testimonials: newList});
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> Adicionar Depoimento
              </Button>
            </div>

            <div className="space-y-4">
              {(config.testimonials || []).map((t, index) => (
                <div key={t.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 text-zinc-500 hover:text-red-400"
                    onClick={() => {
                      const newList = config.testimonials.filter(x => x.id !== t.id);
                      setConfig({...config, testimonials: newList});
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-zinc-500 uppercase font-bold">Foto do Cliente</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex-shrink-0">
                          {t.imageUrl ? (
                            <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-lg">
                              {t.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <Input 
                          type="file"
                          accept="image/*"
                          className="bg-zinc-950 border-zinc-800 h-8 text-[10px] flex-1"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const xhr = new XMLHttpRequest();
                              const formData = new FormData();
                              formData.append("file", file);

                              xhr.upload.addEventListener("progress", (event) => {
                                if (event.lengthComputable) {
                                  const percent = Math.round((event.loaded / event.total) * 100);
                                  const newList = [...config.testimonials];
                                  // @ts-ignore - added progress to type locally
                                  newList[index].uploadProgress = percent;
                                  setConfig({...config, testimonials: newList});
                                }
                              });

                              xhr.addEventListener("load", () => {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                  try {
                                    const data = JSON.parse(xhr.responseText);
                                    const newList = [...config.testimonials];
                                    newList[index].imageUrl = data.url;
                                    // @ts-ignore
                                    newList[index].uploadProgress = null;
                                    setConfig({...config, testimonials: newList});
                                    toast({ title: "Sucesso", description: "Imagem enviada!" });
                                  } catch (err) {
                                    toast({ title: "Erro", description: "Erro ao processar resposta", variant: "destructive" });
                                  }
                                } else {
                                  toast({ title: "Erro", description: "Falha no upload", variant: "destructive" });
                                }
                              });

                              xhr.open("POST", "/api/upload");
                              xhr.send(formData);
                            }
                          }}
                        />
                      </div>
                      {/* @ts-ignore */}
                      {t.uploadProgress !== undefined && t.uploadProgress !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-bold">
                            <span>Enviando foto...</span>
                            {/* @ts-ignore */}
                            <span>{t.uploadProgress}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300" 
                              /* @ts-ignore */
                              style={{ width: `${t.uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-zinc-500 uppercase font-bold">Nome</Label>
                      <Input 
                        value={t.name}
                        onChange={(e) => {
                          const newList = [...config.testimonials];
                          newList[index].name = e.target.value;
                          setConfig({...config, testimonials: newList});
                        }}
                        className="bg-zinc-950 border-zinc-800 h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-zinc-500 uppercase font-bold">Avaliação (1-5)</Label>
                      <Input 
                        type="number"
                        min={1}
                        max={5}
                        value={t.rating}
                        onChange={(e) => {
                          const newList = [...config.testimonials];
                          newList[index].rating = parseInt(e.target.value) || 5;
                          setConfig({...config, testimonials: newList});
                        }}
                        className="bg-zinc-950 border-zinc-800 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500 uppercase font-bold">Depoimento</Label>
                    <Textarea 
                      value={t.text}
                      onChange={(e) => {
                        const newList = [...config.testimonials];
                        newList[index].text = e.target.value;
                        setConfig({...config, testimonials: newList});
                      }}
                      className="bg-zinc-950 border-zinc-800 text-xs min-h-[60px] resize-none"
                    />
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
          <div className={`h-fit ${device === 'desktop' ? 'w-full' : 'w-[375px] shadow-2xl rounded-xl overflow-hidden'}`} style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
            {config.showTimer && (
              <div 
                className="py-4 px-6 text-center text-white flex items-center justify-center gap-6 pt-[20px] pb-[20px]"
                style={{ backgroundColor: config.timerColor }}
              >
                <span className="font-mono tabular-nums text-[31px] font-extrabold bg-[transparent] text-justify">
                  {formatTime(timerSeconds)}
                </span>
                <Timer className="w-8 h-8 animate-pulse" />
                <span className="tracking-tight font-normal text-[16px]">{config.timerText}</span>
              </div>
            )}

            {config.heroImageUrl && (
              <div className="py-2 px-4" style={{ backgroundColor: config.backgroundColor }}>
                <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
                  <img src={config.heroImageUrl} alt="" className="w-full max-w-2xl h-auto object-contain transition-opacity duration-300" />
                </div>
              </div>
            )}

            <div className={`max-w-5xl mx-auto px-4 py-6 ${device === 'mobile' ? 'space-y-4' : (config.testimonials && config.testimonials.length > 0 ? 'grid grid-cols-3 gap-6' : 'flex justify-center')}`}>
              <div className={device === 'mobile' ? 'space-y-4' : (config.testimonials && config.testimonials.length > 0 ? 'col-span-2 space-y-4' : 'max-w-2xl w-full space-y-4')}>
                <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100" style={{ backgroundColor: config.backgroundColor }}>
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {selectedProduct?.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt="" className="w-20 h-20 object-contain rounded-md shadow-sm" />
                      ) : (
                        <div className="w-20 h-20 rounded-md flex items-center justify-center font-bold" style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
                          {selectedProduct?.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h2 className="font-bold text-[17px]" style={{ color: config.textColor }}>{selectedProduct?.name || 'Selecione um produto'}</h2>
                        <div className="text-lg font-bold" style={{ color: config.primaryColor }}>
                          {selectedProduct ? (selectedProduct.price / 100).toFixed(2).replace('.', ',') : '0,00'} US$
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] tracking-tight font-normal" style={{ color: config.textColor }}>Seu email</label>
                      <input 
                        type="email"
                        placeholder="Digite o e-mail para receber sua compra"
                        className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                        style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] tracking-tight font-normal" style={{ color: config.textColor }}>Confirme seu email</label>
                      <input 
                        type="email"
                        placeholder="Digite seu e-mail novamente"
                        className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                        style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                        data-testid="input-confirm-email"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] tracking-tight font-normal" style={{ color: config.textColor }}>Nome completo</label>
                      <input 
                        type="text"
                        placeholder="Digite seu nome completo"
                        className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                        style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                        data-testid="input-fullname"
                        required
                      />
                    </div>
                    {config.showPhone && (
                      <div className="space-y-1">
                        <label className="block text-[11px] tracking-tight font-normal" style={{ color: config.textColor }}>Celular</label>
                        <input 
                          type="tel"
                          placeholder="(00) 00000-0000"
                          className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                          style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                          data-testid="input-phone"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {orderBumpProductData && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4" style={{ fill: config.primaryColor, color: config.primaryColor }} />
                        <span className="font-bold text-sm" style={{ color: config.textColor }}>Você também pode gostar de:</span>
                      </div>
                      <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: config.primaryColor, backgroundColor: config.highlightColor }}>
                        <div className="flex items-start gap-3 p-3">
                          {orderBumpProductData.imageUrl ? (
                            <img src={orderBumpProductData.imageUrl} alt="" className="w-14 h-14 object-cover rounded bg-gray-900" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-900 rounded flex items-center justify-center text-white font-bold text-sm">
                              {orderBumpProductData.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm" style={{ color: config.textColor }}>{orderBumpProductData.name}</h4>
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: `${config.textColor}99` }}>{orderBumpProductData.description || 'Produto adicional'}</p>
                            <div className="mt-1 font-bold text-sm" style={{ color: config.primaryColor }}>
                              + R$ {(orderBumpProductData.price / 100).toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                        <label 
                          className="flex items-center gap-2 p-3 cursor-pointer" 
                          style={{ backgroundColor: getSoftBackgroundColor(config.primaryColor), borderTop: `1px solid ${config.primaryColor}30` }}
                        >
                            <Checkbox 
                              checked={orderBumpSelected} 
                              onCheckedChange={(checked) => setOrderBumpSelected(!!checked)}
                              className="data-[state=checked]:bg-[var(--primary-color)] data-[state=checked]:border-[var(--primary-color)]"
                              style={{ 
                                "--primary-color": config.primaryColor,
                                borderColor: config.primaryColor
                              } as React.CSSProperties}
                              data-testid="checkbox-order-bump-preview" 
                            />
                            <span className="text-sm font-medium" style={{ color: "#000000" }}>Quero comprar também!</span>
                          </label>
                      </div>
                    </div>
                  )}

                  {upsellProducts.length > 0 && (
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-3" style={{ color: config.textColor }}>Compre junto</h3>
                      <div className="space-y-3">
                        {upsellProducts.map((p) => (
                          <div key={p.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg" style={{ backgroundColor: config.backgroundColor }}>
                            <Checkbox checked disabled className="mt-1" />
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="w-14 h-14 object-cover rounded" />
                            ) : (
                              <div className="w-14 h-14 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: config.highlightColor, color: config.textColor }}>
                                {p.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-bold text-xs" style={{ color: config.textColor }}>{p.name}</h4>
                              <p className="text-[10px] mt-1 line-clamp-2" style={{ color: `${config.textColor}99` }}>{p.description}</p>
                              <div className="mt-1 font-bold text-xs" style={{ color: config.primaryColor }}>
                                {(p.price / 100).toFixed(2).replace('.', ',')} US$
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <div className="flex border-b border-gray-200">
                      <button className="flex-1 py-2 px-2 flex items-center justify-center gap-1 text-[10px] font-medium border-b-2" style={{ backgroundColor: config.backgroundColor, borderColor: config.primaryColor, color: config.textColor }} onClick={() => setPaymentMethod('paypal')}>
                        <SiPaypal className="w-3 h-3 text-blue-600" /> PayPal
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="pt-4">
                        <h3 className="text-sm mb-3 font-light" style={{ color: config.textColor }}>Detalhes da compra</h3>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span style={{ color: `${config.textColor}99` }}>{selectedProduct?.name || 'Produto Principal'}</span>
                          <span className="font-medium" style={{ color: config.textColor }}>{selectedProduct ? (selectedProduct.price / 100).toFixed(2).replace('.', ',') : '0,00'} US$</span>
                        </div>
                        {orderBumpSelected && orderBumpProductData && (
                          <div className="flex justify-between items-center text-xs mb-2">
                            <span style={{ color: `${config.textColor}99` }}>{orderBumpProductData.name}</span>
                            <span className="font-medium" style={{ color: config.textColor }}>{(orderBumpProductData.price / 100).toFixed(2).replace('.', ',')} US$</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="font-bold text-xs" style={{ color: config.textColor }}>Total</span>
                          <span className="font-bold text-lg" style={{ color: config.primaryColor }}>
                            {(() => {
                              const productPrice = selectedProduct?.price || 0;
                              const bumpPrice = orderBumpSelected && orderBumpProductData ? orderBumpProductData.price : 0;
                              return ((productPrice + bumpPrice) / 100).toFixed(2).replace('.', ',');
                            })()} US$
                          </span>
                        </div>
                        <Button 
                          className="w-full h-12 text-base font-bold mt-4"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          {config.payButtonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                  <div className={device === 'mobile' ? 'space-y-3' : 'space-y-3'}>
                    {(config.testimonials || []).map((t) => (
                      <div key={t.id} className="rounded-xl border border-gray-200 p-6 shadow-sm" style={{ backgroundColor: config.highlightColor }}>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white shadow-md" style={{ backgroundColor: config.backgroundColor }}>
                            {t.imageUrl ? (
                              <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xl" style={{ color: `${config.textColor}66` }}>
                                {t.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-lg mb-1" style={{ color: config.textColor }}>{t.name}</h4>
                          <div className="flex gap-1 mb-4">
                            {[...Array(t.rating)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic" style={{ color: `${config.textColor}cc` }}>
                            "{t.text.replace(/^["']|["']$/g, '')}"
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>
            </div>

            <footer className="py-4 border-t border-gray-200 text-center">
              <p className="text-[10px]" style={{ color: `${config.textColor}66` }}>{config.footerText}</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
