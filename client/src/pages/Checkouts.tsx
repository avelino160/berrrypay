import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCheckouts, useCreateCheckout } from "@/hooks/use-checkouts";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ShoppingCart, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkouts() {
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

  const handleCreate = async () => {
    try {
      await createCheckout.mutateAsync({
        name: newCheckout.name,
        slug: newCheckout.slug,
        productId: Number(newCheckout.productId),
        active: true
      });
      setIsOpen(false);
      setNewCheckout({ name: "", slug: "", productId: "" });
      toast({ title: "Sucesso", description: "Checkout criado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://coldpay.app/${slug}`);
    toast({ title: "Copiado!", description: "Link do checkout copiado para a área de transferência." });
  };

  return (
    <Layout title="Checkouts" subtitle="Páginas de venda personalizadas">
      <div className="flex justify-end mb-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0 outline-none ring-0 focus-visible:ring-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Checkout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Nome Interno</label>
                <Input 
                  className="bg-zinc-900 border-zinc-800" 
                  value={newCheckout.name}
                  onChange={e => setNewCheckout({...newCheckout, name: e.target.value})}
                  placeholder="Ex: Oferta Black Friday"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Produto Vinculado</label>
                <Select 
                  onValueChange={(val) => setNewCheckout({...newCheckout, productId: val})}
                  value={newCheckout.productId}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {products?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Slug (URL)</label>
                <div className="flex items-center">
                  <span className="bg-zinc-800 border border-r-0 border-zinc-700 px-3 py-2 text-sm text-zinc-500 rounded-l-md h-10 flex items-center">/</span>
                  <Input 
                    className="bg-zinc-900 border-zinc-800 rounded-l-none" 
                    value={newCheckout.slug}
                    onChange={e => setNewCheckout({...newCheckout, slug: e.target.value})}
                    placeholder="promocao-especial"
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-500 mt-2 border-0 outline-none ring-0 focus-visible:ring-0" 
                onClick={handleCreate}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Criar Checkout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : checkouts?.length === 0 ? (
        <Card className="bg-[#18181b] border-zinc-800/60 flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-zinc-900 p-4 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Nenhum checkout encontrado</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            Crie páginas de checkout personalizadas para seus produtos e aumente sua conversão.
          </p>
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            onClick={() => setIsOpen(true)}
          >
            Criar meu primeiro checkout
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {checkouts?.map((checkout) => (
            <Card key={checkout.id} className="bg-[#18181b] border-zinc-800/60 hover:border-zinc-700 transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{checkout.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      /{checkout.slug}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Produto: {products?.find(p => p.id === checkout.productId)?.name || 'Produto desconhecido'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white">{checkout.views} visualizações</p>
                  <p className="text-xs text-zinc-500">Performance</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-9 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" onClick={() => copyLink(checkout.slug)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-zinc-500 hover:text-blue-500">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
