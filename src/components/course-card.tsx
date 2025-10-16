import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  instructor: string;
  imageUrl: string;
}

export const CourseCard = ({
  id,
  title,
  category,
  instructor,
  imageUrl,
}: CourseCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
      <CardHeader className="p-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
          loading="lazy" // Added lazy loading
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant="secondary" className="mb-2">{category}</Badge>
        <CardTitle className="text-lg font-bold mb-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">por {instructor}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => navigate(`/cursos/${id}`)}
        >
          Ver Curso
        </Button>
      </CardFooter>
    </Card>
  );
};