import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCheckouts, useCreateCheckout } from "@/hooks/use-checkouts";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ShoppingCart, ExternalLink, Copy, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Checkouts() {
  const [, setLocation] = useLocation();
  const { data: checkouts, isLoading } = useCheckouts();
  const { data: products } = useProducts();
  const createCheckout = useCreateCheckout();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const [newCheckout, setNewCheckout] = useState({ 
    name: "", 
    slug: "", 
    productId: "" 
  });

  const handleCreate = () => {
    setLocation("/checkouts/new");
  };

  const copyLink = (publicUrl: string | null, slug: string) => {
    // Sempre construir o link baseado no host atual para garantir que seja funcional
    const link = `${window.location.origin}/checkout/${slug}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copiado!", description: "Link de checkout público copiado." });
  };

  return (
    <Layout title="Checkouts" subtitle="Páginas de venda personalizadas">
      <div className="flex justify-end mb-6">
        <Button 
          className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0 outline-none ring-0 focus-visible:ring-0"
          onClick={handleCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Checkout
        </Button>
      </div>

      {isLoading && checkouts === undefined ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : !checkouts || checkouts.length === 0 ? (
        <Card className="bg-[#18181b] border-zinc-800/60 flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-zinc-900 p-4 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Nenhum checkout</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            Você ainda não possui checkouts. Crie páginas de venda personalizadas para seus produtos e aumente sua conversão.
          </p>
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            onClick={handleCreate}
          >
            Criar meu primeiro checkout
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {checkouts?.map((checkout) => (
            <Card key={checkout.id} className="bg-[#18181b] border-zinc-800/60 hover:border-purple-500/30 transition-all cursor-pointer group overflow-hidden w-full">
              <div className="w-full aspect-square bg-zinc-900 relative overflow-hidden border-b border-zinc-800/50">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                  <ShoppingCart className="w-12 h-12 text-zinc-700" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2 py-1 rounded-full border backdrop-blur-md bg-blue-500/10 text-blue-500 border-blue-500/20">
                    /{checkout.slug}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{checkout.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {products?.find(p => p.id === checkout.productId)?.name || 'Produto desconhecido'}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800/50 pt-4 mt-2">
                  <div>
                    <p className="text-sm font-bold text-white">{checkout.views} visualizações</p>
                    <p className="text-xs text-zinc-500">Performance</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-zinc-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink(checkout.publicUrl, checkout.slug);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/checkouts/edit/${checkout.id}`);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implement delete functionality if available in hooks
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
