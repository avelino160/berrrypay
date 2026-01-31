import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Clock, Shield, Zap, Mail, Lock, CheckCircle2, Star, CreditCard, Building2, Timer } from "lucide-react";
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

export default function PublicCheckout() {
  const { slug } = useParams();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'paypal'>('card');
  const [selectedUpsells, setSelectedUpsells] = useState<number[]>([]);

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
    if (sdkLoaded && data && paymentMethod === 'paypal' && window.paypal) {
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
  }, [sdkLoaded, data, paymentMethod]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const toggleUpsell = (productId: number) => {
    setSelectedUpsells(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
        <h1 className="text-2xl font-bold mb-2">Link Inválido</h1>
        <p className="text-gray-500">Este checkout não existe ou foi desativado.</p>
      </div>
    );
  }

  const { product, checkout } = data;
  const upsellProducts = allProducts?.filter(p => config.upsellProducts.includes(p.id)) || [];

  const calculateTotal = () => {
    let total = product.price;
    selectedUpsells.forEach(id => {
      const upsell = allProducts?.find(p => p.id === id);
      if (upsell) total += upsell.price;
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div 
        className="py-2 px-4 text-center text-white sticky top-0 z-50 flex items-center justify-center gap-4"
        style={{ backgroundColor: config.primaryColor }}
        data-testid="timer-bar"
      >
        <span className="font-mono text-xl lg:text-2xl font-bold tracking-wider tabular-nums" data-testid="timer-countdown">
          {formatTime(timerSeconds)}
        </span>
        <Timer className="w-5 h-5 animate-pulse" />
        <span className="text-sm lg:text-base font-medium" data-testid="timer-text">{config.timerText}</span>
      </div>

      <div className="bg-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
          {config.heroImageUrl ? (
            <img src={config.heroImageUrl} alt="" className="w-full max-w-4xl h-auto object-contain transition-opacity duration-300" />
          ) : (
            <div className="w-full max-w-4xl h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
              <span className="text-gray-400 font-sans">Logo/Banner</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold text-xl">
                    {product.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-gray-400 text-xs uppercase tracking-wider">BY MOVE DIGITAL MARKETING</div>
                  <h2 className="font-bold text-gray-900" data-testid="product-name">{product.name}</h2>
                  <div className="text-xl font-bold" style={{ color: config.primaryColor }} data-testid="product-price">
                    {(product.price / 100).toFixed(2)} US$
                  </div>
                </div>
                {config.showChangeCountry && (
                  <button className="text-xs text-gray-500 underline" data-testid="change-country">
                    Change country
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Secure checkout • 1 Pagamento Único
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your email address</label>
                <Input placeholder="Enter the email to receive your purchase" className="h-11" data-testid="input-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm your email</label>
                <Input placeholder="Enter your email again" className="h-11" data-testid="input-confirm-email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your full name</label>
                <Input placeholder="Enter your full name" className="h-11" data-testid="input-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-md px-3 h-11 bg-gray-50 min-w-[80px]">
                    <span className="text-sm">🇧🇷</span>
                    <span className="text-sm text-gray-600">+55</span>
                  </div>
                  <Input placeholder="" className="h-11 flex-1" data-testid="input-phone" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    paymentMethod === 'card' 
                      ? 'bg-gray-50 border-b-2 border-green-600 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  data-testid="tab-credit-card"
                >
                  <CreditCard className="w-4 h-4" />
                  Credit Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    paymentMethod === 'transfer' 
                      ? 'bg-gray-50 border-b-2 border-green-600 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  data-testid="tab-transfer"
                >
                  <Building2 className="w-4 h-4" />
                  Instant Transfer
                </button>
                <button 
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'bg-gray-50 border-b-2 border-green-600 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  data-testid="tab-paypal"
                >
                  <SiPaypal className="w-4 h-4 text-blue-600" />
                  PayPal
                </button>
              </div>

              <div className="p-6">
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                      <Input placeholder="0000 0000 0000 0000" className="h-11" data-testid="input-card-number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration date</label>
                        <Input placeholder="MM/YY" className="h-11" data-testid="input-card-expiry" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security code</label>
                        <Input placeholder="3 or 4 digits code" className="h-11" data-testid="input-card-cvv" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account holder name</label>
                      <Input placeholder="Enter name printed on card" className="h-11" data-testid="input-card-holder" />
                    </div>
                  </div>
                )}
                {paymentMethod === 'transfer' && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Instant bank transfer will be available after checkout confirmation.</p>
                  </div>
                )}
                {paymentMethod === 'paypal' && (
                  <div id="paypal-button-container" className="min-h-[50px]">
                    {!sdkLoaded && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {config.testimonial && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {config.testimonial.imageUrl ? (
                      <img src={config.testimonial.imageUrl} alt={config.testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                        {config.testimonial.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900" data-testid="testimonial-name">{config.testimonial.name}</h4>
                    <div className="flex gap-0.5 my-1">
                      {[...Array(config.testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic" data-testid="testimonial-text">{config.testimonial.text}</p>
                  </div>
                </div>
              </div>
            )}

            {upsellProducts.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Buy together</h3>
                <div className="space-y-4">
                  {upsellProducts.map((upsell) => (
                    <div key={upsell.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:border-green-300 transition-colors">
                      <Checkbox 
                        checked={selectedUpsells.includes(upsell.id)}
                        onCheckedChange={() => toggleUpsell(upsell.id)}
                        className="mt-1"
                        data-testid={`checkbox-upsell-${upsell.id}`}
                      />
                      {upsell.imageUrl ? (
                        <img src={upsell.imageUrl} alt={upsell.name} className="w-20 h-20 object-cover rounded" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">
                          {upsell.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">{upsell.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{upsell.description}</p>
                        <div className="mt-2 font-bold text-green-600">
                          {(upsell.price / 100).toFixed(2)} US$
                        </div>
                      </div>
                      <button className="text-xs text-gray-400 hover:text-gray-600">+ Add to purchase</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Order details</h3>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-600">{product.name}</span>
                  <span className="font-medium">{(product.price / 100).toFixed(2)} US$</span>
                </div>
                {selectedUpsells.map(id => {
                  const upsell = allProducts?.find(p => p.id === id);
                  if (!upsell) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">{upsell.name}</span>
                      <span className="font-medium">{(upsell.price / 100).toFixed(2)} US$</span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl" style={{ color: config.primaryColor }}>
                      {(calculateTotal() / 100).toFixed(2)} US$
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold"
                style={{ backgroundColor: config.primaryColor }}
                data-testid="button-buy-now"
              >
                {config.payButtonText}
              </Button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  Secured by <span className="font-bold">BerryPay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center space-y-4 text-xs text-gray-400">
          <p>
            Have questions about this product? <a href="#" className="text-green-600 underline">Please contact</a>
          </p>
          <p>
            Can't complete a purchase? <a href="#" className="text-green-600 underline">Read our Help Center</a>
          </p>
          <p className="max-w-2xl mx-auto leading-relaxed">
            By clicking "Buy Now", I declare that: (i) I understand that BerryPay is processing this order on behalf of MOVE DIGITAL MARKETING and has no responsibility for the content and/or service delivered in this sale; (ii) I agree to BerryPay's Terms of Use and that I confirm consent to sales after verification of my legal age and authorization.
          </p>
          <p>
            Learn more about your purchase <a href="#" className="text-green-600 underline">here</a>.
          </p>
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400" data-testid="footer-text">{config.footerText}</p>
          <p className="text-[10px] text-gray-300 mt-1">2026-01-31 21:09:19 13.54Z #E2</p>
        </footer>
      </div>
    </div>
  );
}
