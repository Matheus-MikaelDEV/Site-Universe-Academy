import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookCheck } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  image_url: string;
}

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
      } else {
        setCourse(data);
      }
      setLoading(false);
    };

    fetchCourse();
  }, [id]);

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
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                por {course.instructor}
              </p>
              <div className="prose dark:prose-invert max-w-none">
                <p>{course.description || "Nenhuma descrição disponível para este curso."}</p>
              </div>
            </div>
            <div>
              <img src={course.image_url} alt={course.title} className="rounded-lg shadow-lg mb-4 w-full object-cover" />
              <Button size="lg" className="w-full">
                <BookCheck className="mr-2 h-5 w-5" />
                Inscrever-se no Curso
              </Button>
            </div>
          </div>
        ) : (
          <p>Curso não encontrado.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetailPage;