import { BottomNav } from "@/components/bottom-nav";
export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <div className="mx-auto min-h-screen max-w-md pb-24">{children}<BottomNav /></div>; }
