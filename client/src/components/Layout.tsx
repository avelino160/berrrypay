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
    <div className="fixed inset-0 h-screen w-screen bg-[#09090b] text-foreground flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth bg-[#09090b]">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
