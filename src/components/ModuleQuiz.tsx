import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

interface ModuleQuizProps {
  moduleId: string;
  onQuizComplete: (score: number, total: number) => void;
}

export const ModuleQuiz = ({ moduleId, onQuizComplete }: ModuleQuizProps) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: true });

      if (error) {
        showError("Erro ao carregar quiz: " + error.message);
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [moduleId]);

  const handleOptionChange = (value: string) => {
    setSelectedOption(parseInt(value));
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !user) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correct_option_index;

    // Save user answer
    const { error } = await supabase.from("user_answers").insert({
      user_id: user.id,
      question_id: currentQuestion.id,
      selected_option_index: selectedOption,
      is_correct: isCorrect,
    });

    if (error) {
      showError("Erro ao salvar resposta: " + error.message);
    }

    if (currentQuestionIndex < questions.length - 1) {
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      const finalScore = score + (isCorrect ? 1 : 0);
      setScore(finalScore);
      setQuizCompleted(true);
      onQuizComplete(finalScore, questions.length);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter><Skeleton className="h-10 w-24 ml-auto" /></CardFooter>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Quiz do Módulo</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma pergunta disponível para este módulo ainda.</p>
        </CardContent>
      </Card>
    );
  }

  if (quizCompleted) {
    return (
      <Card>
        <CardHeader><CardTitle>Quiz Concluído!</CardTitle></CardHeader>
        <CardContent>
          <p className="text-lg">Você acertou {score} de {questions.length} perguntas.</p>
          <p className="text-muted-foreground">Parabéns por completar o quiz!</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Refazer Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz do Módulo ({currentQuestionIndex + 1}/{questions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold mb-4">{currentQuestion.question_text}</p>
        <RadioGroup onValueChange={handleOptionChange} value={selectedOption?.toString()}>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmitAnswer} disabled={selectedOption === null}>
          {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Finalizar Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
};