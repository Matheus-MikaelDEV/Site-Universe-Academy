import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10">Sobre a UniVerse Academy</h1>
          <p>
            Bem-vindo à UniVerse Academy, sua plataforma de lançamento para o futuro da educação. Nascemos da paixão por capacitar professores e educadores com as ferramentas e conhecimentos necessários para navegar e liderar no cenário educacional em constante evolução.
          </p>
          <p>
            Nossa missão é simples: fornecer cursos online inovadores, práticos e de alta qualidade que não apenas informam, mas também inspiram. Acreditamos que, ao investir no desenvolvimento de educadores, estamos investindo diretamente no futuro de inúmeros alunos.
          </p>
          <h2>Nossa Visão</h2>
          <p>
            Visualizamos um mundo onde cada educador se sente confiante e preparado para utilizar as mais recentes tecnologias e metodologias pedagógicas, criando ambientes de aprendizado mais engajadores, inclusivos e eficazes.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;