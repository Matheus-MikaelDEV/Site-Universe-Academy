import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel do Administrador</CardTitle>
        <CardDescription>Visão geral do sistema e estatísticas.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bem-vindo à área administrativa da UniVerse Academy. Use o menu à esquerda para gerenciar o conteúdo do site.</p>
      </CardContent>
    </Card>
  );
}