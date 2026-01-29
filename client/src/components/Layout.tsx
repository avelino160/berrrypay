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
    <div className="flex h-screen w-full bg-[#09090b] text-foreground overflow-hidden fixed inset-0">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden relative">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
