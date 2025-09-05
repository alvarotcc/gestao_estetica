# TODO - Corrigir botão de esconder menu

## Problema
O botão de esconder menu deixa a página em branco quando clicado.

## Análise
- O estado `sidebarCollapsed` no MainLayout.tsx não está conectado ao estado do sidebar context
- O botão usa `toggleSidebar()` mas o estado local não é atualizado
- Conflito entre controle manual de largura e sistema interno do sidebar
- Isso causava erros de DOM manipulation

## Correções aplicadas
- [x] Removido estado local conflitante sidebarCollapsed
- [x] Removido controle manual de largura do sidebar
- [x] Deixado SidebarProvider gerenciar estado interno
- [x] Corrigido conflito de classes CSS no AppSidebar
- [x] Implementado collapsible dinâmico (icon para desktop, offcanvas para mobile)

## Testes realizados
- [x] Toggle do sidebar funcionando sem erros DOM
- [x] Conteúdo principal permanece visível
- [x] Sidebar colapsa/expande corretamente em desktop
- [x] Sidebar funciona corretamente em mobile
- [x] Sem erros de removeChild no console

## Arquivos afetados
- src/components/layout/MainLayout.tsx
- src/components/layout/AppSidebar.tsx
- src/components/ui/sidebar.tsx
