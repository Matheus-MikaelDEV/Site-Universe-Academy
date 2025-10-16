import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const idealizers = [
  { name: "Idealizador 1", role: "CEO & Fundador", avatar: "/placeholder.svg", fallback: "I1" },
  { name: "Idealizador 2", role: "Chefe de Pedagogia", avatar: "/placeholder.svg", fallback: "I2" },
];

const IdealizersPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Nossos Idealizadores</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {idealizers.map((person) => (
            <Card key={person.name} className="text-center">
              <CardHeader>
                <Avatar className="mx-auto h-24 w-24 mb-4">
                  <AvatarImage src={person.avatar} alt={person.name} />
                  <AvatarFallback>{person.fallback}</AvatarFallback>
                </Avatar>
                <CardTitle>{person.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{person.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdealizersPage;