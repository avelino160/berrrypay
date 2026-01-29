import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
