import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Materiais() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Materiais</h1>
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Em desenvolvimento</CardTitle>
          <CardDescription>Esta página ainda está a ser desenvolvida.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">O formulário e a listagem de materiais serão adicionados em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}
