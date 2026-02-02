import React from "react"
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "BerryPay - Plataforma de Vendas",
  description: "Sistema de gerenciamento de checkouts e vendas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
