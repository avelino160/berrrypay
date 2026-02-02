import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative">
        {children}
      </div>
    </div>
  );
}
