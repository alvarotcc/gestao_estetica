import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_fast.png";
import { useNotifications } from "@/hooks/useNotifications";

interface MainLayoutProps {
  children: React.ReactNode;
}

function Header() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { toggleSidebar, state } = useSidebar();

  const handleNotificationClick = () => {
    navigate('/notificacoes');
  };

  const isCollapsed = state === "collapsed";

  return (
    <header className="h-16 border-b bg-card shadow-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        {/* Removed the extra toggle button to avoid duplicate close icon */}
        {/* <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button> */}
        <div className="hidden md:flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar clientes, veículos..."
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <img src={logo} alt="Logo Fast" className="w-8 h-8 object-contain" />

        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
          U
        </div>
      </div>
    </header>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />

        <div className="flex-1 flex flex-col transition-all duration-300">
          <Header />

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
