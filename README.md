📚 Plataforma de Cursos

Este projeto é uma plataforma de cursos online com área de membros, construída com React + Vite, Supabase e TailwindCSS.
Ele conta com dois níveis de acesso: Administrador e Usuário.

⚙️ Tecnologias Utilizadas

Frontend: React, Vite, TypeScript, TailwindCSS, ShadCN/UI

Backend & Autenticação: Supabase (PostgreSQL, Auth, Edge Functions)

Infraestrutura: Docker, Nginx

Gerenciamento de dependências: npm

🚀 Funcionalidades
Usuário

Cadastro e login com Supabase Auth

Listagem de cursos disponíveis

Inscrição em cursos

Player de vídeo com módulos e aulas

Download de materiais adicionais (PDF, ZIP, etc.)

Acompanhamento de progresso e conclusão de curso

Administrador

Criação e edição de cursos

Organização de cursos em módulos e aulas

Upload de vídeos (ou link do YouTube)

Upload de materiais extras

Gerenciamento de usuários e inscrições

🛠️ Instalação e Configuração
1. Clone o repositório
git clone <URL_DO_REPO>
cd <NOME_DO_PROJETO>

2. Instale as dependências
npm install

3. Configure o Supabase

Edite o arquivo .env e adicione suas credenciais do Supabase:

VITE_SUPABASE_URL=https://<PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>

4. Inicie o servidor de desenvolvimento
npm run dev

📦 Build para Produção
npm run build


O build final ficará disponível na pasta dist/.

🐳 Docker

O projeto possui suporte a Docker. Para rodar:

docker build -t cursos-app .
docker run -p 3000:3000 cursos-app

📂 Estrutura do Projeto
/src
 ├── components       # Componentes React (Admin, Usuário, UI)
 ├── pages            # Páginas principais
 ├── hooks            # Hooks customizados
 ├── lib              # Configurações e helpers
 ├── App.tsx          # Roteamento principal
 └── main.tsx         # Ponto de entrada
/supabase
 ├── config.toml      # Configuração do Supabase
 ├── functions        # Funções Edge (ex: create-user, update-user)
 └── migrations       # Scripts SQL para o banco

✅ Roadmap Futuro

Sistema de certificados de conclusão

Relatórios de desempenho de usuários

Integração com meios de pagamento