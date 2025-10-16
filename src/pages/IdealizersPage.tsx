import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const idealizers = [
  {
    name: "Professor Dr. Plauto Simão de Carvalho",
    role: "Professor Titular da Universidade Estadual de Goiás (UEG)",
    avatar: "/plauto.png",
    fallback: "PS",
    bio: "O Professor Dr. Plauto Simão de Carvalho é Licenciado em Biologia (2004) pela Universidade Estadual de Goiás (UEG) com formação em coleta e estudos botânicos da flora do Cerrado, técnicas de herbário, e Anatomia Vegetal; Especialista em Biologia Vegetal (2006) pela Universidade Estadual de Goiás (UEG) com enfoque em estudos fitossociológicos e comunidades de plantas lenhosas de cerrado sentido restrito; Mestre em Botânica (2008) pela Universidade de Brasília (UnB) com enfoque em taxonomia de Myrtaceae, Doutor em Ecologia (2013) pela Universidade de Brasília (UnB) e Doutorado Sanduíche (2012) pela University of Oxford e Royal Botanic Gardens (Kew) com enfoque em ecologia de populações, sistemática filogenética e biogeografia de plantas da família Myrtaceae.\n\nAtualmente sou professor titular da Universidade Estadual de Goiás (UEG), atuo na graduação para os cursos de Biologia e Agronomia, sou membro permanente do PPG Ensino de Ciências - PPEC/UEG (2007-atual), coordenei o PPEC entre 2019-2024, atualmente sou vice-coordenador (2024-atual), com enfoque na formação de formação de professores, Metodologias Ativas de Ensino e Aprendizagem Significativa, coordenei Pibid Biologia/UEG entre 2006-2009, retomando como coordenador de área do Pibid/Biologia UEG Palmeiras de Goiás.\n\nMeus interesses são estudos de biodiversidade e ecologia do Cerrado, flora de Angiospermas e Sistemática Filogenética, Anatomia Vegetal, Myrtaceae; além disso me interesso por Ensino de Ciências, formação de professores, metodologias ativas e aprendizagem significativa.",
  },
  {
    name: "Welliton Correia Vale",
    role: "Licenciado em Química e Professor da Rede Estadual de Educação de Goiás",
    avatar: "/welintonvale.png",
    fallback: "WV",
    bio: "Licenciado em Química e professor da Rede Estadual de Educação de Goiás e discente do Programa de Pós-Graduação Stricto Sensu – Mestrado Profissional em Ensino de Ciências da Universidade Estadual de Goiás (UEG).\n\nEste espaço foi criado com o propósito de contribuir para a formação continuada de professores de Ciências da Natureza e Ciências da Natureza e suas Tecnologias, oferecendo conteúdos, reflexões e práticas pedagógicas que dialogam com os desafios do ensino contemporâneo.\n\nO site tem caráter de Produto Educacional, constituindo-se como um ambiente de apoio e atualização, voltado para ampliar horizontes, compartilhar experiências e fortalecer a atuação docente.\n\nAqui, você encontrará materiais e recursos pensados para potencializar o trabalho em sala de aula, promovendo aprendizagens significativas e estimulando o protagonismo do professor como agente transformador da educação.",
  },
  {
    name: "Matheus Mikael Justino de Azevedo",
    role: "Estudante de Ensino Médio e Técnico em Informática",
    avatar: "/mikael.png",
    fallback: "MA",
    bio: "Matheus Mikael Justino de Azevedo, nasci em 2008, sou um jovem fascinado por tecnologia e estou cursando a segunda série do Ensino Médio concomitante ao Técnico em Informática. Meu foco principal é o desenvolvimento Back-End, e domino Java e suas tecnologias. Também possuo familiaridade com HTML, CSS, JavaScript, Python, C e outras linguagens.\n\nCom uma paixão imensa por causar impacto positivo no mundo, estou me dedicando aos estudos na área de tecnologia, reconhecendo meus potenciais que poderão ser transformadores. Tenho sede por aprendizado, o me levou a ser escolhido para a 5ª Semana Nacional da Educação Profissional e Tecnológica, em Braslia, evento que explora o impacto da educação profissionalizante.\n\nTambém fui selecionado para participar da criação da UniVerse Academy, uma plataforma de cursos gratuitos com foco na educação brasileira, especialmente em Ciências da Natureza e Ciências da Natureza e suas Tecnologias. Essa oportunidade me motivou a buscar ainda mais conhecimento para criar as próprias soluções, mostrando meu desejo de fazer a diferença, exercendo meu protagonismo.",
  },
  {
    name: "Ester G. Tomaz",
    role: "Estudante de Ensino Médio e Técnico em Informática",
    avatar: "/ester.png",
    fallback: "ET",
    bio: "Nasci em 03 de março de 2009 e atualmente curso o 2º ano do Ensino Médio integrado ao Técnico em Informática. Desde cedo, desenvolvi uma forte paixão pela escrita, pelo desenho e pelas artes em geral, áreas nas quais encontro a melhor forma de expressar minha criatividade e identidade.\n\nNo projeto em desenvolvimento, sou responsável pela parte visual, atuando diretamente na elaboração da capa e na criação das ilustrações que representam o trabalho. Minha intenção é unir estética, originalidade e clareza para que cada elemento visual complemente a proposta do grupo, tornando-a mais envolvente e atrativa. Tenho familiaridade com desenhos digitais, pintura e diferentes formas de arte, além de facilidade em escrita e comunicação. Dialogar, ouvir e compreender diferentes perspectivas são características que me permitem colaborar de forma ativa e construtiva. Possuo também facilidade em resolver problemas e assumir papéis de liderança, exercendo de maneira natural a organização e o comando das atividades em grupo.",
  },
  {
    name: "Marcos Vinnicios",
    role: "Estudante de Ensino Médio e Técnico em Informática",
    avatar: "/marcos-vinnicios.jpg",
    fallback: "MV",
    bio: "Meu nome é Marcos Vinnicios, nasci em 2008 e atualmente curso o segundo ano do ensino médio integrado ao curso técnico em Informática. Tenho grande interesse por novas tecnologias e gosto muito de aprender sobre astronomia e psicologia.\n\nMeu objetivo atualmente é seguir carreira como programador. Pretendo começar a estudar e praticar linguagens como HTML, CSS, JavaScript, Python e C, sempre buscando evoluir minhas habilidades e ampliar meus conhecimentos.\n\nAcredito que o futuro é construído com dedicação e boas escolhas, e por isso quero me tornar uma pessoa bem-sucedida que consiga gerar impactos positivos para o mundo.",
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
                    <AvatarImage src={person.avatar} alt={person.name} loading="lazy" />
                    <AvatarFallback className="text-4xl">{person.fallback}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-2xl">{person.name}</CardTitle>
                    <p className="text-primary font-semibold text-md">{person.role}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="prose dark:prose-invert max-w-none">
                      {person.bio.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground mb-4 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
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