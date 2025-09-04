import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/clientes" element={
            <MainLayout>
              <Clientes />
            </MainLayout>
          } />
          <Route path="/veiculos" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Gestão de Veículos</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/servicos" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Gestão de Serviços</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/checklist" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Checklist de Veículos</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/materiais" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Gestão de Materiais</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/colaboradores" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Gestão de Colaboradores</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/agenda" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Agenda de Agendamentos</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/relatorios" element={
            <MainLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Relatórios e Métricas</h1>
                <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
              </div>
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
