"use client";

import React from "react"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }
    
    setIsLoading(true);
    
    // Simular registro
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">Berry</span>
            <span className="text-white">Pay</span>
          </h1>
          <p className="text-zinc-500 text-sm">Crie sua conta</p>
        </div>

        <div className="bg-[#18181b]/80 backdrop-blur-xl p-6 rounded-xl shadow-2xl shadow-black/50">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Nome</label>
              <Input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-500/20 focus:border-purple-500 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-500/20 focus:border-purple-500 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Senha</label>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-500/20 focus:border-purple-500 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 ml-1">Confirmar Senha</label>
              <Input
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:ring-purple-500/20 focus:border-purple-500 h-11"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando conta...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Criar conta</span>
                </div>
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 bg-[#18181b]/60 backdrop-blur-xl p-4 rounded-xl flex items-center justify-center gap-1">
          <p className="text-sm text-zinc-400">Ja tem conta?</p>
          <Link 
            href="/"
            className="text-sm text-purple-500 hover:text-purple-400 font-medium transition-colors"
          >
            Entrar
          </Link>
        </div>
        
        <p className="text-center text-xs text-zinc-600 mt-8">
          2026 BerryPay Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
