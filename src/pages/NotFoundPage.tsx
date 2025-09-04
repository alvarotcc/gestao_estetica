import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro local.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button asChild className="bg-gradient-primary gap-2">
            <a href="/">
              <Home className="w-4 h-4" />
              Ir para Dashboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;