import { RegisterForm } from "@/components/RegisterForm";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground">Comece sua jornada de aprendizado hoje.</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm">
          <p>
            Já tem uma conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;