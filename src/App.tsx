import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Veiculos from "@/pages/Veiculos";
import Servicos from "@/pages/Servicos";
import Checklist from "@/pages/Checklist";
import Materiais from "@/pages/Materiais";
import Colaboradores from "@/pages/Colaboradores";
import Agenda from "@/pages/Agenda";
import Relatorios from "@/pages/Relatorios";
import NotFoundPage from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/gestao_estetica">
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
              <Veiculos />
            </MainLayout>
          } />
          <Route path="/servicos" element={
            <MainLayout>
              <Servicos />
            </MainLayout>
          } />
          <Route path="/checklist" element={
            <MainLayout>
              <Checklist />
            </MainLayout>
          } />
          <Route path="/materiais" element={
            <MainLayout>
              <Materiais />
            </MainLayout>
          } />
          <Route path="/colaboradores" element={
            <MainLayout>
              <Colaboradores />
            </MainLayout>
          } />
          <Route path="/agenda" element={
            <MainLayout>
              <Agenda />
            </MainLayout>
          } />
          <Route path="/relatorios" element={
            <MainLayout>
              <Relatorios />
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
