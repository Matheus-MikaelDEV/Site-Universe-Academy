import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CourseCardProps {
  title: string;
  category: string;
  instructor: string;
  imageUrl: string;
}

export const CourseCard = ({
  title,
  category,
  instructor,
  imageUrl,
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2">{category}</Badge>
        <CardTitle className="text-lg font-bold mb-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">por {instructor}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Ver Curso
        </Button>
      </CardFooter>
    </Card>
  );
};