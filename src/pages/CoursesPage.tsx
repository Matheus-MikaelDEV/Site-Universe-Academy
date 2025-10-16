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
      console.log("Iniciando busca de cursos..."); // Log de início
      let query = supabase.from("courses").select("*");

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }
      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { data, error } = await query.order("title", { ascending: true });
      if (error) {
        console.error("Erro ao buscar cursos:", error);
        showError("Falha ao carregar cursos: " + error.message); // Exibe erro para o usuário
      } else {
        console.log("Dados de cursos recebidos:", data); // Log dos dados recebidos
        setCourses(data as Course[]);
      }

      // Fetch unique categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("courses")
        .select("category")
        .not("category", "is", null);
      
      if (categoriesError) {
        console.error("Erro ao buscar categorias:", categoriesError);
      } else {
        const uniqueCategories = Array.from(new Set(categoriesData.map((c) => c.category)));
        setCategories(uniqueCategories as string[]);
      }
      setLoading(false);
      console.log("Busca de cursos finalizada. Loading set to false."); // Log de fim
    };

    fetchCoursesAndCategories();
  }, [searchTerm, selectedCategory]);

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
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
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