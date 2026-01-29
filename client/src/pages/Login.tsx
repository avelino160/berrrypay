import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">Cold</span>
            <span className="text-white">Pay</span>
          </h1>
          <p className="text-zinc-500 text-sm">Entre na sua conta de vendas</p>
        </div>

        <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl shadow-2xl shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-sm font-medium text-zinc-300 ml-1">Senha</label>
                 <a href="#" className="text-xs text-blue-500 hover:text-blue-400">Esqueceu?</a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all duration-300 border-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-500">
              Não tem conta?{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                Criar agora
              </a>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs text-zinc-600 mt-8">
          © 2026 ColdPay Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
