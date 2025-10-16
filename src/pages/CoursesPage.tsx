import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CourseCard } from "@/components/course-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { showError } from "@/utils/toast"; // Import showError

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  image_url: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCoursesAndCategories = async () => {
      setLoading(true);
      console.log("Iniciando busca de cursos e categorias...");

      try {
        console.log("Tentando buscar cursos...");
        const { data: coursesData, error: coursesError } = await supabase.from("courses").select("id, title, category, instructor, image_url").order("title", { ascending: true });
        
        console.log("Supabase courses response - data:", coursesData, "error:", coursesError); // NOVO LOG
        if (coursesError) {
          console.error("Erro ao buscar cursos do Supabase:", coursesError);
          showError("Falha ao carregar cursos: " + coursesError.message);
          setCourses([]);
        } else {
          console.log("Cursos carregados:", coursesData);
          setCourses(coursesData as Course[]);
        }

        console.log("Tentando buscar categorias...");
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("courses")
          .select("category")
          .not("category", "is", null);
        
        console.log("Supabase categories response - data:", categoriesData, "error:", categoriesError); // NOVO LOG
        if (categoriesError) {
          console.error("Erro ao buscar categorias do Supabase:", categoriesError);
        } else {
          console.log("Dados brutos de categorias:", categoriesData);
          const uniqueCategories = Array.from(new Set(categoriesData.map((c) => c.category))).filter(Boolean); // Filter out null/undefined categories
          console.log("Categorias únicas processadas:", uniqueCategories);
          setCategories(uniqueCategories as string[]);
        }
      } catch (e: any) {
        console.error("Erro inesperado durante a busca de cursos/categorias:", e);
        showError("Ocorreu um erro inesperado: " + e.message);
      } finally {
        setLoading(false);
        console.log("Busca de cursos e categorias finalizada. Loading set to false.");
      }
    };

    fetchCoursesAndCategories();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold text-center mb-10">Nossos Cursos</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                category={course.category}
                instructor={course.instructor}
                imageUrl={course.image_url}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-lg">Nenhum curso encontrado com os critérios selecionados.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CoursesPage;