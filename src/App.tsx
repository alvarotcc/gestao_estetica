// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Veiculos from "./pages/Veiculos";
import Servicos from "./pages/Servicos";
import Materiais from "./pages/Materiais";
import Fornecedores from "./pages/Fornecedores";
import Agenda from "./pages/Agenda";
import Checklist from "./pages/Checklist";
import Relatorios from "./pages/Relatorios";
import OrdemServico from "./pages/OrdemServico";
import Financeiro from "./pages/Financeiro";
import HistoricoServicos from "./pages/HistoricoServicos";
import ControleCaixa from "./pages/ControleCaixa";
import Notificacoes from "./pages/Notificacoes";
import ChecklistTemplates from "./pages/ChecklistTemplates";
import Colaboradores from "./pages/Colaboradores";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFoundPage from "./pages/NotFoundPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userData?.role !== "manager") {
    return <Navigate to="/" replace />;
  }

  return children;
}

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/gestao_estetica">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Clientes />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/veiculos"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Veiculos />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/servicos"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Servicos />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/checklist"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Checklist />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/checklist-templates"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <ChecklistTemplates />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/materiais"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Materiais />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/fornecedores"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Fornecedores />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/colaboradores"
              element={
                <AdminRoute>
                  <MainLayout>
                    <Colaboradores />
                  </MainLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Agenda />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Relatorios />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ordem-servico"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <OrdemServico />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/financeiro"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Financeiro />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/historico-servicos"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <HistoricoServicos />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notificacoes"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Notificacoes />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/controle-caixa"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <ControleCaixa />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;

