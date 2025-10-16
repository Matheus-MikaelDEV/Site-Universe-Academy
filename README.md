# UniVerse Academy

Bem-vindo ao UniVerse Academy, uma plataforma de e-learning inovadora projetada para capacitar professores e educadores com cursos online de alta qualidade. Nosso objetivo é transformar o aprendizado, oferecendo ferramentas e conhecimentos para liderar no cenário educacional em constante evolução.

## Visão Geral do Projeto

O UniVerse Academy é uma aplicação web completa que oferece:

*   **Catálogo de Cursos:** Uma vasta seleção de cursos com detalhes, instrutores e categorias.
*   **Autenticação de Usuários:** Login e registro seguros com gerenciamento de perfil.
*   **Painel do Aluno:** Acompanhamento do progresso do curso, conquistas (badges), certificados e pontuação.
*   **Módulos de Curso:** Conteúdo organizado em módulos com vídeos, PDFs e quizzes interativos.
*   **Quizzes:** Avaliações por módulo para testar o conhecimento dos alunos.
*   **Certificados:** Geração de certificados para cursos concluídos.
*   **Notificações:** Sistema de notificação em tempo real para usuários.
*   **Leaderboard:** Classificação dos alunos com base em pontos de aprendizado.
*   **Painel Administrativo:** Ferramentas para gerenciar cursos, módulos, perguntas, usuários, feedbacks e enviar notificações.
*   **Feedback:** Canal para os usuários enviarem sugestões e comentários.
*   **Responsividade:** Design adaptável para diferentes tamanhos de tela.
*   **Tema Claro/Escuro:** Opção de alternar entre temas claro e escuro.

## Tecnologias Utilizadas

*   **Frontend:** React, TypeScript
*   **Roteamento:** React Router DOM
*   **Estilização:** Tailwind CSS
*   **Componentes UI:** Shadcn/ui
*   **Gerenciamento de Estado/Dados:** React Query
*   **Autenticação e Banco de Dados:** Supabase
*   **Gráficos:** Recharts (para o painel administrativo)
*   **Validação de Formulários:** Zod e React Hook Form
*   **Notificações Toast:** Sonner

## Configuração do Ambiente Local

Siga estas instruções para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

Certifique-se de ter o Node.js (versão 18 ou superior) e o npm (ou Yarn) instalados.

