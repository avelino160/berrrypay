import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, PackageOpen, Search, Check, Send, Image as ImageIcon, Globe, FileText, Layout as LayoutIcon, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    description: "",
    deliveryUrl: "",
    whatsappUrl: "",
    imageUrl: "",
    enableCustomSupport: false,
    noEmailDelivery: false
  });

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync({
        name: newProduct.name,
        price: Number(newProduct.price) * 100,
        description: newProduct.description,
        active: true
      });
      setIsOpen(false);
      setStep(1);
      setNewProduct({ 
        name: "", price: "", description: "", 
        deliveryUrl: "", whatsappUrl: "", imageUrl: "",
        enableCustomSupport: false, noEmailDelivery: false
      });
      toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const steps = [
    { id: 1, title: "Informações básicas" },
    { id: 2, title: "Método de entrega" },
    { id: 3, title: "Imagem (opcional)" }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s.id ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}>
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${step >= s.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {s.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-[1px] flex-1 mx-4 ${step > s.id ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Layout title="Produtos" subtitle="Gerencie seus produtos">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
           <Input 
             className="pl-9 bg-zinc-900 border-zinc-800 text-sm h-9 focus-visible:ring-purple-500" 
             placeholder="Buscar produtos..." 
           />
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) setStep(1); }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 border-0 outline-none ring-0 focus-visible:ring-0">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#09090b] border-zinc-800 text-white sm:max-w-[550px] p-6 overflow-hidden">
            {renderStepIndicator()}

            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium pb-2 border-b border-zinc-800/50">
                    <LayoutIcon className="w-4 h-4 text-purple-500" />
                    Informações básicas
                  </div>
                  
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <PackageOpen className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <label className="text-sm font-bold text-zinc-200">Nome do produto</label>
                      </div>
                      <Input 
                        className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Ex: Curso completo de Marketing Digital"
                      />
                      <p className="text-[11px] text-zinc-500 ml-1">Este é o nome que aparecerá na página de checkout e no email</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <label className="text-sm font-bold text-zinc-200">Descrição</label>
                      </div>
                      <Input 
                        className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Descreva resumidamente o que está incluído no produto"
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-zinc-800 rounded-lg">
                        <span className="text-sm font-bold text-zinc-400">$</span>
                      </div>
                      <label className="text-sm font-bold text-zinc-200">Preço e Moeda</label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500">Moeda do produto</label>
                      <Select defaultValue="BRL">
                        <SelectTrigger className="bg-black/40 border-zinc-800 h-11">
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectItem value="BRL">BRL (R$) - Real Brasileiro</SelectItem>
                          <SelectItem value="USD">USD ($) - Dólar Americano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500">Valor</label>
                      <Input 
                        type="number"
                        className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="Ex: 97,00"
                      />
                      <p className="text-[11px] text-zinc-500 ml-1">Digite apenas números. Ex: 19700 = R$ 197,00</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-zinc-800 rounded-lg">
                          <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">Suporte ao Comprador</p>
                          <p className="text-[10px] text-zinc-500">Personalize as informações de contato no email de entrega</p>
                        </div>
                      </div>
                      <Switch 
                        checked={newProduct.enableCustomSupport}
                        onCheckedChange={(v) => setNewProduct({...newProduct, enableCustomSupport: v})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium pb-2 border-b border-zinc-800/50">
                    <Send className="w-4 h-4 text-purple-500" />
                    Entrega
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-zinc-900/50 border-purple-500/50 text-purple-400 h-11">
                      <Globe className="w-4 h-4 mr-2" /> Link
                    </Button>
                    <Button variant="outline" className="flex-1 bg-zinc-900/20 border-zinc-800 text-zinc-500 h-11">
                      <FileText className="w-4 h-4 mr-2" /> Arquivo
                    </Button>
                    <Button variant="outline" className="flex-1 bg-zinc-900/20 border-zinc-800 text-zinc-500 h-11">
                      <PackageOpen className="w-4 h-4 mr-2" /> Estoque
                    </Button>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Send className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Não enviar email de entrega</p>
                        <p className="text-[10px] text-zinc-500">Ative para produtos sem link (ex: área de membros, serviços)</p>
                      </div>
                    </div>
                    <Switch 
                      checked={newProduct.noEmailDelivery}
                      onCheckedChange={(v) => setNewProduct({...newProduct, noEmailDelivery: v})}
                    />
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Send className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xs text-blue-400 font-medium">Este link será enviado automaticamente por email após a compra</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-200">URL de entrega por Email</label>
                    <Input 
                      className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                      placeholder="https://drive.google.com/file/..."
                      value={newProduct.deliveryUrl}
                      onChange={e => setNewProduct({...newProduct, deliveryUrl: e.target.value})}
                    />
                    <p className="text-[11px] text-zinc-500">Ideal para: Google Drive, Dropbox, OneDrive, área de membros, etc.</p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">Este link será enviado via WhatsApp. Se vazio, usará o link do email acima.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-200">URL de entrega por WhatsApp (opcional)</label>
                    <Input 
                      className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                      placeholder="https://linkwhatsapp.com/... (deixe vazio para usar o link do email)"
                      value={newProduct.whatsappUrl}
                      onChange={e => setNewProduct({...newProduct, whatsappUrl: e.target.value})}
                    />
                    <p className="text-[11px] text-zinc-500">Útil quando você quer enviar links diferentes por email e WhatsApp</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-zinc-300 font-medium pb-2 border-b border-zinc-800/50">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    Imagem
                  </div>

                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Imagem do produto (opcional)</p>
                        <p className="text-[10px] text-zinc-500">Adicione uma imagem para deixar seu checkout mais atrativo</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-zinc-900/20 border-zinc-800 text-zinc-500 h-11">
                      <Globe className="w-4 h-4 mr-2" /> Usar URL
                    </Button>
                    <Button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-11">
                      <Plus className="w-4 h-4 mr-2" /> Fazer upload
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 bg-zinc-900/20">
                    <div className="p-3 bg-zinc-800/50 rounded-xl">
                      <ImageIcon className="w-6 h-6 text-zinc-500" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-zinc-300">Arraste uma imagem ou clique para selecionar</p>
                      <p className="text-xs text-zinc-500">JPG, PNG, WebP ou GIF (recomendado até ~1MB)</p>
                      <p className="text-[10px] text-zinc-600">Também aceita imagens arrastadas de outros sites</p>
                    </div>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg mt-0.5">
                      <span className="text-orange-500 font-bold text-sm">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Sobre URLs externas</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Se usar URL, só aceitamos provedores confiáveis (Firebase Storage, Google Cloud, Imgur, ImgBB). 
                        Se seu provedor não estiver na lista, use a opção "Fazer upload".
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50 mt-4">
                {step > 1 && (
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-11 text-zinc-400 hover:text-white"
                    onClick={() => setStep(step - 1)}
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  className="flex-[2] h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold" 
                  onClick={() => step === 3 ? handleCreate() : setStep(step + 1)}
                  disabled={createProduct.isPending}
                >
                  {createProduct.isPending ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : step === 3 ? (
                    "Criar Produto"
                  ) : (
                    "Próximo passo"
                  )}
                </Button>
              </div>
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
            <Card key={product.id} className="bg-[#18181b] border-zinc-800/60 hover:border-purple-500/30 transition-all cursor-pointer group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center">
                    <PackageOpen className="w-5 h-5 text-purple-500" />
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
                  <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-8">
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
