import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const idealizers = [
  {
    name: "Ana Silva",
    role: "CEO & Fundadora",
    avatar: "/placeholder.svg",
    fallback: "AS",
    bio: "Ana é uma educadora apaixonada com mais de 15 anos de experiência em tecnologia educacional. Sua visão é criar uma plataforma que capacite professores a moldar o futuro da educação.",
  },
  {
    name: "Carlos Mendes",
    role: "Chefe de Pedagogia",
    avatar: "/placeholder.svg",
    fallback: "CM",
    bio: "Com doutorado em Ciências da Educação, Carlos é o cérebro por trás da nossa metodologia de ensino inovadora. Ele garante que cada curso seja pedagogicamente sólido e altamente engajador.",
  },
];

const IdealizersPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Nossos Idealizadores</h1>
        <div className="space-y-8 max-w-4xl mx-auto">
          {idealizers.map((person) => (
            <Card key={person.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                <div className="flex-shrink-0 p-6 flex items-center justify-center md:w-1/3 bg-muted/40">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="text-4xl">{person.fallback}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-2xl">{person.name}</CardTitle>
                    <p className="text-primary font-semibold text-md">{person.role}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground">{person.bio}</p>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdealizersPage;