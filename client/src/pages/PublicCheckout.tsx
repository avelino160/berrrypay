import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Star, Timer } from "lucide-react";
import { Product, Checkout, CheckoutConfig } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { SiPaypal } from "react-icons/si";

declare global {
  interface Window {
    paypal: any;
  }
}

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
  footerText: "BerryPay © 2026. All rights reserved.",
  primaryColor: "#22a559",
  backgroundColor: "#f9fafb",
  highlightColor: "#f3f4f6",
  textColor: "#111827",
  showChangeCountry: true,
  showTimer: false,
  showPhone: false,
};

export default function PublicCheckout() {
  const { slug } = useParams();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);

  const { data, isLoading, error } = useQuery<{ checkout: Checkout, product: Product }>({
    queryKey: [`/api/checkouts/public/${slug}`],
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const config: CheckoutConfig = data?.checkout?.config || defaultConfig;

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
    if (settings?.paypalClientId && !sdkLoaded) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${settings.paypalClientId}&components=buttons&currency=USD`;
      script.async = true;
      script.onload = () => setSdkLoaded(true);
      document.body.appendChild(script);
      return () => {
        const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
        if (existingScript) document.body.removeChild(existingScript);
      };
    }
  }, [settings, sdkLoaded]);

  useEffect(() => {
    if (sdkLoaded && data && window.paypal) {
      const container = document.getElementById("paypal-button-container");
      if (container) container.innerHTML = '';
      
      window.paypal.Buttons({
        createOrder: () => {
          return fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkoutId: data.checkout.id,
              productId: data.product.id,
            }),
          })
            .then((res) => res.json())
            .then((order) => order.id);
        },
        onApprove: (approveData: any) => {
          return fetch(`/api/paypal/capture-order/${approveData.orderID}`, {
            method: "POST",
          })
            .then((res) => res.json())
            .then(() => {
              alert("Pagamento aprovado com sucesso!");
              window.location.reload();
            });
        }
      }).render("#paypal-button-container");
    }
  }, [sdkLoaded, data]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: config.backgroundColor }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: config.primaryColor }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
        <h1 className="text-2xl font-bold mb-2">Link Inválido</h1>
        <p style={{ color: `${config.textColor}99` }}>Este checkout não existe ou foi desativado.</p>
      </div>
    );
  }

  const { product, checkout } = data;
  const upsellProducts = allProducts?.filter(p => config.upsellProducts.includes(p.id)) || [];
  const orderBumpProductData = allProducts?.find(p => p.id === config.orderBumpProduct);
  const testimonials = config.testimonials || [];

  const calculateTotal = () => {
    let total = product.price;
    if (orderBumpSelected && orderBumpProductData) {
      total += orderBumpProductData.price;
    }
    return total;
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
      {config.showTimer && (
        <div 
          className="py-4 px-6 text-center text-white flex items-center justify-center gap-6 pt-[20px] pb-[20px]"
          style={{ backgroundColor: config.timerColor }}
          data-testid="timer-bar"
        >
          <span className="font-mono tabular-nums text-[31px] font-extrabold bg-[transparent] text-justify" data-testid="timer-countdown">
            {formatTime(timerSeconds)}
          </span>
          <Timer className="w-8 h-8 animate-pulse" />
          <span className="tracking-tight font-normal text-[16px]" data-testid="timer-text">{config.timerText}</span>
        </div>
      )}

      {config.heroImageUrl && (
        <div className="py-2 px-4" style={{ backgroundColor: config.backgroundColor }}>
          <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
            <img src={config.heroImageUrl} alt="" className="w-full max-w-2xl h-auto object-contain transition-opacity duration-300" />
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 py-6 ${testimonials.length > 0 ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : 'flex justify-center'}`}>
        <div className={testimonials.length > 0 ? 'lg:col-span-2 space-y-4' : 'max-w-2xl w-full space-y-4'}>
          <div className="rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100" style={{ backgroundColor: config.highlightColor || '#ffffff' }}>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-contain rounded-md shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-md flex items-center justify-center font-bold" style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
                    {product.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h2 className="font-bold text-[17px]" style={{ color: config.textColor }} data-testid="product-name">{product.name}</h2>
                  <div className="text-lg font-bold" style={{ color: config.primaryColor }} data-testid="product-price">
                    {(product.price / 100).toFixed(2).replace('.', ',')} US$
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-tight font-medium" style={{ color: config.textColor }}>E-mail para receber o produto</label>
                <input 
                  type="email"
                  placeholder="Digite o e-mail que receberá a compra"
                  className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                  style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-tight font-medium" style={{ color: config.textColor }}>Confirme seu e-mail</label>
                <input 
                  type="email"
                  placeholder="Digite seu e-mail novamente"
                  className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                  style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                  data-testid="input-confirm-email"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] uppercase tracking-tight font-medium" style={{ color: config.textColor }}>Seu nome completo</label>
                <input 
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full h-11 px-3 rounded-md border border-gray-200 flex items-center text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                  style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                  data-testid="input-name"
                />
              </div>
              {config.showPhone && (
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-tight font-medium" style={{ color: config.textColor }}>Número de Telefone</label>
                  <div className="flex gap-2">
                    <Select defaultValue="BR">
                      <SelectTrigger className="w-[100px] h-11 border-gray-200 text-xs font-medium focus:ring-1 focus:ring-primary/20 focus:border-primary" style={{ backgroundColor: config.backgroundColor, color: config.textColor }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: config.highlightColor }}>
                        <SelectItem value="BR">
                          <div className="flex items-center gap-2">
                            <span>+55</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="US">
                          <div className="flex items-center gap-2">
                            <span>+1</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PT">
                          <div className="flex items-center gap-2">
                            <span>+351</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="AR">
                          <div className="flex items-center gap-2">
                            <span>+54</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ES">
                          <div className="flex items-center gap-2">
                            <span>+34</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="UK">
                          <div className="flex items-center gap-2">
                            <span>+44</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <input 
                      type="tel"
                      placeholder="(00) 00000-0000"
                      className="flex-1 h-11 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                      style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              )}
            </div>

            {orderBumpProductData && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4" style={{ fill: config.primaryColor, color: config.primaryColor }} />
                  <span className="font-bold text-sm" style={{ color: config.textColor }}>Você também pode gostar de:</span>
                </div>
                <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: config.primaryColor, backgroundColor: config.backgroundColor }}>
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
                    style={{ backgroundColor: config.primaryColor, borderTop: `1px solid ${config.primaryColor}30` }}
                  >
                    <Checkbox 
                      checked={orderBumpSelected} 
                      onCheckedChange={(checked) => setOrderBumpSelected(!!checked)}
                      className="border-white/50 bg-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                      data-testid="checkbox-order-bump" 
                    />
                    <span className="text-sm font-bold text-white">Quero comprar também!</span>
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
                <button className="flex-1 py-2 px-2 flex items-center justify-center gap-1 text-[10px] font-medium border-b-2" style={{ backgroundColor: config.backgroundColor, borderColor: config.primaryColor, color: config.textColor }}>
                  <SiPaypal className="w-3 h-3 text-blue-600" /> PayPal
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div id="paypal-button-container" className="min-h-[50px]">
                  {!sdkLoaded && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <h3 className="font-medium text-sm mb-3" style={{ color: config.textColor }}>Resumo do pedido</h3>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span style={{ color: `${config.textColor}99` }}>{product.name}</span>
                    <span className="font-medium" style={{ color: config.textColor }}>{(product.price / 100).toFixed(2).replace('.', ',')} US$</span>
                  </div>
                  {orderBumpSelected && orderBumpProductData && (
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span style={{ color: `${config.textColor}99` }}>{orderBumpProductData.name}</span>
                      <span className="font-medium" style={{ color: config.textColor }}>{(orderBumpProductData.price / 100).toFixed(2).replace('.', ',')} US$</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-xs" style={{ color: config.textColor }}>Total</span>
                    <span className="font-bold text-lg" style={{ color: config.primaryColor }} data-testid="total-price">
                      {(calculateTotal() / 100).toFixed(2).replace('.', ',')} US$
                    </span>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-bold mt-4"
                    style={{ backgroundColor: config.primaryColor }}
                    data-testid="button-buy-now"
                  >
                    {config.payButtonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {testimonials.length > 0 && (
          <div className="space-y-3">
            {testimonials.map((t) => (
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
                  <h4 className="font-bold text-lg mb-1" style={{ color: config.textColor }} data-testid={`testimonial-name-${t.id}`}>{t.name}</h4>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm font-medium leading-relaxed italic" style={{ color: `${config.textColor}cc` }} data-testid={`testimonial-text-${t.id}`}>
                    "{t.text.replace(/^["']|["']$/g, '')}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="py-4 border-t border-gray-200 text-center">
        <p className="text-[10px]" style={{ color: `${config.textColor}66` }} data-testid="footer-text">{config.footerText}</p>
      </footer>
    </div>
  );
}
