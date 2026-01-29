import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, PackageOpen, Check, Send, Image as ImageIcon, Globe, FileText, Layout as LayoutIcon, MessageCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

export default function CreateProduct() {
  const [, setLocation] = useLocation();
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"link" | "file">("link");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
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
    if (!newProduct.name || !newProduct.price) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha o nome e o preço do produto.", 
        variant: "destructive" 
      });
      setStep(1);
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: newProduct.name,
        price: Math.round(parseFloat(newProduct.price) * 100),
        description: newProduct.description,
        deliveryUrl: newProduct.deliveryUrl,
        whatsappUrl: newProduct.whatsappUrl,
        imageUrl: newProduct.imageUrl,
        noEmailDelivery: newProduct.noEmailDelivery,
        active: true
      });
      toast({ title: "Sucesso", description: "Produto criado com sucesso!" });
      setLocation("/products");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return newProduct.name.trim() !== "" && newProduct.price.trim() !== "";
    }
    if (step === 2) {
      // If "noEmailDelivery" is NOT checked, we require a delivery URL
      if (!newProduct.noEmailDelivery) {
        return newProduct.deliveryUrl.trim() !== "";
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      toast({
        title: "Atenção",
        description: "Preencha as informações obrigatórias para continuar.",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };

  const steps = [
    { id: 1, title: "Informações básicas" },
    { id: 2, title: "Método de entrega" }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-2 max-w-2xl mx-auto">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}>
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${step >= s.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {s.title}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-[1px] flex-1 mx-4 ${step > s.id ? 'bg-purple-600' : 'bg-zinc-800'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Layout title="Criar Novo Produto" subtitle="Siga as etapas para cadastrar seu produto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="text-zinc-400 hover:text-white -ml-2"
          onClick={() => setLocation("/products")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para produtos
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-8 shadow-xl">
          {renderStepIndicator()}

          <div className="space-y-6 mt-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-zinc-300 font-medium pb-2 border-b border-zinc-800/50">
                  <LayoutIcon className="w-4 h-4 text-purple-500" />
                  Informações básicas
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-200">Capa do Produto</label>
                  <div 
                    className="border-2 border-dashed border-zinc-800 rounded-2xl p-0 flex flex-col items-center justify-center bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors cursor-pointer group relative overflow-hidden w-[200px] h-[200px] mx-auto"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {newProduct.imageUrl ? (
                      <>
                        <img src={newProduct.imageUrl} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10">
                          <ImageIcon className="w-8 h-8 text-white" />
                          <p className="text-xs font-bold text-white text-center px-2">Alterar capa</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-zinc-800/50 rounded-2xl group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-zinc-500" />
                        </div>
                        <div className="text-center space-y-1 p-4">
                          <p className="text-xs font-bold text-zinc-300">Capa Quadrada</p>
                          <p className="text-[10px] text-zinc-500">500x500px</p>
                        </div>
                      </>
                    )}
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setNewProduct({...newProduct, imageUrl: url});
                        }
                      }}
                    />
                  </div>
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
                    <textarea 
                      className="w-full bg-black/40 border border-zinc-800 rounded-md min-h-[150px] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 resize-none" 
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Descreva detalhadamente o que seu cliente receberá ao comprar este produto..."
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
                    <Select defaultValue="USD" disabled>
                      <SelectTrigger className="bg-black/40 border-zinc-800 h-11 opacity-50 cursor-not-allowed">
                        <SelectValue placeholder="USD ($) - Dólar Americano" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="USD">USD ($) - Dólar Americano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500">Valor (USD)</label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" 
                      value={newProduct.price}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          setNewProduct({...newProduct, price: val});
                        }
                      }}
                      placeholder="Ex: 19.90"
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
                  <Button 
                    variant="outline" 
                    className={`flex-1 h-11 transition-all ${deliveryMethod === "link" ? "bg-zinc-900 border-purple-500/50 text-purple-400" : "bg-zinc-900/20 border-zinc-800 text-zinc-500"}`}
                    onClick={() => setDeliveryMethod("link")}
                  >
                    <Globe className="w-4 h-4 mr-2" /> Link
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`flex-1 h-11 transition-all ${deliveryMethod === "file" ? "bg-zinc-900 border-purple-500/50 text-purple-400" : "bg-zinc-900/20 border-zinc-800 text-zinc-500"}`}
                    onClick={() => setDeliveryMethod("file")}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Arquivo
                  </Button>
                </div>

                {deliveryMethod === "link" ? (
                  <>
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
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3">
                       <MessageCircle className="w-4 h-4 text-emerald-500" />
                       <p className="text-sm text-emerald-500">Este arquivo será enviado via WhatsApp após a compra</p>
                    </div>

                    <div 
                      className="border-2 border-dashed border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                      onClick={() => document.getElementById('file-delivery-upload')?.click()}
                    >
                      <div className="p-4 bg-zinc-800/50 rounded-2xl group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-zinc-500" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-base font-bold text-zinc-300">Arraste um arquivo ou clique para selecionar</p>
                        <p className="text-sm text-zinc-500">Tamanho máximo: 64MB • Limite: 20 arquivos</p>
                        <p className="text-xs text-zinc-600">Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, imagens, vídeos, áudios, ZIP</p>
                      </div>
                      <input 
                        id="file-delivery-upload" 
                        type="file" 
                        multiple
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length + deliveryFiles.length > 20) {
                            toast({ 
                              title: "Limite excedido", 
                              description: "Você só pode fazer upload de no máximo 20 arquivos.", 
                              variant: "destructive" 
                            });
                            return;
                          }
                          setDeliveryFiles(prev => [...prev, ...files]);
                          toast({ 
                            title: "Arquivos selecionados", 
                            description: `${files.length} arquivo(s) adicionado(s). Total: ${deliveryFiles.length + files.length}/20` 
                          });
                        }}
                      />
                    </div>

                    {deliveryFiles.length > 0 && (
                      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Arquivos adicionados ({deliveryFiles.length}/20)</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => setDeliveryFiles([])}
                          >
                            Remover todos
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {deliveryFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg group">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                                <span className="text-[10px] text-zinc-600 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeliveryFiles(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-zinc-500 rotate-45" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}            <div className="flex items-center gap-3 pt-6 border-t border-zinc-800/50 mt-6">
              {step > 1 && (
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 text-zinc-400 hover:text-white"
                  onClick={() => setStep(step - 1)}
                >
                  Voltar
                </Button>
              )}
              <Button 
                className="flex-[2] h-12 bg-purple-600 hover:bg-purple-500 text-white font-bold" 
                onClick={() => step === 2 ? handleCreate() : handleNext()}
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : step === 2 ? (
                  "Finalizar e Criar Produto"
                ) : (
                  "Próximo passo"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
