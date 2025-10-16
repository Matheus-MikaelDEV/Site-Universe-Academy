import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold mb-4">Painel do Aluno</h1>
        <p className="text-lg text-muted-foreground">
          Bem-vindo, {user?.email}!
        </p>
        {/* Conteúdo do dashboard virá aqui */}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;