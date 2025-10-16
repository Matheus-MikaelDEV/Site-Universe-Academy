import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFeedbackPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizar Feedbacks</CardTitle>
        <CardDescription>Veja as mensagens enviadas pelos usuários.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A lista de feedbacks será exibida aqui.</p>
      </CardContent>
    </Card>
  );
}