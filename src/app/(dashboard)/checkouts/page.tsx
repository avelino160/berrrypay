"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { useCheckouts, useCreateCheckout } from "@/hooks/use-checkouts";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ShoppingCart, ExternalLink, Copy, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Checkouts() {
  const router = useRouter();
  const { data: checkouts, isLoading } = useCheckouts();
  const { data: products } = useProducts();
  const createCheckout = useCreateCheckout();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCheckout, setNewCheckout] = useState({ name: "", productId: "", slug: "" });

  const handleCreate = async () => {
    if (!newCheckout.name || !newCheckout.productId || !newCheckout.slug) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    try {
      await createCheckout.mutateAsync({
        name: newCheckout.name,
        productId: parseInt(newCheckout.productId),
        slug: newCheckout.slug,
      });
      toast({ title: "Sucesso", description: "Checkout criado com sucesso!" });
      setDialogOpen(false);
      setNewCheckout({ name: "", productId: "", slug: "" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copiado!", description: "URL copiada para a área de transferência" });
  };

  return (
    <>
      <Header title="Checkouts" subtitle="Gerencie suas páginas de checkout" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto pb-20">
          <div className="flex justify-end items-center mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Checkout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#18181b] border-zinc-800 text-white">
                <DialogHeader>
                  <DialogTitle>Criar novo checkout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-zinc-400">Nome do Checkout</label>
                    <Input
                      value={newCheckout.name}
                      onChange={(e) => setNewCheckout({ ...newCheckout, name: e.target.value })}
                      className="bg-zinc-900 border-zinc-800"
                      placeholder="Checkout Principal"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Produto</label>
                    <Select value={newCheckout.productId} onValueChange={(v) => setNewCheckout({ ...newCheckout, productId: v })}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18181b] border-zinc-800">
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Slug (URL)</label>
                    <Input
                      value={newCheckout.slug}
                      onChange={(e) => setNewCheckout({ ...newCheckout, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="bg-zinc-900 border-zinc-800"
                      placeholder="meu-produto"
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-purple-600 hover:bg-purple-500" disabled={createCheckout.isPending}>
                    {createCheckout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Checkout"}
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
              <h3 className="text-lg font-medium text-white mb-1">Nenhum checkout</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                Crie seu primeiro checkout para começar a vender.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {checkouts?.map((checkout) => (
                <Card key={checkout.id} className="bg-[#18181b] border-zinc-800/60 p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{checkout.name}</h3>
                    <p className="text-sm text-zinc-500">{checkout.publicUrl}</p>
                    <p className="text-xs text-zinc-600 mt-1">{checkout.views} visualizações</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => copyUrl(checkout.publicUrl || '')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => window.open(checkout.publicUrl, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/checkouts/edit/${checkout.id}`)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
