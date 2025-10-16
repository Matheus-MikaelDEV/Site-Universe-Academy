import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center p-8">
              <CardTitle className="text-4xl font-bold mb-2">Sobre a UniVerse Academy</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Sua plataforma de lançamento para o futuro da educação.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed space-y-6">
                <p>
                  Bem-vindo à UniVerse Academy! Nascemos da paixão por capacitar professores e educadores com as ferramentas e conhecimentos necessários para navegar e liderar no cenário educacional em constante evolução.
                </p>
                
                <div className="border-t my-8" />

                <h2 className="text-3xl font-bold !mb-4">Nossa Missão</h2>
                <p>
                  Fornecer cursos online inovadores, práticos e de alta qualidade que não apenas informam, mas também inspiram. Acreditamos que, ao investir no desenvolvimento de educadores, estamos investindo diretamente no futuro de inúmeros alunos.
                </p>

                <div className="border-t my-8" />

                <h2 className="text-3xl font-bold !mb-4">Nossa Visão</h2>
                <p>
                  Visualizamos um mundo onde cada educador se sente confiante e preparado para utilizar as mais recentes tecnologias e metodologias pedagógicas, criando ambientes de aprendizado mais engajadores, inclusivos e eficazes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;