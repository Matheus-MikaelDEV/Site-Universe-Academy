import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardPage = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is determined to be an admin, redirect them immediately.
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  // While checking the user's role or redirecting, show a loading state.
  if (loading || isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container py-12 space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-2/4" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Painel do Aluno</h1>
          <p className="text-lg text-muted-foreground">
            Bem-vindo de volta, {profile?.full_name || user?.email}!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meus Cursos Concluídos</CardTitle>
            <CardDescription>
              Aqui você pode ver os cursos que completou e gerar seus certificados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder: Logic to fetch and display completed courses will go here */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">Você ainda não concluiu nenhum curso.</p>
              <Badge variant="outline" className="mt-2">Em breve</Badge>
            </div>
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;