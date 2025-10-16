import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookCheck, CheckCircle, Link as LinkIcon, FileText, Youtube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import { Course } from "@/types/course";
import { Module } from "@/types/module";

const CourseDetailPage = () => {
  const { id: courseId } = useParams();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses").select("*").eq("id", courseId).single();
      
      if (courseError) console.error("Error fetching course:", courseError);
      else setCourse(courseData);

      // Check enrollment status if user is logged in
      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("course_enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .single();
        
        if (enrollmentData) {
          setIsEnrolled(true);
          // Fetch modules if enrolled
          const { data: modulesData, error: modulesError } = await supabase
            .from("modules").select("*").eq("course_id", courseId).order("module_order");
          if (modulesError) console.error("Error fetching modules:", modulesError);
          else setModules(modulesData);
        }
      }
      setLoading(false);
    };

    fetchCourseData();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!session) {
      navigate("/login");
      return;
    }
    const { error } = await supabase
      .from("course_enrollments")
      .insert({ user_id: user!.id, course_id: courseId! });

    if (error) {
      showError("Erro ao se inscrever no curso: " + error.message);
    } else {
      showSuccess("Inscrição realizada com sucesso!");
      setIsEnrolled(true);
      // Re-fetch modules after enrollment
      const { data: modulesData } = await supabase
        .from("modules").select("*").eq("course_id", courseId!).order("module_order");
      setModules(modulesData || []);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : course ? (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">por {course.instructor}</p>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{course.description || "Nenhuma descrição disponível."}</p>
                </div>
              </div>
              <div>
                <img src={course.image_url || '/placeholder.svg'} alt={course.title} className="rounded-lg shadow-lg mb-4 w-full object-cover" />
                {isEnrolled ? (
                  <Button size="lg" className="w-full" disabled>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Você está inscrito
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={handleEnroll}>
                    <BookCheck className="mr-2 h-5 w-5" />
                    Inscrever-se no Curso
                  </Button>
                )}
              </div>
            </div>
            {isEnrolled && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Conteúdo do Curso</h2>
                {modules.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {modules.map(module => (
                      <AccordionItem value={module.id} key={module.id}>
                        <AccordionTrigger className="text-xl">{module.title}</AccordionTrigger>
                        <AccordionContent className="p-4 space-y-4">
                          <p className="text-muted-foreground">{module.description}</p>
                          <div className="flex flex-wrap gap-4">
                            {module.video_url && (
                              <a href={module.video_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline"><Youtube className="mr-2 h-4 w-4" /> Assistir Vídeo</Button>
                              </a>
                            )}
                            {module.pdf_url && (
                              <a href={module.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Baixar PDF</Button>
                              </a>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground text-center py-8">O conteúdo deste curso será adicionado em breve.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p>Curso não encontrado.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;