import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Product, Checkout } from "@shared/schema";

export default function PublicCheckout() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery<{ checkout: Checkout, product: Product }>({
    queryKey: [`/api/checkouts/public/${slug}`],
  });

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

  const { product } = data;

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lado Esquerdo - Detalhes do Produto */}
        <div className="space-y-6">
          {product.imageUrl && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
          <div className="space-y-3 pt-6">
            <div className="flex items-center gap-3 text-zinc-400">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Acesso imediato após o pagamento</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <span>Pagamento 100% seguro via PayPal</span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Checkout */}
        <div>
          <Card className="bg-[#18181b] border-zinc-800 p-8 sticky top-8 shadow-2xl">
            <div className="text-center mb-8">
              <p className="text-zinc-400 mb-2 uppercase tracking-widest text-xs font-bold">Preço do Produto</p>
              <h2 className="text-5xl font-extrabold text-white">
                R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-900/20"
                onClick={() => {
                  // Aqui integraria com o botão real do PayPal
                  window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&amount=${product.price / 100}&currency_code=BRL&item_name=${encodeURIComponent(product.name)}`;
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Comprar Agora
              </Button>
              
              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-tighter">
                Você será redirecionado para o PayPal com segurança
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <div className="flex items-center justify-center gap-2 grayscale opacity-50">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg" alt="Pagamentos Aceitos" className="h-6 object-contain" />
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Rodapé Simples */}
      <footer className="mt-20 text-center border-t border-zinc-900 pt-8 pb-4">
        <p className="text-zinc-600 text-xs">
          BerryPay - Pagamentos Seguros &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
