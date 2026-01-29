import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Layout as LayoutIcon, Palette, Settings } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";

export default function CheckoutEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/checkouts/edit/:id");
  const isNew = !params?.id;
  const [activeTab, setActiveTab] = useState("design");

  return (
    <Layout title={isNew ? "Novo Checkout" : "Editar Checkout"} subtitle="Personalize sua página de vendas">
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => window.close()} className="text-zinc-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> Sair do Editor
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white px-8">
            <Save className="w-4 h-4 mr-2" /> Salvar Checkout
          </Button>
        </div>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Sidebar Editor */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex bg-[#18181b] p-1 rounded-lg border border-zinc-800">
              <Button 
                variant="ghost" 
                className={`flex-1 text-xs h-8 ${activeTab === 'design' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                onClick={() => setActiveTab('design')}
              >
                <Palette className="w-3.5 h-3.5 mr-2" /> Design
              </Button>
              <Button 
                variant="ghost" 
                className={`flex-1 text-xs h-8 ${activeTab === 'content' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                onClick={() => setActiveTab('content')}
              >
                <LayoutIcon className="w-3.5 h-3.5 mr-2" /> Conteúdo
              </Button>
              <Button 
                variant="ghost" 
                className={`flex-1 text-xs h-8 ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-3.5 h-3.5 mr-2" /> Ajustes
              </Button>
            </div>

            <Card className="bg-[#18181b] border-zinc-800/60 p-4">
              <h4 className="text-sm font-bold text-white mb-4">Configurações visuais</h4>
              <p className="text-xs text-zinc-500">O editor visual está sendo configurado. Em breve você poderá arrastar elementos e mudar cores em tempo real.</p>
            </Card>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/60 overflow-hidden relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest font-bold z-10">
              Visualização ao vivo
            </div>
            <div className="w-full h-full flex items-center justify-center p-12">
              <div className="max-w-md w-full bg-[#09090b] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden aspect-[9/16] scale-90">
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <LayoutIcon className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Preview do Checkout</h3>
                  <p className="text-sm text-zinc-500">Seus clientes verão esta página ao clicar no seu link de vendas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
