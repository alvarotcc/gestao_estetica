import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  CheckSquare, 
  Package, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  LogOut,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.png";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Veículos", url: "/veiculos", icon: Car },
  { title: "Serviços", url: "/servicos", icon: Wrench },
  { title: "Checklist", url: "/checklist", icon: CheckSquare },
  { title: "Materiais", url: "/materiais", icon: Package },
  { title: "Colaboradores", url: "/colaboradores", icon: UserCheck },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-primary text-primary-foreground shadow-elegant font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-secondary to-secondary/90">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border/50">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <img src={logo} alt="Kron Studio Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="text-lg font-bold text-secondary-foreground">Kron Studio</h2>
                <p className="text-xs text-muted-foreground">Gestão Profissional</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
              <img src={logo} alt="Kron Studio Logo" className="w-6 h-6 object-contain" />
            </div>
          )}
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-secondary-foreground/80 text-xs font-semibold uppercase tracking-wider px-4 py-2">
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className={`${collapsed ? 'w-10 h-10 p-0' : 'w-full'} text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors`}
          >
            <LogOut className={`w-4 h-4 ${!collapsed ? 'mr-2' : ''}`} />
            {!collapsed && "Sair"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
