import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock functionality as per instructions
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Sucesso",
        description: "Se este e-mail estiver cadastrado, você receberá um link de recuperação.",
      });
      setLocation("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm p-6 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">Berry</span>
            <span className="text-white">Pay</span>
          </h1>
          <p className="text-zinc-500 text-sm">Recuperar sua senha</p>
        </div>

        <div className="bg-[#18181b]/80 backdrop-blur-xl border-0 p-6 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white h-11 focus:ring-purple-500/20 focus:border-purple-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl border-none outline-none ring-0 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Enviar Link</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 bg-[#18181b]/60 backdrop-blur-xl p-4 rounded-xl flex items-center justify-center gap-1 shadow-2xl ring-0 border-none outline-none">
          <p className="text-sm text-zinc-400">
            Lembrou a senha?{" "}
            <Link to="/login" className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors">
              Voltar ao login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          © 2026 BerryPay Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
