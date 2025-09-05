export default function Fornecedores() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">Controle os fornecedores da empresa</p>
        </div>
      </div>

      <div className="p-8 text-center">
        <p className="text-lg">Página de Fornecedores funcionando!</p>
        <p className="text-muted-foreground mt-2">A página está carregando corretamente.</p>
      </div>
    </div>
  );
}
