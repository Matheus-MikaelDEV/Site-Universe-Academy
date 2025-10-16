import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CourseCard } from "@/components/course-card";

const Index = () => {
  const courses = [
    {
      title: "Design Thinking para Educadores",
      category: "Inovação",
      instructor: "Ana Clara",
      imageUrl: "/placeholder.svg",
    },
    {
      title: "Tecnologias na Sala de Aula",
      category: "Tecnologia",
      instructor: "Marcos Paulo",
      imageUrl: "/placeholder.svg",
    },
    {
      title: "Gestão de Projetos Educacionais",
      category: "Gestão",
      instructor: "Sofia Lima",
      imageUrl: "/placeholder.svg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 animate-fade-in-down">
              Expanda seu Universo na Educação
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Cursos online inovadores para professores e educadores que buscam
              transformar o aprendizado.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-bold text-lg px-8 py-6 transition-transform duration-300 hover:scale-105">
              Explorar Cursos
            </Button>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-16 bg-muted/40 dark:bg-muted/20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-10">
              Cursos Populares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.title} {...course} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;