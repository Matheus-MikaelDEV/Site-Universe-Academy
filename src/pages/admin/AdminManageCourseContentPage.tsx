import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Course } from "@/types/course";
import { showError } from "@/utils/toast";

export default function AdminManageCourseContentPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        showError("Falha ao carregar o curso.");
        console.error(error);
      } else {
        setCourse(data);
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!course) {
    return <div>Curso não encontrado.</div>;
  }

  return (
    <div className="space-y-4">
      <Link to="/admin/courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Voltar para todos os cursos
      </Link>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Conteúdo: {course.title}</CardTitle>
            <CardDescription>Adicione e organize os módulos do curso.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Módulo
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            A funcionalidade para adicionar e listar módulos será implementada aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}