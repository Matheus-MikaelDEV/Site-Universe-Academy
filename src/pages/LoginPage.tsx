import { LoginForm } from "@/components/LoginForm";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">Faça login para acessar seus cursos.</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <p>
            Não tem uma conta?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/recuperar-senha" className="text-xs text-muted-foreground hover:underline">
              Esqueceu sua senha?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;