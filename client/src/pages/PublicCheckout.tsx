import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ShieldCheck, CheckCircle2, Clock, Settings, Plus, Star, User, Shield, Lock, CreditCard } from "lucide-react";
import { Product, Checkout } from "@shared/schema";
import { useState, useEffect, useMemo } from "react";

export default function PublicCheckout() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery<{ checkout: Checkout, product: Product }>({
    queryKey: [`/api/checkouts/public/${slug}`],
  });

  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // 15 minutos padrão
  const primaryColor = "#9333ea";
  const timerColor = "#f59e0b";

  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white p-4">
        <h1 className="text-2xl font-bold mb-2">Link Inválido</h1>
        <p className="text-zinc-400">Este checkout não existe ou foi desativado.</p>
      </div>
    );
  }

  const { product, checkout } = data;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Header / Timer */}
      <div 
        className="p-3 text-center text-white flex items-center justify-center gap-4 text-sm font-bold sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: timerColor }}
      >
        <div className="flex items-center gap-4 bg-black/20 px-6 py-2 rounded-2xl shadow-inner border border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="uppercase tracking-widest text-[10px] opacity-80">Oferta por Tempo Limitado:</span>
          </div>
          <div className="font-mono text-2xl font-black tracking-[0.2em] text-white tabular-nums">
            {formatTime(timerSeconds)}
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna da Esquerda - Dados e Pagamento */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Dados de Acesso</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome Completo</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" placeholder="Seu nome completo" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">E-mail para Acesso</label>
                  <input className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all" placeholder="exemplo@email.com" />
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
              <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-purple-500 bg-white" />
                  <span className="font-bold text-zinc-900">PayPal</span>
                </div>
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg" className="h-6 opacity-80" alt="PayPal" />
              </div>

              <Button 
                className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&amount=${product.price / 100}&currency_code=BRL&item_name=${encodeURIComponent(product.name)}`;
                }}
              >
                PAGAR AGORA
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
          <div className="space-y-4">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-2">O que dizem nossos clientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Mariana Silva", text: "Excelente conteúdo, recebi o acesso na hora!", stars: 5 },
                { name: "João Pedro", text: "Valeu cada centavo, suporte muito atencioso.", stars: 5 }
              ].map((proof, i) => (
                <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl shadow-sm">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(proof.stars)].map((_, s) => <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs font-bold text-zinc-900 mb-1">{proof.name}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed italic">"{proof.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna da Direita - Resumo */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-md border border-zinc-100" alt="" />
                ) : (
                  <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg border border-zinc-100">
                    {product.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">{product.name}</h2>
                  <p className="text-lg font-black mt-1" style={{ color: primaryColor }}>
                    R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    <span>{product.name}</span>
                    <span>R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-200/50 flex justify-between items-center">
                    <span className="text-zinc-900 font-black uppercase text-xs tracking-widest">Total</span>
                    <span className="text-3xl font-black" style={{ color: primaryColor }}>
                      R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
  );
}
