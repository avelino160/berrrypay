import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, Send, Image as ImageIcon, Globe, FileText, Layout as LayoutIcon, MessageCircle, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useRoute } from "wouter";

export default function EditProduct() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/products/edit/:id");
  const id = params?.id ? parseInt(params.id) : null;
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(id!);
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"link" | "file">("link");
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    description: "",
    deliveryUrl: "",
    whatsappUrl: "",
    imageUrl: "",
    noEmailDelivery: false,
    active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: (product.price / 100).toString(),
        description: product.description || "",
        deliveryUrl: product.deliveryUrl || "",
        whatsappUrl: product.whatsappUrl || "",
        imageUrl: product.imageUrl || "",
        noEmailDelivery: product.noEmailDelivery || false,
        active: product.active ?? true
      });
      if (product.deliveryFiles && product.deliveryFiles.length > 0) {
        setDeliveryMethod("file");
      }
    }
  }, [product]);

  const handleUpdate = async () => {
    if (!formData.name || !formData.price) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios", variant: "destructive" });
      setStep(1);
      return;
    }

    try {
      await updateProduct.mutateAsync({
        id: id!,
        name: formData.name,
        price: Math.round(parseFloat(formData.price) * 100),
        description: formData.description,
        deliveryUrl: formData.deliveryUrl,
        whatsappUrl: formData.whatsappUrl,
        imageUrl: formData.imageUrl,
        noEmailDelivery: formData.noEmailDelivery,
        active: formData.active
      });
      toast({ title: "Sucesso", description: "Produto atualizado com sucesso!" });
      setLocation("/products");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  if (isLoadingProduct) {
    return (
      <Layout title="Editar Produto">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </Layout>
    );
  }

  const steps = [
    { id: 1, title: "Informações básicas" },
    { id: 2, title: "Método de entrega" }
  ];

  return (
    <Layout title="Editar Produto" subtitle={`Editando: ${formData.name}`}>
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => setLocation("/products")} className="text-zinc-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8 px-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className="text-[10px] text-zinc-500">{s.title}</span>
                </div>
                {i < steps.length - 1 && <div className={`h-[1px] flex-1 mx-4 ${step > s.id ? 'bg-purple-600' : 'bg-zinc-800'}`} />}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-200">Capa do Produto</label>
                  <div 
                    className="border-2 border-dashed border-zinc-800 rounded-2xl w-[200px] h-[200px] mx-auto overflow-hidden cursor-pointer relative group"
                    onClick={() => document.getElementById('edit-image')?.click()}
                  >
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-500"><Plus /></div>
                    )}
                    <input id="edit-image" type="file" className="hidden" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setFormData({...formData, imageUrl: URL.createObjectURL(file)});
                    }} />
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-200">Nome</label>
                    <Input className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-200">Descrição</label>
                    <textarea className="w-full bg-black/40 border border-zinc-800 rounded-md p-3 min-h-[120px] text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-200">Preço (R$)</label>
                    <Input type="number" step="0.01" className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex gap-2">
                  <Button variant="outline" className={`flex-1 h-11 ${deliveryMethod === "link" ? "border-purple-500 text-purple-400" : ""}`} onClick={() => setDeliveryMethod("link")}>Link</Button>
                  <Button variant="outline" className={`flex-1 h-11 ${deliveryMethod === "file" ? "border-purple-500 text-purple-400" : ""}`} onClick={() => setDeliveryMethod("file")}>Arquivo</Button>
                </div>
                {deliveryMethod === "link" && (
                  <div className="space-y-4">
                    <Input className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" placeholder="URL de entrega" value={formData.deliveryUrl} onChange={e => setFormData({...formData, deliveryUrl: e.target.value})} />
                    <Input className="bg-black/40 border-zinc-800 h-11 focus-visible:ring-purple-500" placeholder="WhatsApp (opcional)" value={formData.whatsappUrl} onChange={e => setFormData({...formData, whatsappUrl: e.target.value})} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-zinc-800/50">
              {step > 1 && <Button variant="ghost" className="flex-1" onClick={() => setStep(step - 1)}>Voltar</Button>}
              <Button className="flex-[2] bg-purple-600 hover:bg-purple-500 h-12" onClick={() => step === 2 ? handleUpdate() : setStep(2)}>
                {updateProduct.isPending ? <Loader2 className="animate-spin" /> : step === 2 ? "Salvar Alterações" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}