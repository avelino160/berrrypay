import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, PackageOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync({
        name: newProduct.name,
        price: Number(newProduct.price) * 100, // convert to cents
        description: newProduct.description,
        active: true
      });
      setIsOpen(false);
      setNewProduct({ name: "", price: "", description: "" });
      toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Layout title="Produtos" subtitle="Gerencie seus produtos">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <Input 
             className="pl-9 bg-zinc-900 border-zinc-800 text-sm h-9 focus-visible:ring-blue-500" 
             placeholder="Buscar produtos..." 
           />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0 outline-none ring-0 focus-visible:ring-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#18181b] border-zinc-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Nome do Produto</label>
                <Input 
                  className="bg-zinc-900 border-zinc-800" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Ex: E-book Marketing"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Preço (R$)</label>
                <Input 
                  type="number"
                  className="bg-zinc-900 border-zinc-800" 
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="97.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Descrição</label>
                <Input 
                  className="bg-zinc-900 border-zinc-800" 
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Breve descrição do produto..."
                />
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-500 mt-2 border-0 outline-none ring-0 focus-visible:ring-0" 
                onClick={handleCreate}
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Criar Produto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : products?.length === 0 ? (
        <Card className="bg-[#18181b] border-zinc-800/60 flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-zinc-900 p-4 rounded-full mb-4">
            <PackageOpen className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Nenhum produto encontrado</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            Você ainda não criou nenhum produto. Comece criando seu primeiro produto digital.
          </p>
          <Button 
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            onClick={() => setIsOpen(true)}
          >
            Criar meu primeiro produto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card key={product.id} className="bg-[#18181b] border-zinc-800/60 hover:border-blue-500/30 transition-all cursor-pointer group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
                    <PackageOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border ${product.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4 h-10">
                  {product.description || "Sem descrição definida."}
                </p>
                <div className="flex items-end justify-between border-t border-zinc-800/50 pt-4 mt-2">
                  <div>
                    <p className="text-xs text-zinc-500">Preço</p>
                    <p className="text-lg font-bold text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8">
                    Editar
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
