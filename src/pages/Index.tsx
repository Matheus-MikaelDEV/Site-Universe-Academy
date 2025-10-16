import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CourseCard } from "@/components/course-card";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  image_url: string;
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      // Fetch 3 courses for the homepage
      const { data, error } = await supabase.from("courses").select("*").limit(3);
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setCourses(data as Course[]);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

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
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground font-bold text-lg px-8 py-6 transition-transform duration-300 hover:scale-105"
              onClick={() => navigate('/cursos')}
            >
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;