*   [Node.js](https://nodejs.org/en/download/)
*   [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (geralmente vem com o Node.js)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Matheus-MikaelDEV/Site-Universe-Academy
    cd Site-Universe-Academy # Ou o nome da pasta do seu projeto
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuração do Supabase:**

    a.  **Crie um Projeto Supabase:**
        *   Vá para <resource-link url="https://supabase.com/">https://supabase.com/</resource-link> e crie uma nova conta ou faça login.
        *   Crie um novo projeto. Anote o `Project URL` e o `Anon Key` (também conhecido como `Public Key` ou `Publishable key`) na seção `Project Settings > API`.

    b.  **Variáveis de Ambiente:**
        Crie um arquivo `.env` na raiz do seu projeto com as seguintes variáveis:
        ```
        VITE_SUPABASE_URL="SUA_URL_DO_PROJETO_SUPABASE"
        VITE_SUPABASE_ANON_KEY="SUA_ANON_KEY_DO_PROJETO_SUPABASE"
        ```

    c.  **Configuração do Banco de Dados (SQL):**
        Você precisará configurar o esquema do banco de dados, incluindo tabelas, RLS (Row Level Security), funções e triggers.

        **Tabelas Essenciais:**
        *   `profiles`: Armazena informações adicionais do usuário (nome completo, CPF, avatar, pontos, role).
        *   `courses`: Detalhes dos cursos (título, descrição, instrutor, categoria, imagem).
        *   `modules`: Módulos dentro de cada curso (título, descrição, URLs de vídeo/PDF).
        *   `questions`: Perguntas para os quizzes dos módulos.
        *   `user_answers`: Respostas dos usuários aos quizzes.
        *   `course_enrollments`: Inscrições de usuários em cursos.
        *   `course_progress`: Progresso do usuário em módulos específicos.
        *   `user_badges`: Conquistas (badges) dos usuários.
        *   `certificates`: Certificados emitidos para cursos concluídos.
        *   `notifications`: Notificações enviadas aos usuários.
        *   `feedbacks`: Mensagens de feedback dos usuários.

        **RLS (Row Level Security):**
        É **CRÍTICO** habilitar RLS em todas as tabelas e criar políticas adequadas para cada operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) para garantir a segurança dos dados. As políticas devem garantir que os usuários só possam acessar/modificar seus próprios dados, a menos que haja uma necessidade específica de acesso público (como visualizar cursos).

        **Funções e Triggers:**
        O projeto utiliza funções e triggers para automatizar processos, como:
        *   `handle_new_user()`: Cria um perfil na tabela `profiles` automaticamente após o registro de um novo usuário no `auth.users`.
        *   `update_user_points_on_activity()`: Atualiza os pontos do usuário ao completar módulos ou responder quizzes corretamente.
        *   `award_badge_on_course_completion()`: Concede um badge ao usuário quando todos os módulos de um curso são concluídos.
        *   `on_course_enrollment_completed()`: Gera um certificado quando um curso é marcado como concluído.
        *   `get_monthly_signups()`: Função RPC para obter o número de novos usuários por mês (usado no painel admin).
        *   `is_admin()`: Função para verificar se o usuário logado tem a role de 'admin'.

        Você pode encontrar os scripts SQL para criar essas tabelas, RLS, funções e triggers na documentação do Supabase ou gerá-los a partir do seu esquema existente.

        **Exemplo de criação da tabela `profiles` com RLS e trigger:**
        ```sql
        -- Tipo ENUM para roles de usuário
        CREATE TYPE public.user_role AS ENUM ('user', 'admin');

        -- Create profiles table
        CREATE TABLE public.profiles (
          id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT,
          avatar_url TEXT,
          role user_role DEFAULT 'user'::user_role,
          cpf TEXT,
          points INTEGER DEFAULT 0,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id)
        );

        -- Enable RLS (REQUIRED for security)
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Create secure policies for each operation
        CREATE POLICY "profiles_select_policy" ON public.profiles
        FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

        CREATE POLICY "profiles_insert_policy" ON public.profiles
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

        CREATE POLICY "profiles_update_policy" ON public.profiles
        FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

        CREATE POLICY "profiles_delete_policy" ON public.profiles
        FOR DELETE TO authenticated USING (auth.uid() = id OR public.is_admin());

        -- Function to insert profile when user signs up
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER
        LANGUAGE PLPGSQL
        SECURITY DEFINER SET search_path = ''
        AS $$
        BEGIN
          INSERT INTO public.profiles (id, full_name, cpf)
          VALUES (
            new.id,
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'cpf'
          );
          RETURN new;
        END;
        $$;

        -- Trigger the function on user creation
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        ```
        **Lembre-se de criar as outras tabelas e suas respectivas políticas RLS e triggers conforme a estrutura do projeto.**

### Executando a Aplicação

1.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```

2.  Abra seu navegador e acesse `http://localhost:8080` (ou a porta indicada no terminal).

## Acesso Administrativo

Para conceder acesso de administrador a um usuário:

1.  Faça login no seu painel do Supabase.
2.  Vá para a seção `Table Editor`.
3.  Encontre a tabela `public.profiles`.
4.  Localize o perfil do usuário que você deseja tornar administrador.
5.  Edite a coluna `role` desse perfil de `user` para `admin`.

O usuário precisará fazer logout e login novamente na aplicação para que a alteração de permissão seja reconhecida.

## Estrutura de Pastas

```
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   └── ui/
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase/
│   ├── lib/
│   ├── pages/
│   │   └── admin/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── globals.css
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Contribuindo

Contribuições são bem-vindas! Se você deseja melhorar este projeto, por favor:

1.  Faça um fork do repositório.
2.  Crie uma nova branch (`git checkout -b feature/sua-feature`).
3.  Faça suas alterações e commit (`git commit -m 'Adiciona nova feature'`).
4.  Envie para a branch (`git push origin feature/sua-feature`).
5.  Abra um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
